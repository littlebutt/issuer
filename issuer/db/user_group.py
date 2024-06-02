from datetime import datetime
import logging
from typing import Optional, Sequence

from sqlmodel import Session, select

from issuer.db.database import DatabaseFactory
from issuer.db.gen import generate_code
from issuer.db.models import UserGroup


Logger = logging.getLogger(__name__)


def insert_user_group(user_group: "UserGroup") -> bool:
    if user_group.group_code is None:
        user_group.group_code = generate_code('UG')
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            session.add(user_group)
            session.commit()
            session.refresh(user_group)
    except Exception as e:
        Logger.error(e)
        return False
    return True


def update_user_group_by_code(user_group: "UserGroup") -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(UserGroup) \
                .where(UserGroup.group_code == user_group.group_code)
            results = session.exec(stmt)
            result = results.one()

            result.gmt_modified = datetime.utcnow()
            result.group_name = user_group.group_name
            result.group_owner = user_group.group_owner

            session.add(result)
            session.commit()
            session.refresh(result)
    except Exception as e:
        Logger.error(e)
        return False
    return True


def delete_user_group_by_code(group_code: str) -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(UserGroup).where(UserGroup.group_code == group_code)
            results = session.exec(stmt)
            result = results.one()

            session.delete(result)
            session.commit()
    except Exception as e:
        Logger.error(e)
        return False
    return True


def find_user_group_by_code(group_code: str) -> Optional["UserGroup"]:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(UserGroup).where(UserGroup.group_code == group_code)
            results = session.exec(stmt)
            return results.one()
    except Exception as e:
        Logger.error(e)
    return None


def find_user_group_by_owner(owner: str) -> Sequence["UserGroup"]:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(UserGroup).where(UserGroup.group_owner == owner)
            results = session.exec(stmt)
            return results.all()
    except Exception as e:
        Logger.error(e)
    return list()


def delete_all_user_groups() -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(UserGroup)
            results = session.exec(stmt).all()

            for result in results:
                session.delete(result)
            session.commit()
    except Exception as e:
        Logger.error(e)
        return False
    return True
