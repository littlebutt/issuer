from datetime import datetime
from typing import Annotated, Dict, List
from fastapi import APIRouter, Cookie

from issuer import db
from issuer.db.models import Project, ProjectToUser
from issuer.routers.models import ProjectPrivilegeEnum, ProjectReq, \
    ProjectRes, UserModel
from issuer.routers.users import check_cookie


router = APIRouter(
    prefix='/project',
    tags=["project"],
    responses={404: {"description": "Not Found"}}
)


@router.post('/new')
async def new_project(project: "ProjectReq",
                      current_user: Annotated[str | None, Cookie()] = None):
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
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
    res = db.insert_project(project_do)
    if res is None:
        return {"success": False, "reason": "Fail to insert"}
    project = db.find_project_by_code(res)
    res = db.insert_project_to_user(ProjectToUser(
        project_code=project.project_code, user_code=_user.user_code
    ))
    return {"success": res}


@router.post('/delete')
async def delete_project(project: "ProjectReq",
                         current_user: Annotated[str | None, Cookie()] = None):
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}

    project_do = db.find_project_by_code(project.project_code)
    if project_do.owner != _user.user_code:
        return {"success": False, "reason": "Permission denied"}
    issues = db.list_issues_by_condition(project_code=project.project_code)
    if len(issues) > 0:
        return {"success": False, "reason": "Undeleted issues"}
    res = db.delete_project_by_code(project_do.project_code)
    return {"success": res}


@router.post('/change')
async def change_project(project: "ProjectReq",
                         current_user: Annotated[str | None, Cookie()] = None):
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    project_do = db.find_project_by_code(project.project_code)
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
    return {"success": res}


@router.post('/change_members')
async def change_project_members(project: "ProjectReq",
                                 current_user: Annotated[str | None, Cookie()] = None): # noqa
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    db.delete_project_to_user_by_project(project.project_code)
    members = project.members.split(',')
    for member in members:
        db.insert_project_to_user(ProjectToUser(
            project_code=project.project_code,
            user_code=member))
    return {"success": True}


@router.get('/query_privileges')
async def query_privileges():
    return {
        "success": True,
        "data": [ProjectPrivilegeEnum.Private.name,
                 ProjectPrivilegeEnum.Public.name]
    }


@router.get('/query_status')
async def query_status():
    metas = db.list_metas_by_type('PROJECT_STATUS')
    return {
        "success": True,
        "data": [meta.meta_value for meta in metas]
    }


@router.get('/query', response_model=ProjectRes | Dict)
async def query_project_by_code(project_code: str,
                                current_user: Annotated[str | None, Cookie()] = None): # noqa
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    project = db.find_project_by_code(project_code=project_code)
    owner = db.find_user_by_code(project.owner)
    p2us = db.list_project_to_user_by_project(project.project_code)
    participants: List["UserModel"] = list()
    for p2u in p2us:
        user_do = db.find_user_by_code(p2u.user_code)
        participants.append(UserModel(
            user_code=user_do.user_code,
            user_name=user_do.user_name,
            email=user_do.email,
            role=user_do.role,
            description=user_do.description,
            phone=user_do.phone
        ))
    if project.privilege == ProjectPrivilegeEnum.Private.name and \
            _user.user_code not in [u.user_code for u in participants]:
        return {"success": False, "reason": "Permission debied"}
    return ProjectRes(
        project_code=project.project_code,
        project_name=project.project_name,
        start_date=datetime.strftime(project.start_date, '%Y-%m-%d'),
        end_date=datetime.strftime(project.end_date, '%Y-%m-%d') if project.end_date is not None else None, # noqa
        owner=UserModel(
            user_code=owner.user_code,
            user_name=owner.user_name,
            email=owner.email,
            role=owner.role,
            description=owner.description,
            phone=owner.phone
        ),
        description=project.description,
        status=project.status,
        budget=project.budget,
        privilege=project.privilege,
        participants=participants
    )


@router.get('/participants', response_model=List[ProjectRes] | Dict)
async def query_project_by_participants(user_code: str,
                                        page_num: int = 1,
                                        page_size: int = 10,
                                        current_user: Annotated[str | None, Cookie()] = None): # noqa
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}

    p2us = db.list_project_to_user_by_user(user_code, page_num, page_size)
    res = list()
    for p2u in p2us:
        project = db.find_project_by_code(p2u.project_code)
        owner = db.find_user_by_code(project.owner)
        _p2us = db.list_project_to_user_by_project(project.project_code)
        _participants = list()
        for _p2u in _p2us:
            _participants.append(_p2u.user_code)
        participants = ','.join(_participants)
        if project.privilege == ProjectPrivilegeEnum.Private.name and \
                _user.user_code not in _participants:
            continue
        res.append(ProjectRes(
            project_code=project.project_code,
            project_name=project.project_name,
            start_date=datetime.strftime(project.start_date, '%Y-%m-%d'),
            end_date=datetime.strftime(project.end_date, '%Y-%m-%d') if project.end_date is not None else None, # noqa
            owner=UserModel(
                user_code=owner.user_code,
                user_name=owner.user_name,
                email=owner.email,
                role=owner.role,
                description=owner.description,
                phone=owner.phone
            ),
            description=project.description,
            status=project.status,
            budget=project.budget,
            privilege=project.privilege,
            participants=participants
        ))
    return res
