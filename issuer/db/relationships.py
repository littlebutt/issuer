import logging
from typing import Sequence
from sqlalchemy import func
from sqlmodel import Session, select
from issuer.db.database import DatabaseFactory
from issuer.db.models import ProjectToUser, UserToUserGroup


Logger = logging.getLogger(__name__)


def insert_user_to_user_group(user_to_user_group: "UserToUserGroup") -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            session.add(user_to_user_group)
            session.commit()
            session.refresh(user_to_user_group)
    except Exception as e:
        Logger.error(e)
        return False
    return True


def delete_user_to_user_group_by_user_and_group(
    user_code: str, group_code: str
) -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(UserToUserGroup).where(
                UserToUserGroup.user_code == user_code,
                UserToUserGroup.group_code == group_code,
            )
            result = session.exec(stmt).one()

            session.delete(result)
            session.commit()
    except Exception as e:
        Logger.error(e)
        return False
    return True


def delete_user_to_user_group_by_group(group_code: str) -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(UserToUserGroup).where(
                UserToUserGroup.group_code == group_code
            )
            results = session.exec(stmt).all()

            for result in results:
                session.delete(result)
            session.commit()
    except Exception as e:
        Logger.error(e)
        return False
    return True


def delete_user_to_user_group_by_user(user_code: str) -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(UserToUserGroup).where(
                UserToUserGroup.user_code == user_code
            )
            results = session.exec(stmt).all()

            for result in results:
                session.delete(result)
            session.commit()
    except Exception as e:
        Logger.error(e)
        return False
    return True


def list_user_to_user_group_by_user(
    user_code: str, page_num: int = 1, page_size: int = 10
) -> Sequence["UserToUserGroup"]:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = (
                select(UserToUserGroup)
                .where(UserToUserGroup.user_code == user_code)
                .limit(page_size)
                .offset((page_num - 1) * page_size)
            )
            return session.exec(stmt).all()
    except Exception as e:
        Logger.error(e)
    return list()


def count_user_to_user_group_by_user(user_code: str) -> int:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(func.count(UserToUserGroup.id)).where(
                UserToUserGroup.user_code == user_code
            )
            return session.scalar(stmt)
    except Exception as e:
        Logger.error(e)
    return 0


def list_user_to_user_group_by_group(
    group_code: str, page_num: int = 1, page_size: int = 10
) -> Sequence["UserToUserGroup"]:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = (
                select(UserToUserGroup)
                .where(UserToUserGroup.group_code == group_code)
                .limit(page_size)
                .offset((page_num - 1) * page_size)
            )
            return session.exec(stmt).all()
    except Exception as e:
        Logger.error(e)
    return list()


def delete_all_user_to_user_group() -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(UserToUserGroup)
            user_to_user_groups = session.exec(stmt).all()
            for user_to_user_group in user_to_user_groups:
                session.delete(user_to_user_group)
            session.commit()
    except Exception as e:
        Logger.error(e)
        return False
    return True


def insert_project_to_user(project_to_user: "ProjectToUser") -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            session.add(project_to_user)
            session.commit()
            session.refresh(project_to_user)
    except Exception as e:
        Logger.error(e)
        return False
    return True


def delete_project_to_user_by_project_and_user(
    project_code: str, user_code: str
) -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(ProjectToUser).where(
                ProjectToUser.project_code == project_code,
                ProjectToUser.user_code == user_code,
            )
            result = session.exec(stmt).one()

            session.delete(result)
            session.commit()
    except Exception as e:
        Logger.error(e)
        return False
    return True


def delete_project_to_user_by_project(project_code: str) -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(ProjectToUser).where(
                ProjectToUser.project_code == project_code
            )
            results = session.exec(stmt).all()
            for result in results:
                session.delete(result)
            session.commit()
    except Exception as e:
        Logger.error(e)
        return False
    return True


def list_project_to_user_by_project(
    project_code: str, page_num: int = 1, page_size: int = 10
) -> Sequence["ProjectToUser"]:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = (
                select(ProjectToUser)
                .where(ProjectToUser.project_code == project_code)
                .limit(page_size)
                .offset((page_num - 1) * page_size)
            )
            return session.exec(stmt).all()
    except Exception as e:
        Logger.error(e)
    return list()


def list_project_to_user_by_user(
    user_code: str, page_num: int = 1, page_size: int = 10
) -> Sequence["ProjectToUser"]:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = (
                select(ProjectToUser)
                .where(ProjectToUser.user_code == user_code)
                .limit(page_size)
                .offset((page_num - 1) * page_size)
            )
            return session.exec(stmt).all()
    except Exception as e:
        Logger.error(e)
    return list()


def delete_all_project_to_user() -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(ProjectToUser)
            results = session.exec(stmt).all()

            for result in results:
                session.delete(result)
            session.commit()
    except Exception as e:
        Logger.error(e)
        return False
    return True
