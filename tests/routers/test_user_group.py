import httpx
import pytest

from fastapi.testclient import TestClient

from issuer import db
from issuer.db import delete_all_user_to_user_group, delete_all_user_groups, \
    delete_all_users
from issuer.main import app


client = TestClient(app)


def setup_function(function):
    delete_all_users()
    delete_all_user_to_user_group()
    delete_all_user_groups()


def teardown_function(function):
    delete_all_users()
    delete_all_user_to_user_group()
    delete_all_user_groups()


def _get_cookie() -> "httpx.Cookie":
    res = client.post('/users/sign_up',
                      json={
                          "user_name": "test",
                          "passwd": "test",
                          "email": "test"
                      })
    assert res.json()['success'] is True

    res = client.post('/users/sign_in',
                      json={
                          "user_name": "test",
                          "passwd": "test",
                          "email": "test"
                      })
    assert res.json()['success'] is True
    assert res.json()['user']['user_name'] == "test"

    token = res.json()['token']
    user_code = res.json()['user']['user_code']
    cookie = httpx.Cookies()
    cookie.set(name="current_user", value=f"{user_code}:{token}")
    return cookie


def test_new_user_group():
    cookie = _get_cookie()
    res = client.post('/user_group/new',
                      json={
                          "group_name": "test",
                          "owner": "test"
                      },
                      cookies=cookie)
    assert res.json()['success'] is True

    res = db.find_user_group_by_owner("test")
    assert len(res) == 1
    code = res[0].group_code

    res = db.find_user_to_user_group_by_group(code)
    assert len(res) == 1


def test_delete_user_group():
    cookie = _get_cookie()
    res = client.post('/user_group/new',
                      json={
                          "group_name": "test",
                          "owner": "test"
                      },
                      cookies=cookie)
    assert res.json()['success'] is True

    res = db.find_user_group_by_owner("test")
    assert len(res) == 1
    code = res[0].group_code

    res = client.post('/user_group/delete',
                      json={
                          "group_code": code
                      },
                      cookies=cookie)
    assert res.json()['success'] is True

    res = db.find_user_group_by_owner("test")
    assert len(res) == 0

    res = db.find_user_to_user_group_by_group(code)
    assert len(res) == 0


def test_change_user_group():
    cookie = _get_cookie()
    res = client.post('/user_group/new',
                      json={
                          "group_name": "test",
                          "owner": "test"
                      },
                      cookies=cookie)
    assert res.json()['success'] is True

    res = client.get('/user_group/query_group?user_code=test',
                     cookies=cookie)
    assert res.json()['success'] is True
    code = res.json()['user_groups'][0]["group_code"]

    res = client.post('/user_group/change',
                      json={
                          "group_code": code,
                          "group_name": "foo",
                          "owner": "test",
                          "members": "test"
                      },
                      cookies=cookie)
    assert res.json()['success'] is True
    res = client.get('/user_group/query_group?user_code=test',
                     cookies=cookie)
    assert res.json()['success'] is True
    assert res.json()['user_groups'][0]["group_name"] == "foo"


def test_query_user_group_by_code():
    cookie = _get_cookie()
    res = client.post('/user_group/new',
                      json={
                          "group_name": "test",
                          "owner": "test"
                      },
                      cookies=cookie)
    assert res.json()['success'] is True

    res = client.get('/user_group/query_group?user_code=test',
                     cookies=cookie)
    assert res.json()['success'] is True
    code = res.json()['user_groups'][0]["group_code"]

    res = client.get(f'/user_group/query?group_code={code}',
                     cookies=cookie)
    print(res.json())
    assert res.json()['owner'] == "test"
