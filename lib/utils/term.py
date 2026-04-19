"""ANSI colors and logging configuration."""

import logging
import os
import sys

_COLOR_CODES = {"red": 31, "green": 32, "yellow": 33, "cyan": 36, "bold": 1, "dim": 2}


def setup_logging(level="INFO"):
    logging.basicConfig(
        level=getattr(logging, str(level).upper(), logging.INFO),
        format="%(levelname)s [%(filename)s] %(message)s",
        stream=sys.stderr,
    )


def make_colors(enabled=None):
    """Return {name: callable(str) -> str}; no-ops when colors disabled."""
    if enabled is None:
        enabled = sys.stderr.isatty() and not os.environ.get("NO_COLOR")
    if not enabled:
        return {name: (lambda s: s) for name in _COLOR_CODES}
    return {name: (lambda s, c=code: f"\033[{c}m{s}\033[0m") for name, code in _COLOR_CODES.items()}
