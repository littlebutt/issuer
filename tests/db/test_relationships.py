import pytest

from issuer.db import delete_all_user_to_user_group, \
    insert_user_to_user_group, delete_user_to_user_group_by_user_and_group, \
    list_user_to_user_group_by_user, delete_user_to_user_group_by_group, \
    delete_user_to_user_group_by_user, list_user_to_user_group_by_group, \
    delete_all_project_to_user, insert_project_to_user, \
    list_project_to_user_by_project, \
    delete_project_to_user_by_project_and_user, \
    list_project_to_user_by_user, delete_project_to_user_by_project, \
    count_user_to_user_group_by_user
from issuer.db import UserToUserGroup, ProjectToUser


def setup_function(function):
    delete_all_user_to_user_group()
    delete_all_project_to_user()


def teardown_function(function):
    delete_all_user_to_user_group()
    delete_all_project_to_user()


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


def test_count_user_to_user_group_by_user():
    user_to_user_group = UserToUserGroup(user_code="test", group_code="test")
    res = insert_user_to_user_group(user_to_user_group)
    assert res is True

    res = count_user_to_user_group_by_user(user_code="test")
    assert res == 1


def test_insert_project_to_user():
    project_to_user = ProjectToUser(project_code="foo", user_code="bar")
    res = insert_project_to_user(project_to_user)
    assert res is True

    res = list_project_to_user_by_project("foo")
    assert len(res) == 1


def test_delete_project_to_user_by_project_and_user():
    project_to_user = ProjectToUser(project_code="foo", user_code="bar")
    res = insert_project_to_user(project_to_user)
    assert res is True

    res = delete_project_to_user_by_project_and_user(project_code="foo",
                                                     user_code="bar")
    assert res is True

    res = list_project_to_user_by_project("foo")
    assert len(res) == 0


def test_list_project_to_user_by_user():
    project_to_user = ProjectToUser(project_code="foo", user_code="bar")
    res = insert_project_to_user(project_to_user)
    assert res is True

    res = list_project_to_user_by_user(user_code="bar")
    assert len(res) == 1

    for i in range(10):
        project_to_user = ProjectToUser(project_code=f"foo{i}",
                                        user_code="bar")
        insert_project_to_user(project_to_user)
    res = list_project_to_user_by_user(user_code="bar")
    assert len(res) == 10


def test_delete_project_to_user_by_project():
    project_to_user = ProjectToUser(project_code="foo", user_code="bar")
    res = insert_project_to_user(project_to_user)
    assert res is True

    res = delete_project_to_user_by_project("foo")
    assert res is True
