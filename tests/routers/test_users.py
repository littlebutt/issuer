import httpx
import pytest

from fastapi.testclient import TestClient

from issuer.db.users import delete_all_users, find_user_by_code
from issuer.main import app

client = TestClient(app)


def test_sign_up():
    delete_all_users()
    res = client.post('/users/sign_up',
                      json={
                          "user_name": "test",
                          "passwd": "test",
                          "email": "test"
                      })
    print(res.json())
    assert res.json()['success'] is True
    delete_all_users()


def test_sign_in():
    delete_all_users()
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
    res = client.post('/users/sign_in',
                      cookies=cookie,
                      json={
                          "user_name": "foo",
                          "passwd": "test",
                          "email": "foo"
                      })
    assert res.json()['success'] is True and \
        res.json()['reason'] == "Valid token"

    res = client.post('/users/sign_in',
                      json={
                          "user_name": "bar",
                          "passwd": "test",
                          "email": "foo"
                      })
    assert res.json()['success'] is False and \
        res.json()['reason'] == "Not exist"

    res = client.post('/users/sign_in',
                      json={
                          "user_name": "test",
                          "passwd": "foo",
                          "email": "test"
                      })
    assert res.json()['success'] is False and \
        res.json()['reason'] == "Wrong passwd"
    delete_all_users()


def test_sign_out():
    delete_all_users()
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

    user_code = res.json()['user']['user_code']
    res = client.post('/users/sign_out',
                      json={
                          "user_code": user_code
                      })
    print(res.json())
    assert res.json()['success'] is True
    _user = find_user_by_code(user_code)
    assert _user.token is None
    delete_all_users()


def test_cancel():
    delete_all_users()
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

    user_code = res.json()['user']['user_code']
    res = client.post('/users/cancel',
                      json={
                          "user_code": user_code
                      })
    assert res.json()['success'] is True
