from fastapi.testclient import TestClient
import pytest

from issuer import db
from issuer.db import delete_all_projects, delete_all_project_to_user, \
    delete_all_users
from issuer.main import app
from tests.routers.test_user_group import _get_cookie


client = TestClient(app)


def setup_function(function):
    delete_all_users()
    delete_all_projects()
    delete_all_project_to_user()


def teardown_function(function):
    delete_all_users()
    delete_all_projects()
    delete_all_project_to_user()


def test_new_project():
    cookie, user_code = _get_cookie()
    res = client.post('/project/new',
                      json={
                          "project_name": "test_project",
                          "start_date": "2024-06-05",
                          "privilege": "Start"
                      },
                      cookies=cookie)
    assert res.json()["success"] is True
    res = db.list_project_by_owner(user_code)
    assert len(res) > 0


def test_delete_project():
    cookie, user_code = _get_cookie()
    res = client.post('/project/new',
                      json={
                          "project_name": "test_project",
                          "start_date": "2024-06-05",
                          "privilege": "Start"
                      },
                      cookies=cookie)
    assert res.json()["success"] is True

    res = client.get(f'/project/participants?user_code={user_code}',
                     cookies=cookie)
    assert len(res.json()) > 0
    project_code = res.json()[0]['project_code']

    res = client.post('/project/delete',
                      json={
                          "project_code": project_code
                      },
                      cookies=cookie)
    res = db.list_project_by_owner(user_code)
    assert len(res) == 0
