from datetime import datetime, timedelta
from fastapi.testclient import TestClient
import pytest

from issuer import db
from issuer.db import delete_all_projects, delete_all_project_to_user, \
    delete_all_users, delete_all_issues, insert_metas
from issuer.db.models import Metas
from issuer.main import app
from tests.routers.test_user_group import get_cookie


client = TestClient(app)


def init_meta():
    issue_status_open = Metas(meta_type='ISSUE_STATUS',
                              meta_value='open', note="开放")
    insert_metas(issue_status_open)
    issue_status_finished = Metas(meta_type='ISSUE_STATUS',
                                  meta_value='finished', note="完成")
    insert_metas(issue_status_finished)
    issue_status_closed = Metas(meta_type='ISSUE_STATUS',
                                meta_value='closed', note="关闭")
    insert_metas(issue_status_closed)


def setup_function(function):
    init_meta()
    delete_all_users()
    delete_all_projects()
    delete_all_issues()
    delete_all_project_to_user()


def teardown_function(function):
    delete_all_users()
    delete_all_projects()
    delete_all_issues()
    delete_all_project_to_user()


def test_new_project():
    cookie, user_code = get_cookie()
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

    res = client.post('/project/delete',
                      json={
                          "project_code": project_code
                      },
                      cookies=cookie)
    res = db.list_project_by_owner(user_code)
    assert len(res) == 0


def test_change_project():
    cookie, user_code = get_cookie()
    res = client.post('/project/new',
                      json={
                          "project_name": "test_project",
                          "start_date": "2024-06-05",
                          "privilege": "Private"
                      },
                      cookies=cookie)
    assert res.json()["success"] is True

    res = client.get(f'/project/participants?user_code={user_code}',
                     cookies=cookie)
    assert res.json()["success"] is True
    project_code = res.json()["data"][0]['project_code']

    res = client.post('/project/change',
                      json={
                          "project_code": project_code,
                          "start_date": "2024-06-05",
                          "project_name": "test",
                          "owner": user_code,
                          "status": "Processing"
                      },
                      cookies=cookie)
    assert res.json()["success"] is True

    res = client.get(f'/project/query?project_code={project_code}',
                     cookies=cookie)
    assert res.json()["data"]["status"] == "Processing"
    assert res.json()["data"]["privilege"] == "Private"


def test_add_project():
    cookie, user_code = get_cookie()
    res = client.post('/project/new',
                      json={
                          "project_name": "test_project",
                          "start_date": "2024-06-05",
                          "privilege": "start"
                      },
                      cookies=cookie)
    assert res.json()["success"] is True

    res = client.get(f'/project/participants?user_code={user_code}',
                     cookies=cookie)
    assert res.json()["success"] is True
    project_code = res.json()["data"][0]['project_code']

    res = client.post('/project/add',
                      json={
                          "project_code": project_code,
                          "new_member": "test"
                      },
                      cookies=cookie)
    assert res.json()["success"] is True


def test_list_projects_by_condition():
    cookie, user_code = get_cookie()
    res = client.post('/project/new',
                      json={
                          "project_name": "test_project",
                          "start_date": "2024-06-05",
                          "privilege": "Start"
                      },
                      cookies=cookie)
    assert res.json()["success"] is True

    res = client.get(f'/project/list_projects?members={user_code}',
                     cookies=cookie)
    assert res.json()["success"] is True


def test_count_projects_by_condition():
    cookie, user_code = get_cookie()
    res = client.post('/project/new',
                      json={
                          "project_name": "test_project",
                          "start_date": "2024-06-05",
                          "privilege": "Start"
                      },
                      cookies=cookie)
    assert res.json()["success"] is True

    res = client.get(f'/project/count_projects?members={user_code}',
                     cookies=cookie)
    assert res.json()["success"] is True


def test_stat_issue_state():
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

    res = client.post('/issue/new',
                      json={
                          "project_code": project_code,
                          "title": "test_issue",
                          "tags": "test,new"
                      },
                      cookies=cookie)
    assert res.json()["success"] is True

    after_date = datetime.now() - timedelta(days=5)
    before_date = datetime.now()
    res = client.get(f'/project/stat_status?project_code={project_code}&'
                     f'after_date={after_date.strftime("%Y-%m-%d")}&'
                     f'before_date={before_date.strftime("%Y-%m-%d")}',
                     cookies=cookie)
    assert res.json()["success"] is True
    assert len(res.json()["data"]) == 3
    assert res.json()["data"]["open"] == 2


def test_stat_issue_date():
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

    res = client.post('/issue/new',
                      json={
                          "project_code": project_code,
                          "title": "test_issue",
                          "tags": "test,new"
                      },
                      cookies=cookie)
    assert res.json()["success"] is True

    after_date = datetime.now() - timedelta(days=5)
    before_date = datetime.now()
    res = client.get(f'/project/stat_date?project_code={project_code}&'
                     f'after_date={after_date.strftime("%Y-%m-%d")}&'
                     f'before_date={before_date.strftime("%Y-%m-%d")}',
                     cookies=cookie)
    assert res.json()["success"] is True
    assert len(res.json()["data"]) == 5
    assert res.json()["data"][before_date.strftime("%Y-%m-%d")] == 2
