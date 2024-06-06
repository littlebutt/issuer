import pytest
from datetime import datetime


from issuer.db import Issue
from issuer.db import delete_all_issues, insert_issue, \
    list_issues_by_condition, update_issue_by_code, delete_issue_by_code


def setup_function(function):
    delete_all_issues()


def teardown_function(function):
    delete_all_issues()


def test_insert_issue():
    issue = Issue(project_code="test", title="test", owner="test",
                  propose_date=datetime.now().date(), status="Start")
    issue_code = insert_issue(issue)
    assert issue_code is not None
    issues = list_issues_by_condition(project_code="test")
    assert len(issues) > 0
    assert issues[0].status == "Start"


def test_update_issue_by_code():
    issue = Issue(project_code="test", title="test", owner="test",
                  propose_date=datetime.now().date(), status="Start")
    issue_code = insert_issue(issue)
    assert issue_code is not None

    issues = list_issues_by_condition(issue_code=issue_code)
    assert len(issues) > 0

    issue = issues[0]
    issue.title = "foo"
    res = update_issue_by_code(issue)
    assert res is True
    issues = list_issues_by_condition(title="foo")
    assert len(issues) > 0


def test_delete_issue_by_code():
    issue = Issue(project_code="test", title="test", owner="test",
                  propose_date=datetime.now().date(), status="Start")
    issue_code = insert_issue(issue)
    assert issue_code is not None

    res = delete_issue_by_code(issue_code=issue_code)
    assert res is True


def test_list_issues_by_condition():
    issue = Issue(project_code="test", title="test", owner="test",
                  propose_date=datetime.now().date(), status="Start",
                  tags="test", followers="foo, bar")
    issue_code = insert_issue(issue)
    assert issue_code is not None

    res = list_issues_by_condition(owner="test")
    assert len(res) > 0

    res = list_issues_by_condition(start_date=datetime(2024, 1, 1).date())
    assert len(res) > 0

    res = list_issues_by_condition(end_date=datetime.now().date())
    assert len(res) > 0

    res = list_issues_by_condition(follower='foo')
    assert len(res) > 0
