import pytest

from issuer.db import delete_all_user_groups, insert_user_group, \
    update_user_group_by_code, find_user_group_by_code, \
    delete_user_group_by_code, find_user_group_by_owner
from issuer.db import UserGroup


def setup_function(function):
    delete_all_user_groups()


def teardown_function(function):
    delete_all_user_groups()


def test_insert_user_group():
    user_group = UserGroup(group_code="test", group_name="test",
                           group_owner="test",)
    res = insert_user_group(user_group)
    assert res is True


def test_update_user_group_by_code():
    user_group = UserGroup(group_code="test", group_name="foo",
                           group_owner="test")
    res = insert_user_group(user_group)
    assert res is True

    user_group.group_name = "bar"
    res = update_user_group_by_code(user_group)
    assert res is True

    new_user_group = find_user_group_by_code("test")
    assert new_user_group is not None and new_user_group.group_name == "bar"


def test_delete_user_group_by_code():
    user_group = UserGroup(group_code="test", group_name="foo",
                           group_owner="test")
    res = insert_user_group(user_group)
    assert res is True

    res = delete_user_group_by_code("test")
    assert res is True
    new_user_group = find_user_group_by_code("test")
    assert new_user_group is None


def test_find_user_group_by_owner():
    user_group1 = UserGroup(group_code="foo", group_name="foo",
                            group_owner="test")
    res = insert_user_group(user_group1)
    assert res is True

    user_group2 = UserGroup(group_code="bar", group_name="foo",
                            group_owner="test")
    res = insert_user_group(user_group2)
    assert res is True

    res = find_user_group_by_owner("test")
    assert len(res) == 2
