from datetime import datetime, timedelta
import logging
from typing import Annotated, Dict, List, Optional, Sequence
from fastapi import APIRouter, Cookie

from issuer import db
from issuer.db.models import Activity, Issue, Project, ProjectToUser
from issuer.routers.convertors import convert_project
from issuer.routers.models import ActivityEnum, ProjectPrivilegeEnum, \
    ProjectReq, ProjectRes
from issuer.routers.users import check_cookie
from issuer.routers.utils import empty_string_to_none, empty_strings_to_none


router = APIRouter(
    prefix='/project',
    tags=["project"],
    responses={404: {"description": "Not Found"}}
)


Logger = logging.getLogger(__name__)


@router.post('/new')
async def new_project(project: "ProjectReq",
                      current_user: Annotated[str | None, Cookie()] = None):
    '''
    新增项目接口。

    Args:
        project: :class:`ProjectReq`模型，必填:attr:`project_name`
            :attr:`start_date`和:attr:`privilege`字段。
        current_user: 请求Cookies，键为:arg:`current_user`，值为 user_code:token
            形式。

    '''
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    project = empty_strings_to_none(project)
    start_date = datetime.strptime(project.start_date, '%Y-%m-%d').date()
    end_date = datetime.strptime(project.end_date, '%Y-%m-%d').date() \
        if project.end_date is not None else None
    project_do = Project(project_name=project.project_name,
                         start_date=start_date,
                         end_date=end_date,
                         owner=_user.user_code,
                         description=project.description,
                         status='start',
                         budget=project.budget,
                         privilege=project.privilege)
    code = db.insert_project(project_do)
    if code is None:
        return {"success": False, "reason": "Fail to insert"}

    # 添加用户活动
    db.insert_activity(Activity(subject=_user.user_code,
                                target=code,
                                category=ActivityEnum.NewProject.name))

    # 将创建人加入关注
    res = db.insert_project_to_user(ProjectToUser(
        project_code=code, user_code=_user.user_code
    ))
    return {"success": res}


@router.post('/delete')
async def delete_project(project: "ProjectReq",
                         current_user: Annotated[str | None, Cookie()] = None):
    '''
    删除项目。

    Args:
        project: :class:`ProjectReq`模型，必填:attr:`project_code`字段。
        current_user: 请求Cookies，键为:arg:`current_user`，值为 user_code:token
            形式。

    '''
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    project = empty_strings_to_none(project)
    project_do = db.find_project_by_code(project.project_code)
    if project_do is None:
        return {"success": False, "reason": "Cannot find Project"}
    if project_do.owner != _user.user_code:
        return {"success": False, "reason": "Permission denied"}
    issues = db.list_issues_by_condition(project_code=project.project_code)
    if len(issues) > 0:
        return {"success": False, "reason": "Undeleted issues"}
    res = db.delete_project_by_code(project_do.project_code)

    # 添加用户活动
    db.insert_activity(Activity(subject=_user.user_code,
                                target=project.project_code,
                                category=ActivityEnum.DeleteProject.name))
    return {"success": res}


@router.post('/change')
async def change_project(project: "ProjectReq",
                         current_user: Annotated[str | None, Cookie()] = None):
    '''
    变更项目基本信息。

    Args:
        project: :class:`ProjectReq`模型，必填:attr:`project_code`字段。
        current_user: 请求Cookies，键为:arg:`current_user`，值为 user_code:token
            形式。

    '''
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}

    project = empty_strings_to_none(project)
    project_do = db.find_project_by_code(project.project_code)
    if project_do is None:
        return {"success": False, "reason": "Cannot find Project"}
    if project_do.owner != _user.user_code:
        return {"success": False, "reason": "Permission denied"}

    if project.project_name is not None:
        project_do.project_name = project.project_name
    if project.start_date is not None:
        start_date = datetime.strptime(project.start_date, '%Y-%m-%d').date()
        project_do.start_date = start_date
    if project.end_date is not None:
        end_date = datetime.strptime(project.end_date, '%Y-%m-%d').date()
        project_do.end_date = end_date
    if project.owner is not None:
        project_do.owner = project.owner
    if project.description is not None:
        project_do.description = project.description
    if project.status is not None:
        project_do.status = project.status
    if project.budget is not None:
        project_do.budget = project.budget
    if project.privilege is not None:
        project_do.privilege = project.privilege
    res = db.update_project_by_code(project_do)

    # 添加用户活动
    db.insert_activity(Activity(subject=_user.user_code,
                                target=project.project_code,
                                category=ActivityEnum.ChangeProject.name))
    return {"success": res}


@router.post('/add')
async def add_project(project: "ProjectReq",
                      current_user: Annotated[str | None, Cookie()] = None): # noqa
    '''
    变更该项目参与者。

    Args:
        project: :class:`ProjectReq`模型，必填:attr:`project_code`和
            :attr:`new_member`字段。
        current_user: 请求Cookies，键为:arg:`current_user`，值为 user_code:token
            形式。

    '''
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    project = empty_strings_to_none(project)
    res = db.insert_project_to_user(ProjectToUser(
        project_code=project.project_code,
        user_code=project.new_member))

    # 添加用户活动
    db.insert_activity(Activity(subject=_user.user_code,
                                target=project.project_code,
                                category=ActivityEnum.JoinProject.name))
    return {"success": res}


@router.get('/query_privileges')
async def query_privileges():
    '''获取项目公开性'''
    return {
        "success": True,
        "data": [
            {"value": ProjectPrivilegeEnum.Private.name, "label": "私有"},
            {"value": ProjectPrivilegeEnum.Public.name, "label": "公开"}
        ]
    }


@router.get('/query_status')
async def query_status():
    '''获取项目状态'''
    metas = db.list_metas_by_type('PROJECT_STATUS')
    return {
        "success": True,
        "data": [
            {"value": meta.meta_value, "label": meta.note} for meta in metas
        ]
    }


@router.get('/query', response_model=Dict[str, bool | str | ProjectRes])
async def query_project_by_code(project_code: str,
                                current_user: Annotated[str | None, Cookie()] = None): # noqa
    '''
    根据:arg:`project_code`查询项目。

    Args:
        project_code: 项目码。
        current_user: 请求Cookies，键为:arg:`current_user`，值为 user_code:token
            形式。

    '''
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}

    project = db.find_project_by_code(project_code=project_code)
    if project is None:
        return {"success": False, "reason": "Cannot find Project"}
    res = convert_project(project)

    if project.privilege == ProjectPrivilegeEnum.Private.name and \
            _user.user_code not in [u.user_code for u in res.participants]:
        return {"success": False, "reason": "Permission debied"}

    return {"success": True, "data": res}


@DeprecationWarning
@router.get('/participants',
            response_model=Dict[str, bool | str | List[ProjectRes]])
async def query_project_by_participants(user_code: str,
                                        page_num: int = 1,
                                        page_size: int = 10,
                                        current_user: Annotated[str | None, Cookie()] = None): # noqa
    '''
    根据:arg:`user_code`查询该用户参与的项目。

    Args:
        user_code: 用户码。
        page_num: 页码。
        page_size: 页数。
        current_user: 请求Cookies，键为:arg:`current_user`，值为 user_code:token
            形式。

    '''
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}

    p2us = db.list_project_to_user_by_user(user_code, page_num, page_size)
    res = list()
    for p2u in p2us:
        project_do = db.find_project_by_code(p2u.project_code)
        if project_do is None:
            Logger.error("Cannot find Project with project_code: "
                         f"{p2u.project_code}")
            continue
        project = convert_project(project_do)
        res.append(project)
    return {"success": True, "data": res}


@router.get('/list_projects',
            response_model=Dict[str, bool | str | List[ProjectRes]])
async def list_projects_by_condition(project_code: Optional[str] = None,
                                     project_name: Optional[str] = None,
                                     after_date: Optional[str] = None,
                                     before_date: Optional[str] = None,
                                     owner: Optional[str] = None,
                                     status: Optional[str] = None,
                                     participants: Optional[str] = None,
                                     page_num: int = 1,
                                     page_size: int = 10,
                                     current_user: Annotated[str | None, Cookie()] = None): # noqa
    '''
    根据给定条件获取对当前用户可见的所有项目。

    Args:
        project_code: 项目码。
        project_name: 项目名称，模糊查询。
        after_date: 筛选创建日期在该日期之后的项目。
        before_date: 筛选创建日期在该日期之前的项目。
        owner: 项目创建人，用户码表示。
        status: 项目状态。
        participants: 用半角逗号分隔的用户码字符串。
        page_num: 页码。
        page_size: 页数。
        current_user: 请求Cookies，键为:arg:`current_user`，值为 user_code:token
            形式。

    '''
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}

    project_code = empty_string_to_none(project_code)
    project_name = empty_string_to_none(project_name)
    after_date = empty_string_to_none(after_date)
    before_date = empty_string_to_none(before_date)
    owner = empty_string_to_none(owner)
    status = empty_string_to_none(status)
    participants = empty_string_to_none(participants)

    after_date = datetime.strptime(after_date, '%Y-%m-%d').date() \
        if after_date is not None else None
    before_date = datetime.strptime(before_date, '%Y-%m-%d').date() \
        if before_date is not None else None
    participants = participants.split(',') \
        if participants is not None else None

    project_dos = db.list_projects_by_condition(current_user=_user.user_code,
                                                project_code=project_code,
                                                project_name=project_name,
                                                before_date=before_date,
                                                after_date=after_date,
                                                owner=owner,
                                                status=status,
                                                participants=participants,
                                                page_num=page_num,
                                                page_size=page_size)
    res = list()
    for project_do in project_dos:
        res.append(convert_project(project_do))
    return {"success": True, "data": res}


@router.get('/count_projects',
            response_model=Dict[str, bool | str | List[ProjectRes] | int])
async def count_projects_by_condition(project_code: Optional[str] = None,
                                      project_name: Optional[str] = None,
                                      after_date: Optional[str] = None,
                                      before_date: Optional[str] = None,
                                      owner: Optional[str] = None,
                                      status: Optional[str] = None,
                                      participants: Optional[str] = None,
                                      current_user: Annotated[str | None, Cookie()] = None): # noqa
    '''
    根据给定条件获取对当前用户可见的所有项目的总数。

    Args:
        project_code: 项目码。
        project_name: 项目名称，模糊查询。
        after_date: 筛选创建日期在该日期之后的项目。
        before_date: 筛选创建日期在该日期之前的项目。
        owner: 项目创建人，用户码表示。
        status: 项目状态。
        participants: 用半角逗号分隔的用户码字符串。
        current_user: 请求Cookies，键为:arg:`current_user`，值为 user_code:token
            形式。

    '''
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}

    project_code = empty_string_to_none(project_code)
    project_name = empty_string_to_none(project_name)
    after_date = empty_string_to_none(after_date)
    before_date = empty_string_to_none(before_date)
    owner = empty_string_to_none(owner)
    status = empty_string_to_none(status)
    participants = empty_string_to_none(participants)

    after_date = datetime.strptime(after_date, '%Y-%m-%d').date() \
        if after_date is not None else None
    before_date = datetime.strptime(before_date, '%Y-%m-%d').date() \
        if before_date is not None else None
    participants = participants.split(',') \
        if participants is not None else None

    res = db.count_projects_by_condition(current_user=_user.user_code,
                                         project_code=project_code,
                                         project_name=project_name,
                                         before_date=before_date,
                                         after_date=after_date,
                                         owner=owner,
                                         status=status,
                                         participants=participants)
    if res is None:
        return {"success": False, "reason": "Internal error"}
    return {"success": True, "data": res}


@router.get('/stat_status',
            response_model=Dict[str, str | bool | Dict[str, int]])
async def stat_issue_state(project_code: str,
                           before_date: str, after_date: str,
                           current_user: Annotated[str | None, Cookie()] = None): # noqa
    '''
    统计给定时间范围内不同议题的状态占比。

    Args:
        project_code: 项目码。
        before_date: 统计结束日期。
        after_date: 统计开始日期。
    '''
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    project_code = empty_string_to_none(project_code)
    after_date = empty_string_to_none(after_date)
    before_date = empty_string_to_none(before_date)
    issues: Sequence["Issue"] = db.list_issues_by_condition(
        project_code=project_code,
        start_date=after_date,
        end_date=before_date)
    issue_status = map(lambda meta: meta.meta_value,
                       db.list_metas_by_type('ISSUE_STATUS'))
    res = dict.fromkeys(issue_status, 0)
    for issue in issues:
        res[issue.status] += 1
    return {"success": True, "data": res}


@router.get('/stat_date',
            response_model=Dict[str, str | bool | Dict[str, int]])
async def stat_issue_date(project_code: str,
                          before_date: str, after_date: str,
                          current_user: Annotated[str | None, Cookie()] = None): # noqa
    '''
    统计给定时间每日提出的议题的个数。

    Args:
        project_code: 项目码。
        before_date: 统计结束日期。
        after_date: 统计开始日期。
    '''
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    project_code = empty_string_to_none(project_code)
    after_date = empty_string_to_none(after_date)
    before_date = empty_string_to_none(before_date)
    issues: Sequence["Issue"] = db.list_issues_by_condition(
        project_code=project_code,
        start_date=after_date,
        end_date=before_date)
    start_date = datetime.strptime(after_date, "%Y-%m-%d")
    end_date = datetime.strptime(before_date, "%Y-%m-%d")
    delta_days = (end_date - start_date).days
    keys = [start_date + timedelta(days=day + 1) for day in range(delta_days)]
    keys = [key_date.strftime("%Y-%m-%d") for key_date in keys]
    res = dict.fromkeys(keys, 0)
    for issue in issues:
        if issue.propose_date.strftime("%Y-%m-%d") in res.keys():
            res[issue.propose_date.strftime("%Y-%m-%d")] += 1
    return {"success": True, "data": res}
