"""Shared helpers for lib/ scripts: YAML loading, HTTP, GitHub API, ANSI colors."""

import logging
import os
import re
import sys

import requests
import yaml

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(PROJECT_ROOT, "awesome-privacy.yml")

DEFAULT_TIMEOUT = 10
DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"
)

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


def load_yaml(path=DATA_PATH):
    with open(path) as f:
        return yaml.safe_load(f)


def iter_services(data):
    """Yield (category_name, section_name, service_dict) for every service."""
    for cat in data.get("categories", []) or []:
        cat_name = cat.get("name", "")
        for sec in cat.get("sections", []) or []:
            sec_name = sec.get("name", "")
            for svc in sec.get("services", []) or []:
                yield cat_name, sec_name, svc


def slugify(title):
    """Match the slug format used by awesome-privacy.xyz and the README generator."""
    if not title:
        return ""
    title = re.sub(r"[+&]", "and", title.lower())
    title = re.sub(r"\s+", "-", title)
    return re.sub(r"[^a-z0-9-]", "", title)


def parse_github_field(value):
    """Parse a `github` field into (owner, repo), or (None, None) on failure."""
    if not value:
        return None, None
    if value.startswith(("https://github.com/", "http://github.com/")):
        value = value.split("github.com/", 1)[1]
    parts = value.strip("/").split("/")
    if len(parts) >= 2 and parts[0] and parts[1]:
        return parts[0], parts[1]
    return None, None


def make_session(user_agent=DEFAULT_USER_AGENT):
    session = requests.Session()
    session.headers.update({"User-Agent": user_agent})
    return session


def check_url(url, session=None, timeout=DEFAULT_TIMEOUT):
    """Return (ok, status_code). ok=True for 2xx/3xx; on transport error returns (True, None)."""
    session = session or make_session()
    try:
        resp = session.head(url, timeout=timeout, allow_redirects=True)
        if resp.status_code >= 400:
            resp = session.get(url, timeout=timeout, allow_redirects=True, stream=True)
            resp.close()
        return resp.status_code < 400, resp.status_code
    except requests.RequestException as exc:
        logging.debug("URL check error for %s: %s", url, exc)
        return True, None


def gh_get(path, token, session=None, params=None, timeout=DEFAULT_TIMEOUT, label=""):
    """GET https://api.github.com{path}. Returns parsed JSON on 200, else None."""
    session = session or make_session()
    headers = {"Accept": "application/vnd.github.v3+json"}
    if token:
        headers["Authorization"] = f"token {token}"
    try:
        resp = session.get(
            f"https://api.github.com{path}",
            headers=headers, params=params, timeout=timeout,
        )
    except requests.RequestException as exc:
        logging.warning("[%s] request error for %s: %s", label, path, exc)
        return None
    remaining = resp.headers.get("X-RateLimit-Remaining")
    if remaining is not None:
        try:
            if int(remaining) < 50:
                logging.warning("[%s] GitHub rate limit low: %s/%s remaining",
                                label, remaining, resp.headers.get("X-RateLimit-Limit"))
        except ValueError:
            pass
    if resp.status_code == 200:
        return resp.json()
    if resp.status_code != 404:
        logging.warning("[%s] HTTP %d from %s", label, resp.status_code, path)
    return None
