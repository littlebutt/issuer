from datetime import datetime
import os
from typing import Annotated, Dict, List
from fastapi import APIRouter, Cookie, Form, UploadFile

from issuer import db
from issuer.db.models import Activity, IssueComment
from issuer.routers.convertors import convert_comment
from issuer.routers.models import ActivityEnum, IssueCommentReq, \
    IssueCommentRes
from issuer.routers.users import check_cookie, get_statics


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
                              content=issue_comment.content,
                              appendices=issue_comment.appendices)
    res = db.insert_issue_comment(comment_do)
    if res is None:
        return {"success": False, "reason": "Internal error"}
    db.insert_activity(Activity(subject=_user.user_code,
                                target=issue_comment.issue_code,
                                category=ActivityEnum.NewComment.name))
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
    db.insert_activity(Activity(subject=_user.user_code,
                                target=comment.issue_code,
                                category=ActivityEnum.FoldComment.name))
    return {"success": res}


@router.get('/list_comments',
            response_model=Dict[str, str | List[IssueCommentRes] | bool])
async def list_comment(issue_code: str,
                       current_user: Annotated[str | None, Cookie()] = None):
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    comments = db.list_issue_comment_by_issue(issue_code)
    res = list()
    for comment in comments:
        if comment is None:
            continue
        res.append(convert_comment(comment))
    return {"success": True, "data": res}


@router.post('/upload_appendix')
async def upload_appendix(file: "UploadFile",
                          issue_code: str = Form(),
                          current_user: Annotated[str | None, Cookie()] = None): # noqa
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {
            "success": False,
            "reason": "Invalid token",
        }
    try:
        filename = f"{issue_code}_{file.filename}"
        filename = filename.replace(" ", "_")
        data = await file.read()
        with open(os.path.join(get_statics(), filename), "wb") as f:
            f.write(data)
            f.flush()
    except Exception as e:
        return {"success": False, "reason": str(e)}
    return {"success": True, "filename": '/statics/' + filename}
