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


def get_cookie():
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
    return cookie, user_code


def test_new_user_group():
    cookie, user_code = get_cookie()
    res = client.post('/user_group/new',
                      json={
                          "group_name": "test",
                          "owner": user_code
                      },
                      cookies=cookie)
    assert res.json()['success'] is True

    res = db.find_user_group_by_owner(user_code)
    assert len(res) == 1
    code = res[0].group_code

    res = db.list_user_to_user_group_by_group(code)
    assert len(res) == 1


def test_delete_user_group():
    cookie, user_code = get_cookie()
    res = client.post('/user_group/new',
                      json={
                          "group_name": "test",
                          "owner": user_code
                      },
                      cookies=cookie)
    assert res.json()['success'] is True

    res = db.find_user_group_by_owner(user_code)
    assert len(res) == 1
    code = res[0].group_code

    res = client.post('/user_group/delete',
                      json={
                          "group_code": code
                      },
                      cookies=cookie)
    assert res.json()['success'] is True

    res = db.find_user_group_by_owner(user_code)
    assert len(res) == 0

    res = db.list_user_to_user_group_by_group(code)
    assert len(res) == 0


def test_change_user_group():
    cookie, user_code = get_cookie()
    res = client.post('/user_group/new',
                      json={
                          "group_name": "test",
                          "owner": user_code
                      },
                      cookies=cookie)
    assert res.json()['success'] is True

    res = client.get(f'/user_group/query_group?user_code={user_code}',
                     cookies=cookie)
    assert len(res.json()) > 0
    code = res.json()["data"][0]["group_code"]

    res = client.post('/user_group/change',
                      json={
                          "group_code": code,
                          "group_name": "foo",
                          "owner": user_code,
                          "members": f"{user_code}"
                      },
                      cookies=cookie)
    assert res.json()['success'] is True
    res = client.get(f'/user_group/query_group?user_code={user_code}',
                     cookies=cookie)
    assert len(res.json()) > 0
    assert res.json()["data"][0]["group_name"] == "foo"


def test_add_user_group():
    cookie, user_code = get_cookie()
    res = client.post('/user_group/new',
                      json={
                          "group_name": "test",
                          "owner": user_code
                      },
                      cookies=cookie)
    assert res.json()['success'] is True

    res = client.get(f'/user_group/query_group?user_code={user_code}',
                     cookies=cookie)
    assert len(res.json()) > 0
    group_code = res.json()["data"][0]["group_code"]

    res = client.post('/users/sign_up',
                      json={
                          "user_name": "test",
                          "passwd": "test",
                          "email": "test2"
                      })
    assert res.json()['success'] is True

    res = client.post('/users/sign_in',
                      json={
                          "user_name": "test2",
                          "passwd": "test",
                          "email": "test2"
                      })
    assert res.json()['success'] is True
    new_member_code = res.json()['user']['user_code']
    new_member_token = res.json()['token']
    cookie = httpx.Cookies()
    cookie.set(name="current_user",
               value=f"{new_member_code}:{new_member_token}")
    res = client.post('/user_group/add',
                      json={
                          "group_code": group_code,
                          "new_member": new_member_code
                      },
                      cookies=cookie)
    assert res.json()['success'] is True

    res = client.get(f'/user_group/list_groups?group_code={group_code}',
                     cookies=cookie)
    assert res.json()['success'] is True
    assert len(res.json()['data'][0]['members']) == 2


def test_list_groups_by_condition():
    cookie, user_code = get_cookie()
    res = client.post('/user_group/new',
                      json={
                          "group_name": "test1",
                          "owner": user_code,
                          "members": "A,B"
                      },
                      cookies=cookie)
    assert res.json()['success'] is True

    res = client.post('/user_group/new',
                      json={
                          "group_name": "test2",
                          "owner": user_code,
                          "members": "B,C"
                      },
                      cookies=cookie)
    assert res.json()['success'] is True

    res = client.get('/user_group/list_groups?members=B',
                     cookies=cookie)
    assert res.json()['success'] is True
    assert len(res.json()['data']) == 2

    res = client.get('/user_group/list_groups?members=C',
                     cookies=cookie)
    assert res.json()['success'] is True
    assert len(res.json()['data']) == 1

    res = client.get('/user_group/list_groups?members=B&group_name=test1',
                     cookies=cookie)
    assert res.json()['success'] is True
    assert len(res.json()['data']) == 1


def test_count_groups_by_condition():
    cookie, user_code = get_cookie()
    res = client.post('/user_group/new',
                      json={
                          "group_name": "test1",
                          "owner": user_code,
                          "members": "A,B"
                      },
                      cookies=cookie)
    assert res.json()['success'] is True

    res = client.post('/user_group/new',
                      json={
                          "group_name": "test2",
                          "owner": user_code,
                          "members": "B,C"
                      },
                      cookies=cookie)
    assert res.json()['success'] is True

    res = client.get('/user_group/count_groups?members=B',
                     cookies=cookie)
    assert res.json()['success'] is True
    assert res.json()['data'] == 2

    res = client.get('/user_group/count_groups?members=C',
                     cookies=cookie)
    assert res.json()['success'] is True
    assert res.json()['data'] == 1

    res = client.get('/user_group/count_groups?members=B&group_name=test1',
                     cookies=cookie)
    assert res.json()['success'] is True
    assert res.json()['data'] == 1
