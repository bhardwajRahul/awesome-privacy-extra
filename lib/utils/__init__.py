"""Shared helpers for lib/ scripts. Re-exports the public API of each submodule."""

from .data import DATA_PATH, PROJECT_ROOT, iter_services, load_yaml, slugify
from .github import (
    AI_BOT_AUTHORS,
    commit_has_bot,
    fetch_repo,
    gh_get,
    parse_github_field,
    repo_age_days,
    repo_has_license,
    repo_is_archived,
    repo_is_fork,
    repo_pushed_days_ago,
)
from .http import DEFAULT_TIMEOUT, DEFAULT_USER_AGENT, check_url, make_session
from .term import make_colors, setup_logging

__all__ = [
    "AI_BOT_AUTHORS",
    "DATA_PATH",
    "DEFAULT_TIMEOUT",
    "DEFAULT_USER_AGENT",
    "PROJECT_ROOT",
    "check_url",
    "commit_has_bot",
    "fetch_repo",
    "gh_get",
    "iter_services",
    "load_yaml",
    "make_colors",
    "make_session",
    "parse_github_field",
    "repo_age_days",
    "repo_has_license",
    "repo_is_archived",
    "repo_is_fork",
    "repo_pushed_days_ago",
    "setup_logging",
    "slugify",
]
