import pytest

from issuer.db import delete_all_user_groups, insert_user_group, \
    update_user_group_by_code, find_user_group_by_code, \
    delete_user_group_by_code, find_user_group_by_owner, \
    insert_user_to_user_group, list_user_group_by_condition, \
    count_user_group_by_condition
from issuer.db import UserGroup, UserToUserGroup


def setup_function(function):
    delete_all_user_groups()


def teardown_function(function):
    delete_all_user_groups()


def test_insert_user_group():
    user_group = UserGroup(group_code="test", group_name="test",
                           group_owner="test",)
    res = insert_user_group(user_group)
    assert res is not None


def test_update_user_group_by_code():
    user_group = UserGroup(group_code="test", group_name="foo",
                           group_owner="test")
    res = insert_user_group(user_group)
    assert res is not None

    user_group.group_name = "bar"
    res = update_user_group_by_code(user_group)
    assert res is True

    new_user_group = find_user_group_by_code("test")
    assert new_user_group is not None and new_user_group.group_name == "bar"


def test_delete_user_group_by_code():
    user_group = UserGroup(group_code="test", group_name="foo",
                           group_owner="test")
    res = insert_user_group(user_group)
    assert res is not None

    res = delete_user_group_by_code("test")
    assert res is True
    new_user_group = find_user_group_by_code("test")
    assert new_user_group is None


def test_find_user_group_by_owner():
    user_group1 = UserGroup(group_code="foo", group_name="foo",
                            group_owner="test")
    res = insert_user_group(user_group1)
    assert res is not None

    user_group2 = UserGroup(group_code="bar", group_name="foo",
                            group_owner="test")
    res = insert_user_group(user_group2)
    assert res is not None

    res = find_user_group_by_owner("test")
    assert len(res) == 2


def test_list_user_group_by_condition():
    user_group = UserGroup(group_code="group_code", group_name="foo",
                           group_owner="test")
    res = insert_user_group(user_group)
    assert res is not None

    user_to_user_group_a = UserToUserGroup(group_code="group_code",
                                           user_code="A")
    res = insert_user_to_user_group(user_to_user_group_a)
    assert res is True
    user_to_user_group_b = UserToUserGroup(group_code="group_code",
                                           user_code="B")
    res = insert_user_to_user_group(user_to_user_group_b)
    assert res is True

    res = list_user_group_by_condition(members=["A", "B"])
    assert len(res) == 1

    res = count_user_group_by_condition(members=["A", "B"])
    assert res == 2
