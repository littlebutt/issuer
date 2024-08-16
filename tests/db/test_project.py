import pytest
import datetime

from issuer.db import (
    delete_all_projects,
    insert_project,
    find_project_by_code,
    update_project_by_code,
    delete_project_by_code,
    list_project_by_owner,
    insert_project_to_user,
    delete_all_project_to_user,
    list_projects_by_condition,
    count_projects_by_condition,
)

from issuer.db import Project, ProjectToUser


def setup_function(function):
    delete_all_projects()
    delete_all_project_to_user()


def teardown_function(function):
    delete_all_projects()
    delete_all_project_to_user()


def test_insert_project():
    project = Project(
        project_code="test",
        project_name="test",
        owner="test",
        status="start",
        privilege="public",
    )
    res = insert_project(project)
    assert res is not None


def test_update_project_by_code():
    project = Project(
        project_code="test",
        project_name="bar",
        owner="test",
        status="start",
        privilege="public",
    )
    res = insert_project(project)
    assert res is not None

    new_project = find_project_by_code("test")
    assert new_project is not None

    new_project.project_name = "foo"
    res = update_project_by_code(new_project)
    assert res is True

    new_project = find_project_by_code("test")
    assert new_project.project_name == "foo"


def test_delete_project_by_code():
    project = Project(
        project_code="test",
        project_name="bar",
        owner="test",
        status="start",
        privilege="public",
    )
    res = insert_project(project)
    assert res is not None

    res = delete_project_by_code("test")
    assert res is True
    new_project = find_project_by_code("test")
    assert new_project is None


def test_list_project_by_owner():
    project = Project(
        project_code="test1",
        project_name="bar",
        owner="test",
        status="start",
        privilege="public",
    )
    res = insert_project(project)
    assert res is not None

    project = Project(
        project_code="test2",
        project_name="foo",
        owner="test",
        status="start",
        privilege="public",
        start_date=datetime.date(2024, 6, 6),
    )
    res = insert_project(project)
    assert res is not None

    projects = list_project_by_owner("test")
    assert len(projects) == 2


def test_list_projects_by_condition():
    project1 = Project(
        project_code="test1",
        project_name="bar",
        owner="test",
        status="start",
        privilege="public",
    )
    code1 = insert_project(project1)
    assert code1 is not None

    project2 = Project(
        project_code="test2",
        project_name="foo",
        owner="test",
        status="start",
        privilege="public",
    )
    code2 = insert_project(project2)
    assert code2 is not None

    project_to_user1 = ProjectToUser(project_code=code1, user_code="user1")
    insert_project_to_user(project_to_user=project_to_user1)

    project_to_user2 = ProjectToUser(project_code=code1, user_code="user2")
    insert_project_to_user(project_to_user=project_to_user2)

    project_to_user3 = ProjectToUser(project_code=code2, user_code="user2")
    insert_project_to_user(project_to_user=project_to_user3)

    res = list_projects_by_condition(
        current_user="test", participants=["user1", "user2"]
    )
    assert len(res) == 2

    res = list_projects_by_condition(
        current_user="test", participants=["user1"]
    )
    assert len(res) == 1

    res = list_projects_by_condition(
        current_user="test", project_name="foo", participants=["user1"]
    )
    assert len(res) == 0


def test_count_projects_by_condition():
    project1 = Project(
        project_code="test1",
        project_name="bar",
        owner="test",
        status="start",
        privilege="public",
    )
    code1 = insert_project(project1)
    assert code1 is not None

    project2 = Project(
        project_code="test2",
        project_name="foo",
        owner="test",
        status="start",
        privilege="public",
    )
    code2 = insert_project(project2)
    assert code2 is not None

    project_to_user1 = ProjectToUser(project_code=code1, user_code="user1")
    insert_project_to_user(project_to_user=project_to_user1)

    project_to_user2 = ProjectToUser(project_code=code1, user_code="user2")
    insert_project_to_user(project_to_user=project_to_user2)

    project_to_user3 = ProjectToUser(project_code=code2, user_code="user2")
    insert_project_to_user(project_to_user=project_to_user3)

    res = count_projects_by_condition(
        current_user="test", participants=["user1", "user2"]
    )
    assert res == 2

    res = count_projects_by_condition(
        current_user="test", participants=["user1"]
    )
    assert res == 1

    res = count_projects_by_condition(
        current_user="test", project_name="foo", participants=["user1"]
    )
    assert res == 0
