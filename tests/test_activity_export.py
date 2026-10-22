"""Regression checks for the aggregate-only public activity exporter."""

import contextlib
import importlib.util
import io
import json
import sqlite3
import tempfile
import unittest
from datetime import date
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch


SPEC = importlib.util.spec_from_file_location(
    "activity_export", Path(__file__).parents[1] / "scripts" / "export_activity.py"
)
exporter = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(exporter)


class ActivityExportTests(unittest.TestCase):
    def test_recorded_coverage_does_not_invent_zero_days_after_last_sync(self):
        with tempfile.TemporaryDirectory() as directory:
            database = Path(directory) / "usage.db"
            connection = sqlite3.connect(database)
            connection.executescript("""
                CREATE TABLE usage_daily_rollups (
                    date TEXT, app_type TEXT, request_count INTEGER,
                    input_tokens INTEGER, output_tokens INTEGER,
                    cache_read_tokens INTEGER, cache_creation_tokens INTEGER,
                    input_token_semantics INTEGER
                );
                CREATE TABLE proxy_request_logs (
                    created_at INTEGER, app_type TEXT,
                    input_tokens INTEGER, output_tokens INTEGER,
                    cache_read_tokens INTEGER, cache_creation_tokens INTEGER,
                    input_token_semantics INTEGER
                );
                INSERT INTO usage_daily_rollups VALUES
                    ('2026-10-17', 'codex', 1, 100, 20, 40, 10, 1);
                INSERT INTO proxy_request_logs VALUES
                    (1792342800, 'claude', 10, 5, 2, 3, 2);
            """)
            connection.commit()
            connection.close()
            result = exporter.read_cc_switch(database, date(2026, 10, 1), date(2026, 10, 22))
        self.assertEqual(result["period"], {"start": "2026-10-17", "end": "2026-10-19"})
        self.assertEqual(result["period_tokens"], 140)
        self.assertEqual(result["period_requests"], 2)
        self.assertEqual([day["date"] for day in result["days"]],
                         ["2026-10-17", "2026-10-18", "2026-10-19"])
        self.assertEqual(result["days"][1]["tokens"], 0)

    def test_unknown_public_tooltip_is_not_silently_counted_as_zero(self):
        html = ('<td class="ContributionCalendar-day" data-date="2026-10-22" id="day"></td>'
                '<tool-tip for="day">Unexpected upstream format</tool-tip>')
        with patch.object(exporter.urllib.request, "urlopen", return_value=io.BytesIO(html.encode())):
            with self.assertRaisesRegex(RuntimeError, "Unrecognized"):
                exporter.run_github_public_query("example", date(2026, 10, 22), date(2026, 10, 22))

    def test_partial_public_calendar_is_not_padded_with_fabricated_zero_counts(self):
        html = ('<td class="ContributionCalendar-day" data-date="2026-10-22" id="day"></td>'
                '<tool-tip for="day">1 contribution on October 22.</tool-tip>')
        with patch.object(exporter.urllib.request, "urlopen", return_value=io.BytesIO(html.encode())):
            with self.assertRaisesRegex(RuntimeError, "incomplete"):
                exporter.run_github_public_query("example", date(2026, 10, 21), date(2026, 10, 22))

    def test_cached_fallback_keeps_actual_period_and_discards_private_error_details(self):
        private_marker = "PRIVATE-MACHINE-PATH"
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "activity.json"
            output.write_text(json.dumps({"github": {
                "login": "example", "days": [{"date": "2026-09-18", "count": 3}],
                "total_contributions": 3, "debug": private_marker
            }, "warnings": [private_marker]}), encoding="utf-8")
            args = SimpleNamespace(db=Path(directory) / "usage.db", github_user="example", output=[output])
            ai = {"total_tokens": 1, "total_requests": 1, "days": []}
            with patch.object(exporter, "parse_args", return_value=args), \
                 patch.object(exporter, "read_cc_switch", return_value=ai), \
                 patch.object(exporter, "run_github_query", side_effect=OSError(private_marker)), \
                 patch.object(exporter, "run_github_public_query", side_effect=OSError(private_marker)), \
                 contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
                exporter.main()
            encoded = output.read_text(encoding="utf-8")
        self.assertNotIn(private_marker, encoded)
        payload = json.loads(encoded)
        self.assertEqual(payload["github"]["period"], {"start": "2026-09-18", "end": "2026-09-18"})
        self.assertEqual(payload["github"]["total_contributions"], 3)


if __name__ == "__main__":
    unittest.main()
