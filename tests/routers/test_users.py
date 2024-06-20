import os
import httpx
import pytest

from fastapi.testclient import TestClient

from issuer.db.users import delete_all_users, find_user_by_code
from issuer.main import app


client = TestClient(app)


def setup_function(function):
    delete_all_users()


def teardown_function(function):
    delete_all_users()


def test_sign_up():
    res = client.post('/users/sign_up',
                      json={
                          "user_name": "test",
                          "passwd": "test",
                          "email": "test"
                      })
    print(res.json())
    assert res.json()['success'] is True


def test_sign_in():
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


def test_sign_out():
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

    token = res.json()['token']
    user_code = res.json()['user']['user_code']
    cookie = httpx.Cookies()
    cookie.set(name="current_user", value=f"{user_code}:{token}")

    user_code = res.json()['user']['user_code']
    res = client.post('/users/sign_out',
                      json={
                          "user_code": user_code
                      },
                      cookies=cookie)
    print(res.json())
    assert res.json()['success'] is True
    _user = find_user_by_code(user_code)
    assert _user.token is None


def test_change_user():
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

    token = res.json()['token']
    user_code = res.json()['user']['user_code']
    cookie = httpx.Cookies()
    cookie.set(name="current_user", value=f"{user_code}:{token}")

    user_code = res.json()['user']['user_code']
    res = client.post('/users/change',
                      json={
                          "user_code": user_code,
                          "email": "foo",
                          "avatar": "/path/to/avatar"
                      },
                      cookies=cookie)
    assert res.json()["success"] is True
    user = find_user_by_code(user_code)
    assert user.email == "foo"
    assert user.avatar == "/path/to/avatar"


def test_upload_avatar():
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

    token = res.json()['token']
    user_code = res.json()['user']['user_code']
    cookie = httpx.Cookies()
    cookie.set(name="current_user", value=f"{user_code}:{token}")

    file = os.path.join(os.path.dirname(__file__), "avatar.png")
    res = client.post('/users/upload_avatar',
                      files={"file": open(file, "rb")},
                      cookies=cookie)

    assert res.json()["success"] is True
    filepath = res.json()["filename"]
    res = client.get(filepath)


def test_get_user():
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

    token = res.json()['token']
    user_code = res.json()['user']['user_code']
    cookie = httpx.Cookies()
    cookie.set(name="current_user", value=f"{user_code}:{token}")

    res = client.get(f'/users/user?user_code={user_code}',
                     cookies=cookie)
    assert res.json()['success'] is True


def test_get_users():
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

    token = res.json()['token']
    user_code = res.json()['user']['user_code']
    cookie = httpx.Cookies()
    cookie.set(name="current_user", value=f"{user_code}:{token}")

    res = client.get('/users/users', cookies=cookie)
    assert res.json()["success"] is True and len(res.json()["data"]) == 1
