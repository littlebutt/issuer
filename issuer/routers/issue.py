from datetime import datetime
from typing import Annotated, Dict, List, Optional
from fastapi import APIRouter, Cookie

from issuer import db
from issuer.db import Issue
from issuer.routers.models import IssueReq, IssueRes, UserModel
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
    issue_do = Issue(project_code=issue.project_code,
                     title=issue.title,
                     owner=_user.user_code,
                     propose_date=datetime.now().date(),
                     status='open',
                     tags=issue.tags,
                     followers=_user.user_code,
                     assigned=issue.assigned)
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
    issue_do = db.list_issues_by_condition(issue_code=issue.issue_code)[0]
    if issue_do.owner != _user.user_code:
        return {"success": False, "reason": "Permission denied"}
    db.delete_issue_by_code(issue.issue_code)
    res = db.delete_issue_comment_by_issue(issue.issue_code)
    return {"success": res}


@router.post('/change')
async def change_issue(issue: "IssueReq",
                       current_user: Annotated[str | None, Cookie()] = None):
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    issue_do = db.list_issues_by_condition(issue_code=issue.issue_code)[0]
    if issue_do.owner != _user.user_code:
        return {"success": False, "reason": "Permission denied"}
    issue_do.title = issue.title if issue.title is not None else issue_do.title
    issue_do.status = issue.status \
        if issue.status is not None else issue_do.status
    issue_do.tags = issue.tags if issue.tags is not None else issue_do.tags
    issue_do.followers = issue.followers \
        if issue.followers is not None else issue_do.followers
    issue_do.assigned = issue.assigned \
        if issue.assigned is not None else issue_do.assigned
    res = db.update_issue_by_code(issue_do)
    return {"success": res}


@router.get('/list', response_model=List[IssueRes] | Dict)
async def list_issues_by_condition(issue_code: Optional[str] = None,
                                   project_code: Optional[str] = None,
                                   owner: Optional[str] = None,
                                   status: Optional[str] = None,
                                   issue_id: Optional[int] = None,
                                   title: Optional[str] = None,
                                   start_date: Optional[str] = None,
                                   end_date: Optional[str] = None,
                                   follower: Optional[str] = None,
                                   assigned: Optional[str] = None,
                                   tags: Optional[str] = None,
                                   page_num: int = 1,
                                   page_size: int = 10,
                                   current_user: Annotated[str | None, Cookie()] = None): # noqa
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    if start_date is not None:
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
    if end_date is not None:
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    if tags is not None:
        tags = tags.split(',')
    issues = db.list_issues_by_condition(issue_code, project_code, owner,
                                         status, issue_id, title, start_date,
                                         end_date, follower, assigned, tags,
                                         page_num, page_size)
    res = list()
    for issue in issues:
        owner = db.find_user_by_code(issue.owner)
        followers = list()
        if issue.followers is not None:
            for _follower in issue.followers.split(','):
                _f = db.find_user_by_code(_follower)
                followers.append(UserModel(
                    user_code=_f.user_code,
                    user_name=_f.user_name,
                    email=_f.email,
                    role=_f.role,
                    description=_f.description,
                    phone=_f.phone
                ))
        assigneds = list()
        if issue.assigned is not None:
            for _assigned in issue.assigned.split(','):
                _a = db.find_user_by_code(_assigned)
                assigneds.append(UserModel(
                    user_code=_a.user_code,
                    user_name=_a.user_name,
                    email=_a.email,
                    role=_a.role,
                    description=_a.description,
                    phone=_a.phone
                ))
        res.append(IssueRes(
            issue_code=issue.issue_code,
            project_code=issue.project_code,
            issue_id=issue.issue_id,
            title=issue.title,
            owner=UserModel(user_code=owner.user_code,
                            user_name=owner.user_name,
                            email=owner.email,
                            role=owner.role,
                            description=owner.description,
                            phone=owner.phone),
            propose_date=datetime.strftime(issue.propose_date, '%Y-%m-%d'),
            status=issue.status,
            tags=issue.tags,
            followers=followers,
            assigned=assigneds
        ))
    return res


@router.get('/query_status')
async def query_status():
    metas = db.list_metas_by_type('ISSUE_STATUS')
    return {
        "success": True,
        "data": [meta.meta_value for meta in metas]
    }
