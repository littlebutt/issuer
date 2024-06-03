import pytest

from issuer.db import delete_all_user_to_user_group, \
    insert_user_to_user_group, delete_user_to_user_group_by_user_and_group, \
    list_user_to_user_group_by_user, delete_user_to_user_group_by_group, \
    delete_user_to_user_group_by_user, list_user_to_user_group_by_group
from issuer.db import UserToUserGroup


def setup_function(function):
    delete_all_user_to_user_group()


def teardown_function(function):
    delete_all_user_to_user_group()


def test_insert_user_to_user_group():
    user_to_user_group = UserToUserGroup(user_code="test", group_code="test")
    res = insert_user_to_user_group(user_to_user_group)
    assert res is True


def test_delete_user_to_user_group_by_user_and_group():
    user_to_user_group = UserToUserGroup(user_code="test", group_code="test")
    res = insert_user_to_user_group(user_to_user_group)
    assert res is True

    res = delete_user_to_user_group_by_user_and_group("test", "test")
    assert res is True
    user_groups = list_user_to_user_group_by_user("test")
    assert len(user_groups) == 0


def test_delete_user_to_user_group_by_group():
    user_to_user_group = UserToUserGroup(user_code="test", group_code="test")
    res = insert_user_to_user_group(user_to_user_group)
    assert res is True

    res = delete_user_to_user_group_by_group("test")
    assert res is True
    user_groups = list_user_to_user_group_by_user("test")
    assert len(user_groups) == 0


def test_delete_user_to_user_group_by_user():
    user_to_user_group = UserToUserGroup(user_code="test", group_code="test")
    res = insert_user_to_user_group(user_to_user_group)
    assert res is True

    res = delete_user_to_user_group_by_user("test")
    assert res is True
    user_groups = list_user_to_user_group_by_group("test")
    assert len(user_groups) == 0
