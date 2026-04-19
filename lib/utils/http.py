"""HTTP session and URL reachability helpers."""

import logging

import requests

DEFAULT_TIMEOUT = 10
DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"
)


def make_session(user_agent=DEFAULT_USER_AGENT):
    session = requests.Session()
    session.headers.update({"User-Agent": user_agent})
    return session


def check_url(url, session=None, timeout=DEFAULT_TIMEOUT):
    """Return (ok, status_code). ok=True for 2xx/3xx; returns (True, None) on transport error."""
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
