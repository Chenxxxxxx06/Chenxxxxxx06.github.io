#!/usr/bin/env bash
set -euo pipefail

# Requires Ruby and Bundler on PATH. Run from the repository root.
bundle exec jekyll serve --livereload "$@"
