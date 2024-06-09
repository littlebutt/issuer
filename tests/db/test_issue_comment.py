from datetime import datetime
import pytest

from issuer.db import delete_all_issue_comments, insert_issue_comment, \
    list_issue_comment_by_issue, delete_issue_comment_by_issue, \
    list_issue_comment_by_commenter, change_issue_comment_by_code, \
    find_issue_comment_by_code
from issuer.db.models import IssueComment


def setup_function(function):
    delete_all_issue_comments()


def teardown_function(function):
    delete_all_issue_comments()


def test_insert_issue_comment():
    issue_comment = IssueComment(issue_code="test",
                                 comment_time=datetime.utcnow(),
                                 commenter="test",
                                 fold=False,
                                 content="This is a test.")
    comment_code = insert_issue_comment(issue_comment)
    assert comment_code is not None
    res = list_issue_comment_by_issue("test")
    assert len(res) > 0


def test_delete_issue_comment_by_issue():
    issue_comment = IssueComment(issue_code="test",
                                 comment_time=datetime.utcnow(),
                                 commenter="test",
                                 fold=False,
                                 content="This is a test.")
    comment_code = insert_issue_comment(issue_comment)
    assert comment_code is not None

    res = delete_issue_comment_by_issue("test")
    assert res is True

    res = list_issue_comment_by_commenter("test")
    assert len(res) == 0


def test_change_issue_comment_by_code():
    issue_comment = IssueComment(issue_code="test",
                                 comment_time=datetime.utcnow(),
                                 commenter="test",
                                 fold=False,
                                 content="This is a test.",
                                 appendices="path/to/pa,path/to/pb")
    comment_code = insert_issue_comment(issue_comment)
    assert comment_code is not None

    issue_comment.fold = True
    res = change_issue_comment_by_code(issue_comment)
    assert res is True

    res = find_issue_comment_by_code(comment_code=comment_code)
    assert res is not None
    assert res.appendices == "path/to/pa,path/to/pb"
