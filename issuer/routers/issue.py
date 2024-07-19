from datetime import datetime
from typing import Annotated, Dict, List, Optional
from fastapi import APIRouter, Cookie

from issuer import db
from issuer.db import Issue
from issuer.routers.convertors import convert_issue
from issuer.routers.models import IssueReq, IssueRes
from issuer.routers.users import check_cookie
from issuer.routers.utils import empty_string_to_none, empty_strings_to_none


router = APIRouter(
    prefix='/issue',
    tags=["issue"],
    responses={404: {"description": "Not Found"}}
)


@router.post('/new')
async def new_issue(issue: "IssueReq",
                    current_user: Annotated[str | None, Cookie()] = None):
    '''
    新增议题

    Args:
        issue: :class:`IssueReq`类型，必填字段:attr:`project_code`，:attr:`title`
            。
        current_user: 请求Cookies，键为:arg:`current_user`，值为 user_code:token
            形式。

    '''
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    issue = empty_strings_to_none(issue)
    issue_do = Issue(project_code=issue.project_code,
                     title=issue.title,
                     description=issue.description,
                     owner=_user.user_code,
                     propose_date=datetime.now().date(),
                     status='open',
                     tags=issue.tags,
                     followers=_user.user_code,
                     assigned=issue.assigned)
    res = db.insert_issue(issue_do)
    if res is None:
        return {"success": False, "reason": "Internal error"}
    return {"success": True, "data": res}


@router.post('/delete')
async def delete_issue(issue: "IssueReq",
                       current_user: Annotated[str | None, Cookie()] = None):
    '''
    删除议题，必须由owner删除，且会删除对应的评论。

    Args:
        issue: :class:`IssueReq`类型，必填字段:attr:`issue_code`。
        current_user: 请求Cookies，键为:arg:`current_user`，值为 user_code:token
            形式。

    '''
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    issue = empty_strings_to_none(issue)
    issue_dos = db.list_issues_by_condition(issue_code=issue.issue_code)
    if len(issue_dos) == 0:
        return {"success": False, "reason": "Cannot find issue"}
    issue_do = issue_dos[0]
    if issue_do.owner != _user.user_code:
        return {"success": False, "reason": "Permission denied"}
    db.delete_issue_by_code(issue.issue_code)
    res = db.delete_issue_comment_by_issue(issue.issue_code)
    return {"success": res}


@router.post('/change')
async def change_issue(issue: "IssueReq",
                       current_user: Annotated[str | None, Cookie()] = None):
    '''
    修改议题，必须由owner修改。

    Args:
        issue: :class:`IssueReq`类型，必填字段:attr:`issue_code`。
        current_user: 请求Cookies，键为:arg:`current_user`，值为 user_code:token
            形式。
    '''
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    issue = empty_strings_to_none(issue)
    issue_dos = db.list_issues_by_condition(issue_code=issue.issue_code)
    if len(issue_dos) == 0:
        return {"success": False, "reason": "Cannot find issue"}
    issue_do = issue_dos[0]
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
    issue_do.description = issue.description \
        if issue.description is not None else issue_do.description
    res = db.update_issue_by_code(issue_do)
    return {"success": res}


@router.get('/list_issues',
            response_model=Dict[str, bool | str | List[IssueRes]])
async def list_issues_by_condition(issue_code: Optional[str] = None,
                                   project_code: Optional[str] = None,
                                   owner: Optional[str] = None,
                                   status: Optional[str] = None,
                                   issue_id: Optional[str] = None,
                                   title: Optional[str] = None,
                                   description: Optional[str] = None,
                                   start_date: Optional[str] = None,
                                   end_date: Optional[str] = None,
                                   follower: Optional[str] = None,
                                   assigned: Optional[str] = None,
                                   tags: Optional[str] = None,
                                   page_num: int = 1,
                                   page_size: int = 10,
                                   current_user: Annotated[str | None, Cookie()] = None): # noqa
    '''
    根据条件查询议题。

    Args:
        issue_code: 议题码。
        project_code: 所属的项目码。
        owner: 创建者，用户码表示。
        status: 状态，包括open，finished和closed。
        issue_id: 议题的序号。
        title: 议题标题。
        description: 议题描述。
        start_date: 计划开始日期。
        end_date: 计划完成时间。
        follower: 关注者，半角逗号分隔的用户码。
        assigned: 被指派，半角逗号分隔的用户码。
        tags: 标签，用逗号分隔。
        page_num: 页码。
        page_size: 页数。
        current_user: 请求Cookies，键为:arg:`current_user`，值为 user_code:token
            形式。

    '''
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    issue_code = empty_string_to_none(issue_code)
    project_code = empty_string_to_none(project_code)
    owner = empty_string_to_none(owner)
    status = empty_string_to_none(status)
    issue_id = empty_string_to_none(issue_id)
    title = empty_string_to_none(title)
    description = empty_string_to_none(description)
    start_date = empty_string_to_none(start_date)
    end_date = empty_string_to_none(end_date)
    follower = empty_string_to_none(follower)
    assigned = empty_string_to_none(assigned)
    tags = empty_string_to_none(tags)
    if issue_id is not None:
        issue_id = int(issue_id)
    if start_date is not None:
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
    if end_date is not None:
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    if tags is not None:
        tags = tags.split(',')
    issues = db.list_issues_by_condition(issue_code, project_code, owner,
                                         status, issue_id, title, description,
                                         start_date, end_date, follower,
                                         assigned, tags, page_num, page_size)
    res = list()
    for issue in issues:
        issue_res = convert_issue(issue)
        res.append(issue_res)
    return {"success": True, "data": res}


@router.get('/count_issues', response_model=Dict[str, bool | str | int])
async def count_issues_by_condition(issue_code: Optional[str] = None,
                                    project_code: Optional[str] = None,
                                    owner: Optional[str] = None,
                                    status: Optional[str] = None,
                                    issue_id: Optional[str] = None,
                                    title: Optional[str] = None,
                                    description: Optional[str] = None,
                                    start_date: Optional[str] = None,
                                    end_date: Optional[str] = None,
                                    follower: Optional[str] = None,
                                    assigned: Optional[str] = None,
                                    tags: Optional[str] = None,
                                    current_user: Annotated[str | None, Cookie()] = None): # noqa
    '''
    根据条件查询议题数量。

    Args:
        issue_code: 议题码。
        project_code: 所属的项目码。
        owner: 创建者，用户码表示。
        status: 状态，包括open，finished和closed。
        issue_id: 议题的序号。
        title: 议题标题。
        description: 议题描述。
        start_date: 计划开始日期。
        end_date: 计划完成时间。
        follower: 关注者，半角逗号分隔的用户码。
        assigned: 被指派，半角逗号分隔的用户码。
        tags: 标签，用逗号分隔。
        current_user: 请求Cookies，键为:arg:`current_user`，值为 user_code:token
            形式。

    '''
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    issue_code = empty_string_to_none(issue_code)
    project_code = empty_string_to_none(project_code)
    owner = empty_string_to_none(owner)
    status = empty_string_to_none(status)
    issue_id = empty_string_to_none(issue_id)
    title = empty_string_to_none(title)
    description = empty_string_to_none(description)
    start_date = empty_string_to_none(start_date)
    end_date = empty_string_to_none(end_date)
    follower = empty_string_to_none(follower)
    assigned = empty_string_to_none(assigned)
    tags = empty_string_to_none(tags)
    if issue_id is not None:
        issue_id = int(issue_id)
    if start_date is not None:
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
    if end_date is not None:
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    if tags is not None:
        tags = tags.split(',')
    res = db.count_issues_by_condition(issue_code=issue_code,
                                       project_code=project_code,
                                       owner=owner,
                                       status=status,
                                       issue_id=issue_id,
                                       title=title,
                                       description=description,
                                       start_date=start_date,
                                       end_date=end_date,
                                       follower=follower,
                                       assigned=assigned,
                                       tags=tags)
    if res is not None:
        return {"success": True, "data": res}
    else:
        return {"success": False}


@router.get('/query_status')
async def query_status():
    '''获取议题状态'''
    metas = db.list_metas_by_type('ISSUE_STATUS')
    return {
        "success": True,
        "data": [{"value": meta.meta_value, "label": meta.note}
                 for meta in metas]
    }
