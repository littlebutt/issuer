from datetime import datetime
from typing import Annotated
from fastapi import APIRouter, Cookie

from issuer import db
from issuer.db.models import Project
from issuer.routers.models import ProjectPrivilegeEnum, ProjectReq, ProjectRes, \
    ProjectStatusEnum
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
    start_date = datetime.strptime(project.start_date, '%y-%m-%d').date()
    end_date = datetime.strptime(project.end_date, '%y-%m-%d').date() \
        if project.end_date is not None else None
    project_do = Project(project_name=project.project_name,
                         start_date=start_date,
                         end_date=end_date,
                         owner=_user.user_code,
                         description=project.description,
                         status=ProjectStatusEnum.Start.name,
                         budget=project.budget,
                         privilege=project.privilege)
    res = db.insert_project(project_do)
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
    if project_do.issues is not None or len(project_do.issues) != 0:
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
    start_date = datetime.strptime(project.start_date, '%y-%m-%d').date()
    end_date = datetime.strptime(project.end_date, '%y-%m-%d').date() \
        if project.end_date is not None else None
    project_do.project_name = project.project_name
    project_do.start_date = start_date
    project_do.end_date = end_date
    project_do.owner = project.owner
    project_do.description = project.description
    project_do.status = project.status
    project_do.budget = project.budget
    project_do.privilege = project.privilege
    res = db.update_project_by_code(project_do)
    return {"success": res}


@router.get('/query_privileges')
async def query_privileges():
    return {
        "success": True,
        "enums": [ProjectPrivilegeEnum.Private.name,
                  ProjectPrivilegeEnum.Public.name]
    }


@router.get('/query_status')
async def query_status():
    return {
        "success": True,
        "enums": [
            ProjectStatusEnum.Start.name,
            ProjectStatusEnum.Processing.name,
            ProjectStatusEnum.Check.name,
            ProjectStatusEnum.Finished.name
        ]
    }


@router.get('/query', response_model=ProjectRes)
async def query_project_by_code(project_code: str,
                                current_user: Annotated[str | None, Cookie()] = None): # noqa
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    project = db.find_project_by_code(project_code=project_code)
    owner = db.find_user_by_code(project.owner)
    p2us = db.list_project_to_user_by_project(project.project_code)
    participants = list()
    for p2u in p2us:
        participants.append(db.find_user_by_code(p2u.user_code))
    return ProjectRes(
        project_code=project.project_code,
        project_name=project.project_name,
        start_date=datetime.strftime(project.start_date, '%y-%m-%d'),
        end_date=datetime.strftime(project.end_date, '%y-%m-%d') if project.end_date is not None else "None", # noqa
        owner=owner,
        description=project.description,
        status=project.status,
        budget=project.budget,
        privilege=project.privilege,
        participants=participants,
        issues=project.issues
    )
