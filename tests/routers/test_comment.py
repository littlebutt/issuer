import os
from fastapi.testclient import TestClient
import pytest

from issuer.db import delete_all_users, delete_all_projects, \
    delete_all_project_to_user, delete_all_issues, delete_all_issue_comments, \
    list_issues_by_condition, list_issue_comment_by_issue
from issuer.main import app
from tests.routers.test_user_group import get_cookie


client = TestClient(app)


def setup_function(function):
    delete_all_issue_comments()
    delete_all_users()
    delete_all_projects()
    delete_all_project_to_user()
    delete_all_issues()


def teardown_function(function):
    delete_all_issue_comments()
    delete_all_users()
    delete_all_projects()
    delete_all_project_to_user()
    delete_all_issues()


def test_new_comment():
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
    assert res.json()["success"] is True
    project_code = res.json()["data"][0]['project_code']
    res = client.post('/issue/new',
                      json={
                          "project_code": project_code,
                          "title": "test_issue",
                          "tags": "test,new"
                      },
                      cookies=cookie)
    assert res.json()["success"] is True
    res = list_issues_by_condition(project_code=project_code)
    issue_code = res[0].issue_code

    res = client.post('/comment/new',
                      json={
                          "issue_code": issue_code,
                          "content": "This is a comment."
                      },
                      cookies=cookie)
    assert res.json()['success'] is True


def test_fold_comment():
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
    assert res.json()["success"] is True
    project_code = res.json()["data"][0]['project_code']
    res = client.post('/issue/new',
                      json={
                          "project_code": project_code,
                          "title": "test_issue",
                          "tags": "test,new"
                      },
                      cookies=cookie)
    assert res.json()["success"] is True
    res = list_issues_by_condition(project_code=project_code)
    issue_code = res[0].issue_code

    res = client.post('/comment/new',
                      json={
                          "issue_code": issue_code,
                          "content": "This is a comment."
                      },
                      cookies=cookie)
    assert res.json()['success'] is True

    comments = list_issue_comment_by_issue(issue_code)
    comment_code = comments[0].comment_code

    res = client.post('/comment/fold',
                      json={
                          "comment_code": comment_code
                      },
                      cookies=cookie)
    assert res.json()["success"] is True
    comments = list_issue_comment_by_issue(issue_code)
    assert comments[0].fold is True


def test_list_comment():
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
    assert res.json()["success"] is True
    project_code = res.json()["data"][0]['project_code']
    res = client.post('/issue/new',
                      json={
                          "project_code": project_code,
                          "title": "test_issue",
                          "tags": "test,new"
                      },
                      cookies=cookie)
    assert res.json()["success"] is True
    res = list_issues_by_condition(project_code=project_code)
    issue_code = res[0].issue_code

    res = client.post('/comment/new',
                      json={
                          "issue_code": issue_code,
                          "content": "This is a comment."
                      },
                      cookies=cookie)
    assert res.json()['success'] is True

    res = client.get(f'/comment/list_comments_by_code?issue_code={issue_code}',
                     cookies=cookie)
    assert len(res.json()["data"]) > 0

    res = client.get(f'/comment/list_comments_by_commenter?user_code={user_code}', # noqa
                     cookies=cookie)
    assert len(res.json()["data"]) > 0


def test_upload_appendix():
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
    assert res.json()["success"] is True
    project_code = res.json()["data"][0]['project_code']
    res = client.post('/issue/new',
                      json={
                          "project_code": project_code,
                          "title": "test_issue",
                          "tags": "test,new"
                      },
                      cookies=cookie)
    assert res.json()["success"] is True
    res = list_issues_by_condition(project_code=project_code)
    issue_code = res[0].issue_code

    file = os.path.join(os.path.dirname(__file__), "avatar.png")
    res = client.post('/comment/upload_appendix',
                      files={"file": open(file, "rb")},
                      data={
                          "issue_code": issue_code
                      },
                      cookies=cookie)
    assert res.json()["success"] is True
    filepath = res.json()["filename"]
    res = client.get(filepath)
