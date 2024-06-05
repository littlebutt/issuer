import pytest
import datetime

from issuer.db import delete_all_projects, insert_project, \
    find_project_by_code, update_project_by_code, delete_project_by_code, \
    list_project_by_owner
from issuer.db import Project


def setup_function(function):
    delete_all_projects()


def teardown_function(function):
    delete_all_projects()


def test_insert_project():
    project = Project(project_code="test", project_name="test", owner="test",
                      status="start", privilege="public")
    res = insert_project(project)
    assert res is not None


def test_update_project_by_code():
    project = Project(project_code="test", project_name="bar", owner="test",
                      status="start", privilege="public")
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
    project = Project(project_code="test", project_name="bar", owner="test",
                      status="start", privilege="public")
    res = insert_project(project)
    assert res is not None

    res = delete_project_by_code("test")
    assert res is True
    new_project = find_project_by_code("test")
    assert new_project is None


def test_list_project_by_owner():
    project = Project(project_code="test1", project_name="bar", owner="test",
                      status="start", privilege="public")
    res = insert_project(project)
    assert res is not None

    project = Project(project_code="test2", project_name="foo", owner="test",
                      status="start", privilege="public",
                      start_date=datetime.date(2024, 6, 6))
    res = insert_project(project)
    assert res is not None

    projects = list_project_by_owner("test")
    assert len(projects) == 2
