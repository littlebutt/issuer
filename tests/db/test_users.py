import pytest

from issuer.db import (
    insert_user,
    delete_all_users,
    update_user_by_code,
    find_user_by_email,
    delete_user_by_code,
    find_user_by_code,
    list_users,
)
from issuer.db import User


def setup_function(function):
    delete_all_users()


def teardown_function(function):
    delete_all_users()


def test_insert_user():
    user1 = User(user_name="test", passwd="test", role="admin", email="test")
    res = insert_user(user=user1)
    assert res is True

    user2 = User(user_name="test", passwd="test", role="admin", email="test")
    res = insert_user(user=user2)
    assert res is False


def test_update_user_by_code():
    user = User(user_name="foo", passwd="test", role="admin", email="test")
    res = insert_user(user=user)
    assert res is True

    user.user_name = "bar"
    res = update_user_by_code(user)
    assert res is True

    new_user = find_user_by_email("test")
    assert new_user.user_name == "bar"


def test_delete_user_by_code():
    user = User(
        user_code="us99",
        user_name="test",
        passwd="test",
        role="admin",
        email="test",
    )
    res = insert_user(user=user)
    assert res is True
    delete_user_by_code(user_code="us99")
    new_user = find_user_by_code(user_code="us99")
    assert new_user is None


def test_find_user():
    user = User(
        user_code="test",
        user_name="test",
        passwd="test",
        role="admin",
        email="test",
    )
    res = insert_user(user=user)
    assert res is True
    res = find_user_by_email("test")
    assert res is not None

    res = find_user_by_code("test")
    assert res is not None


def test_list_users():
    user = User(
        user_code="test",
        user_name="test",
        passwd="test",
        role="admin",
        email="test",
    )
    res = insert_user(user=user)
    assert res is True

    res = list_users()
    assert len(res) == 1
