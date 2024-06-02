
import logging
from typing import Sequence
from sqlmodel import Session, select
from issuer.db.database import DatabaseFactory
from issuer.db.models import UserToUserGroup


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


def delete_user_to_user_group_by_user_and_group(user_code: str,
                                                group_code: str) -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(UserToUserGroup)\
                .where(UserToUserGroup.user_code == user_code,
                       UserToUserGroup.group_code == group_code)
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
            stmt = select(UserToUserGroup)\
                .where(UserToUserGroup.group_code == group_code)
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
            stmt = select(UserToUserGroup)\
                .where(UserToUserGroup.user_code == user_code)
            results = session.exec(stmt).all()

            for result in results:
                session.delete(result)
            session.commit()
    except Exception as e:
        Logger.error(e)
        return False
    return True


def find_user_to_user_group_by_user(user_code: str) -> \
        Sequence["UserToUserGroup"]:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(UserToUserGroup)\
                .where(UserToUserGroup.user_code == user_code)
            return session.exec(stmt).all()
    except Exception as e:
        Logger.error(e)
    return list()


def find_user_to_user_group_by_group(group_code: str) -> \
        Sequence["UserToUserGroup"]:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(UserToUserGroup)\
                .where(UserToUserGroup.group_code == group_code)
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
