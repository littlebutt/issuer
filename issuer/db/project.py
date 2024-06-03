from datetime import datetime
import logging
from typing import Optional, Sequence
from sqlmodel import Session, select
from issuer.db.database import DatabaseFactory
from issuer.db.gen import generate_code
from issuer.db.models import Project


Logger = logging.getLogger(__name__)


def insert_project(project: "Project") -> bool:
    if project.project_code is None:
        project.project_code = generate_code('PJ')
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            session.add(project)
            session.commit()
            session.refresh(project)
    except Exception as e:
        Logger.error(e)
        return False
    return True


def update_project_by_code(project: "Project") -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(Project)\
                .where(Project.project_code == project.project_code)
            result = session.exec(stmt).one()

            result.gmt_modified = datetime.utcnow()
            result.project_name = project.project_name
            result.start_date = project.start_date
            result.end_date = project.end_date
            result.owner = project.owner
            result.description = project.description
            result.status = project.status
            result.budget = project.budget
            result.privilege = project.privilege
            result.issues = project.issues
            session.add(result)
            session.commit()
            session.refresh(result)
    except Exception as e:
        Logger.error(e)
        return False
    return True


def delete_project_by_code(project_code: str) -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(Project).where(Project.project_code == project_code)
            result = session.exec(stmt).one()

            session.delete(result)
            session.commit()
    except Exception as e:
        Logger.error(e)
        return False
    return True


def find_project_by_code(project_code: str) -> Optional["Project"]:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(Project).where(Project.project_code == project_code)
            return session.exec(stmt).one()
    except Exception as e:
        Logger.error(e)
    return None


def list_project_by_owner(owner: str,
                          page_num: int = 1,
                          page_size: int = 10) -> Sequence["Project"]:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(Project) \
                .where(Project.owner == owner) \
                .limit(page_size).offset((page_num - 1) * page_size)
            return session.exec(stmt).all()
    except Exception as e:
        Logger.error(e)
    return list()


def delete_all_projects() -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(Project)
            results = session.exec(stmt).all()

            for result in results:
                session.delete(result)
            session.commit()
    except Exception as e:
        Logger.error(e)
        return False
    return True
