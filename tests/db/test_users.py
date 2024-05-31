import pytest

from issuer.db import insert_user, delete_all_users, update_user_by_code, \
    find_user_by_email
from issuer.db import User


def test_insert_user():
    delete_all_users()
    user1 = User(user_name="test", passwd="test", role="admin", email="test")
    res = insert_user(user=user1)
    assert res is True

    user2 = User(user_name="test", passwd="test", role="admin", email="test")
    res = insert_user(user=user2)
    assert res is False

    delete_all_users()


def test_update_user_by_code():
    delete_all_users()
    user = User(user_name="foo", passwd="test", role="admin", email="test")
    res = insert_user(user=user)
    assert res is True

    user.user_name = "bar"
    res = update_user_by_code(user)
    assert res is True

    new_user = find_user_by_email("test")
    assert new_user.user_name == "bar"
