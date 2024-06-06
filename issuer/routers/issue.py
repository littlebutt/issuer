from datetime import datetime
from typing import Annotated
from fastapi import APIRouter, Cookie

from issuer import db
from issuer.db import Issue
from issuer.routers.models import IssueReq, IssueStatusEnum
from issuer.routers.users import check_cookie


router = APIRouter(
    prefix='/issue',
    tags=["issue"],
    responses={404: {"description": "Not Found"}}
)


@router.post('/new')
async def new_issue(issue: "IssueReq",
                    current_user: Annotated[str | None, Cookie()] = None):
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    propose_date = datetime.strptime(issue.propose_date, '%Y-%m-%d').date()
    issue_do = Issue(project_code=issue.project_code,
                     title=issue.title,
                     owner=_user.user_code,
                     propose_date=propose_date,
                     status=IssueStatusEnum.Open.name,
                     tags=issue.tags,
                     followers=_user.user_code)
    res = db.insert_issue(issue_do)
    if res is None:
        return {"success": False, "reason": "Internal error"}
    return {"success": True}


@router.post('/delete')
async def delete_issue(issue: "IssueReq",
                       current_user: Annotated[str | None, Cookie()] = None):
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    if issue.owner != _user.user_code:
        return {"success": False, "reason": "Permission denied"}
    res = db.delete_issue_by_code(issue.issue_code)
    # TODO:删除对应的IssueComment
    return {"success": res}


@router.post('/change')
async def change_issue(issue: "IssueReq",
                       current_user: Annotated[str | None, Cookie()] = None):
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    if issue.owner != _user.user_code:
        return {"success": False, "reason": "Permission denied"}
    issue_do = db.list_issues_by_condition(issue_code=issue.issue_code)[0]
    issue_do.title = issue.title if issue.title is not None else issue_do.title
    issue_do.status = issue.status \
        if issue.status is not None else issue_do.status
    issue_do.tags = issue.tags if issue.tags is not None else issue_do.tags
    issue_do.followers = issue.followers \
        if issue.followers is not None else issue_do.followers
    # TODO: 模型更新改成增量更新
    res = db.update_issue_by_code(issue_do)
    return {"success": res}
