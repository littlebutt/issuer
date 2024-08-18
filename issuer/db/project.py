from datetime import date, datetime
import logging
from typing import Optional, Sequence
from sqlalchemy import distinct, func
from sqlmodel import Session, or_, select
from issuer.db.database import DatabaseFactory
from issuer.db.gen import generate_code
from issuer.db.models import Project, ProjectToUser


Logger = logging.getLogger(__name__)


def insert_project(project: "Project") -> str | None:
    if project.project_code is None:
        project.project_code = generate_code("PJ")
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            session.add(project)
            session.commit()
            session.refresh(project)
    except Exception as e:
        Logger.error(e)
        return None
    return project.project_code


def update_project_by_code(project: "Project") -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(Project).where(
                Project.project_code == project.project_code
            )
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


def list_project_by_owner(
    owner: str, page_num: int = 1, page_size: int = 10
) -> Sequence["Project"]:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = (
                select(Project)
                .where(Project.owner == owner)
                .limit(page_size)
                .offset((page_num - 1) * page_size)
            )
            return session.exec(stmt).all()
    except Exception as e:
        Logger.error(e)
    return list()


def list_projects_by_condition(
    current_user: str,
    project_code: Optional[str] = None,
    project_name: Optional[str] = None,
    before_date: Optional[date] = None,
    after_date: Optional[date] = None,
    owner: Optional[str] = None,
    status: Optional[str] = None,
    participants: Optional[Sequence[str]] = None,
    page_num: int = 1,
    page_size: int = 10,
) -> Sequence["Project"]:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(Project).where(
                Project.project_code == ProjectToUser.project_code
            )
            if project_code is not None:
                stmt = stmt.where(Project.project_code == project_code)
            if project_name is not None:
                stmt = stmt.where(
                    Project.project_name.like("%" + project_name + "%")
                )
            if before_date is not None:
                stmt = stmt.where(Project.start_date < before_date)
            if after_date is not None:
                stmt = stmt.where(Project.start_date > after_date)
            if owner is not None:
                stmt = stmt.where(Project.owner == owner)
            if status is not None:
                stmt = stmt.where(Project.status == status)
            if participants is not None:
                or_clauses = []
                for participant in participants:
                    or_clauses.append(ProjectToUser.user_code == participant)
                stmt = stmt.where(or_(*or_clauses))
            stmt = (
                stmt.distinct()
                .where(
                    or_(
                        Project.privilege == "Public",
                        Project.owner == current_user,
                        ProjectToUser.user_code == current_user,
                    )
                )
                .limit(page_size)
                .offset((page_num - 1) * page_size)
            )
            result = session.exec(stmt).all()
            return result
    except Exception as e:
        Logger.error(e)
    return list()


def count_projects_by_condition(
    current_user: str,
    project_code: Optional[str] = None,
    project_name: Optional[str] = None,
    before_date: Optional[date] = None,
    after_date: Optional[date] = None,
    owner: Optional[str] = None,
    status: Optional[str] = None,
    participants: Optional[Sequence[str]] = None,
) -> Optional[int]:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(func.count(distinct(Project.id))).where(
                Project.project_code == ProjectToUser.project_code
            )
            if project_code is not None:
                stmt = stmt.where(Project.project_code == project_code)
            if project_name is not None:
                stmt = stmt.where(
                    Project.project_name.like("%" + project_name + "%")
                )
            if before_date is not None:
                stmt = stmt.where(Project.start_date < before_date)
            if after_date is not None:
                stmt = stmt.where(Project.start_date > after_date)
            if owner is not None:
                stmt = stmt.where(Project.owner == owner)
            if status is not None:
                stmt = stmt.where(Project.status == status)
            if participants is not None:
                or_clauses = []
                for participant in participants:
                    or_clauses.append(ProjectToUser.user_code == participant)
                stmt = stmt.where(or_(*or_clauses))
            stmt = stmt.where(
                or_(
                    Project.privilege == "Public",
                    Project.owner == current_user,
                    ProjectToUser.user_code == current_user,
                )
            )
            result = session.scalar(stmt)
            return result if result is not None else 0
    except Exception as e:
        Logger.error(e)
    return None


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
