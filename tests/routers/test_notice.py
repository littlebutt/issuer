from fastapi.testclient import TestClient
import pytest

from issuer.db.users import delete_all_users
from issuer.main import app
from issuer.db.notice import delete_all_notices
from tests.routers.test_user_group import get_cookie


client = TestClient(app)


def setup_function(function):
    delete_all_users()
    delete_all_notices()


def teardown_function(function):
    delete_all_users()
    delete_all_notices()


def test_new_notice():
    cookie, user_code = get_cookie()
    res = client.post('/notice/new',
                      json={
                          "content": "test"
                      },
                      cookies=cookie)
    assert res.json()["success"] is True


def test_list_notices():
    cookie, user_code = get_cookie()
    res = client.post('/notice/new',
                      json={
                          "content": "test"
                      },
                      cookies=cookie)
    assert res.json()["success"] is True

    res = client.get('/notice/list_notices',
                     cookies=cookie)
    assert len(res.json()["data"]) > 0
