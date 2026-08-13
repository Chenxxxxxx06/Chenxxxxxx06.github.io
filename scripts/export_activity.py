#!/usr/bin/env python3
"""Export privacy-safe homepage activity data from GitHub and CC Switch.

The generated JSON contains daily aggregate counts only. It never exports
provider IDs, model names, prompts, costs, API keys, or request content.
"""

from __future__ import annotations

import argparse
import json
import os
import sqlite3
import subprocess
from collections import defaultdict
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path
from typing import Any


CHINA_TZ = timezone(timedelta(hours=8))
CACHE_INCLUSIVE_APPS = {"codex", "gemini", "grokbuild"}


def parse_args() -> argparse.Namespace:
    default_db = Path(os.environ.get("USERPROFILE", "~")) / ".cc-switch" / "cc-switch.db"
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db", type=Path, default=default_db, help="CC Switch SQLite database")
    parser.add_argument("--github-user", default="Chenxxxxxx06", help="GitHub login")
    parser.add_argument(
        "--output",
        type=Path,
        action="append",
        required=True,
        help="Output JSON path. Repeat to update source and local preview copies.",
    )
    return parser.parse_args()


def normalized_input(row: sqlite3.Row) -> int:
    """Match CC Switch's fresh_input_sql normalization."""
    value = max(0, int(row["input_tokens"] or 0))
    cache_read = max(0, int(row["cache_read_tokens"] or 0))
    cache_create = max(0, int(row["cache_creation_tokens"] or 0))
    semantics = int(row["input_token_semantics"] or 0)
    app_type = str(row["app_type"] or "").lower()

    if semantics == 2:
        return value
    if app_type in CACHE_INCLUSIVE_APPS and semantics == 1:
        cached = cache_read + cache_create
        return value - cached if value >= cached else value
    if app_type in CACHE_INCLUSIVE_APPS and semantics == 0:
        return value - cache_read if value >= cache_read else value
    return value


def empty_days(start: date, end: date) -> dict[str, dict[str, int]]:
    days: dict[str, dict[str, int]] = {}
    current = start
    while current <= end:
        days[current.isoformat()] = {"tokens": 0, "requests": 0}
        current += timedelta(days=1)
    return days


def read_cc_switch(db_path: Path, start: date, end: date) -> dict[str, Any]:
    if not db_path.exists():
        raise FileNotFoundError(f"CC Switch database not found: {db_path}")

    uri = f"file:{db_path.resolve().as_posix()}?mode=ro"
    connection = sqlite3.connect(uri, uri=True, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA query_only = ON")
    connection.execute("PRAGMA busy_timeout = 10000")

    totals = {"tokens": 0, "requests": 0}
    by_day: dict[str, dict[str, int]] = defaultdict(lambda: {"tokens": 0, "requests": 0})

    try:
        rollup_rows = connection.execute(
            """
            SELECT date, app_type, request_count, input_tokens, output_tokens,
                   cache_read_tokens, cache_creation_tokens, input_token_semantics
              FROM usage_daily_rollups
            """
        )
        for row in rollup_rows:
            real_tokens = (
                normalized_input(row)
                + max(0, int(row["output_tokens"] or 0))
                + max(0, int(row["cache_read_tokens"] or 0))
                + max(0, int(row["cache_creation_tokens"] or 0))
            )
            request_count = max(0, int(row["request_count"] or 0))
            day = str(row["date"])
            totals["tokens"] += real_tokens
            totals["requests"] += request_count
            by_day[day]["tokens"] += real_tokens
            by_day[day]["requests"] += request_count

        raw_rows = connection.execute(
            """
            SELECT created_at, app_type, input_tokens, output_tokens,
                   cache_read_tokens, cache_creation_tokens, input_token_semantics
              FROM proxy_request_logs
            """
        )
        for row in raw_rows:
            real_tokens = (
                normalized_input(row)
                + max(0, int(row["output_tokens"] or 0))
                + max(0, int(row["cache_read_tokens"] or 0))
                + max(0, int(row["cache_creation_tokens"] or 0))
            )
            day = datetime.fromtimestamp(int(row["created_at"]), CHINA_TZ).date().isoformat()
            totals["tokens"] += real_tokens
            totals["requests"] += 1
            by_day[day]["tokens"] += real_tokens
            by_day[day]["requests"] += 1
    finally:
        connection.close()

    period = empty_days(start, end)
    for day, values in by_day.items():
        if day in period:
            period[day] = values

    return {
        "total_tokens": totals["tokens"],
        "total_requests": totals["requests"],
        "period_tokens": sum(item["tokens"] for item in period.values()),
        "period_requests": sum(item["requests"] for item in period.values()),
        "days": [{"date": day, **values} for day, values in period.items()],
    }


def run_github_query(login: str, start: date, end: date) -> dict[str, Any]:
    query = """
    query($login:String!, $from:DateTime!, $to:DateTime!) {
      user(login:$login) {
        contributionsCollection(from:$from, to:$to) {
          contributionCalendar {
            totalContributions
            weeks { contributionDays { date contributionCount } }
          }
        }
      }
    }
    """
    from_dt = datetime.combine(start, time.min, CHINA_TZ).astimezone(timezone.utc)
    to_dt = datetime.combine(end + timedelta(days=1), time.min, CHINA_TZ).astimezone(timezone.utc)
    command = [
        "gh", "api", "graphql",
        "-f", f"query={query}",
        "-F", f"login={login}",
        "-F", f"from={from_dt.isoformat().replace('+00:00', 'Z')}",
        "-F", f"to={to_dt.isoformat().replace('+00:00', 'Z')}",
    ]
    completed = subprocess.run(command, capture_output=True, text=True, check=True)
    payload = json.loads(completed.stdout)
    user = payload.get("data", {}).get("user")
    if not user:
        raise RuntimeError(f"GitHub user not found: {login}")

    calendar = user["contributionsCollection"]["contributionCalendar"]
    counts: dict[str, int] = {}
    for week in calendar.get("weeks", []):
        for item in week.get("contributionDays", []):
            counts[item["date"]] = int(item["contributionCount"])

    current = start
    days = []
    while current <= end:
        key = current.isoformat()
        days.append({"date": key, "count": counts.get(key, 0)})
        current += timedelta(days=1)

    return {
        "login": login,
        "total_contributions": sum(item["count"] for item in days),
        "days": days,
    }


def read_previous(paths: list[Path]) -> dict[str, Any] | None:
    for path in paths:
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (FileNotFoundError, json.JSONDecodeError, OSError):
            continue
    return None


def main() -> int:
    args = parse_args()
    today = datetime.now(CHINA_TZ).date()
    # 183 inclusive days keeps the public heatmaps focused on the last six months.
    start = today - timedelta(days=182)
    previous = read_previous(args.output)
    warnings: list[str] = []

    ai = read_cc_switch(args.db, start, today)
    try:
        github = run_github_query(args.github_user, start, today)
    except (OSError, subprocess.SubprocessError, json.JSONDecodeError, RuntimeError) as error:
        if previous and previous.get("github"):
            github = previous["github"]
            warnings.append(f"GitHub refresh used cached data: {error}")
        else:
            raise

    payload = {
        "generated_at": datetime.now(CHINA_TZ).isoformat(timespec="seconds"),
        "refresh_interval_hours": 6,
        "period": {"start": start.isoformat(), "end": today.isoformat()},
        "github": github,
        "ai": ai,
    }
    if warnings:
        payload["warnings"] = warnings

    encoded = json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n"
    for output in args.output:
        output.parent.mkdir(parents=True, exist_ok=True)
        temporary = output.with_suffix(output.suffix + ".tmp")
        temporary.write_text(encoded, encoding="utf-8")
        temporary.replace(output)
        print(f"Updated {output}")
    print(
        f"GitHub: {github['total_contributions']} contributions; "
        f"AI: {ai['total_tokens']:,} tokens across {ai['total_requests']:,} requests"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
