from fastapi.testclient import TestClient

from issuer import db
from issuer.db import delete_all_issues, delete_all_users, \
    delete_all_projects, delete_all_project_to_user
from issuer.main import app
from tests.routers.test_user_group import get_cookie


client = TestClient(app)


def setup_function(function):
    delete_all_users()
    delete_all_projects()
    delete_all_project_to_user()
    delete_all_issues()


def teardown_function(function):
    delete_all_users()
    delete_all_projects()
    delete_all_project_to_user()
    delete_all_issues()


def test_new_issue():
    cookie, user_code = get_cookie()
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
    res = client.post('/issue/new',
                      json={
                          "project_code": project_code,
                          "title": "test_issue",
                          "tags": "test,new"
                      },
                      cookies=cookie)
    assert res.json()["success"] is True
    res = db.list_issues_by_condition(project_code=project_code)
    assert len(res) == 1


def test_delete_issue():
    cookie, user_code = get_cookie()
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
    res = client.post('/issue/new',
                      json={
                          "project_code": project_code,
                          "title": "test_issue",
                          "tags": "test,new"
                      },
                      cookies=cookie)
    assert res.json()["success"] is True
    res = db.list_issues_by_condition(project_code=project_code)
    issue_code = res[0].issue_code

    res = client.post('/issue/delete',
                      json={
                          "issue_code": issue_code
                      },
                      cookies=cookie)
    assert res.json()["success"] is True
    res = db.list_issues_by_condition(owner=user_code)
    assert len(res) == 0


def test_change_issue():
    cookie, user_code = get_cookie()
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
    res = client.post('/issue/new',
                      json={
                          "project_code": project_code,
                          "title": "test_issue",
                          "tags": "test,new"
                      },
                      cookies=cookie)
    assert res.json()["success"] is True
    res = db.list_issues_by_condition(project_code=project_code)
    issue_code = res[0].issue_code

    res = client.post('/issue/change',
                      json={
                          "issue_code": issue_code,
                          "title": "another test"
                      },
                      cookies=cookie)
    assert res.json()["success"] is True
    res = db.list_issues_by_condition(issue_code=issue_code)
    assert res[0].title == "another test"


def test_list_issues_by_condition():
    cookie, user_code = get_cookie()
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
    res = client.post('/issue/new',
                      json={
                          "project_code": project_code,
                          "title": "test_issue",
                          "tags": "test,new"
                      },
                      cookies=cookie)
    assert res.json()["success"] is True

    res = client.get('/issue/list?title=te',
                     cookies=cookie)
    assert len(res.json()) > 0

    res = client.get('/issue/list?tags=new,test',
                     cookies=cookie)
    assert len(res.json()) > 0

    res = client.get(f'/issue/list?follower={user_code}',
                     cookies=cookie)
    assert len(res.json()) > 0
