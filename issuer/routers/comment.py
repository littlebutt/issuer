from datetime import datetime
from typing import Annotated, Dict, List
from fastapi import APIRouter, Cookie

from issuer import db
from issuer.db.models import IssueComment
from issuer.routers.models import IssueCommentReq, IssueCommentRes, UserModel
from issuer.routers.users import check_cookie


router = APIRouter(
    prefix='/comment',
    tags=["comment"],
    responses={404: {"description": "Not Found"}}
)


@router.post('/new')
async def new_comment(issue_comment: "IssueCommentReq",
                      current_user: Annotated[str | None, Cookie()] = None):
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    comment_do = IssueComment(issue_code=issue_comment.issue_code,
                              comment_time=datetime.now(),
                              commenter=_user.user_code,
                              fold=False,
                              content=issue_comment.content)
    res = db.insert_issue_comment(comment_do)
    if res is None:
        return {"success": False, "reason": "Internal error"}
    return {"success": True}


@router.post('/fold')
async def fold_comment(issue_comment: "IssueCommentReq",
                       current_user: Annotated[str | None, Cookie()] = None):
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    comment = db.find_issue_comment_by_code(issue_comment.comment_code)
    if comment.commenter != _user.user_code:
        return {"success": False, "reason": "Permission denied"}
    comment.fold = True
    res = db.change_issue_comment_by_code(comment)
    return {"success": res}


@router.get('/list', response_model=List[IssueCommentRes] | Dict)
async def list_comment(issue_code: str,
                       current_user: Annotated[str | None, Cookie()] = None):
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    comments = db.list_issue_comment_by_issue(issue_code)
    res = list()
    for comment in comments:
        commenter = db.find_user_by_code(comment.commenter)
        res.append(IssueCommentRes(
            comment_code=comment.comment_code,
            issue_code=comment.issue_code,
            comment_time=datetime.strftime(comment.comment_time,
                                           '%Y-%m-%d %H:%M:%S'),
            commenter=UserModel(user_code=commenter.user_code,
                                user_name=commenter.user_name,
                                email=commenter.email,
                                role=commenter.role,
                                description=commenter.description,
                                phone=commenter.phone
                                ),
            fold=comment.fold,
            content=comment.content))
    return res
