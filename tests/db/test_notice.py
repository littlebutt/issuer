import pytest

from issuer.db import delete_all_notices, insert_notice, list_notices, \
    delete_notice_by_code
from issuer.db.models import Notice


def setup_function(function):
    delete_all_notices()


def teardown_function(function):
    delete_all_notices()


def test_insert_notice():
    res = insert_notice(Notice(content="test"))
    assert res is not None


def test_list_notices():
    res = insert_notice(Notice(content="test"))
    assert res is not None

    res = list_notices(limit=10)
    assert len(res) > 0


def test_delete_notice_by_code():
    res = insert_notice(Notice(content="test"))
    assert res is not None

    res = delete_notice_by_code(res)
    assert res is True
