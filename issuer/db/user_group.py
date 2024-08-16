from datetime import datetime
import logging
from typing import Optional, Sequence

from sqlalchemy import func
from sqlmodel import Session, or_, select

from issuer.db.database import DatabaseFactory
from issuer.db.gen import generate_code
from issuer.db.models import UserGroup, UserToUserGroup


Logger = logging.getLogger(__name__)


def insert_user_group(user_group: "UserGroup") -> str | None:
    if user_group.group_code is None:
        user_group.group_code = generate_code("UG")
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            session.add(user_group)
            session.commit()
            session.refresh(user_group)
    except Exception as e:
        Logger.error(e)
        return None
    return user_group.group_code


def update_user_group_by_code(user_group: "UserGroup") -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(UserGroup).where(
                UserGroup.group_code == user_group.group_code
            )
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


def list_user_group_by_condition(
    group_code: Optional[str] = None,
    group_name: Optional[str] = None,
    owner: Optional[str] = None,
    members: Optional[Sequence[str]] = None,
    page_num: int = 1,
    page_size: int = 10,
) -> Sequence["UserGroup"]:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(UserGroup).where(
                UserGroup.group_code == UserToUserGroup.group_code
            )
            if group_code is not None:
                stmt = stmt.where(UserGroup.group_code == group_code)
            if group_name is not None:
                stmt = stmt.where(
                    UserGroup.group_name.like("%" + group_name + "%")
                )  # noqa
            if owner is not None:
                stmt = stmt.where(UserGroup.group_owner == owner)
            if members is not None:
                or_clauses = []
                for member in members:
                    or_clauses.append(UserToUserGroup.user_code == member)
                stmt = stmt.where(or_(*or_clauses))
            stmt = (
                stmt.distinct()
                .limit(page_size)
                .offset((page_num - 1) * page_size)
            )
            results = session.exec(stmt)
            return results.all()
    except Exception as e:
        Logger.error(e)
    return list()


def count_user_group_by_condition(
    group_code: Optional[str] = None,
    group_name: Optional[str] = None,
    owner: Optional[str] = None,
    members: Optional[Sequence[str]] = None,
) -> Optional[int]:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(func.count(UserGroup.id)).where(
                UserGroup.group_code == UserToUserGroup.group_code
            )
            if group_code is not None:
                stmt = stmt.where(UserGroup.group_code == group_code)
            if group_name is not None:
                stmt = stmt.where(
                    UserGroup.group_name.like("%" + group_name + "%")
                )  # noqa
            if owner is not None:
                stmt = stmt.where(UserGroup.group_owner == owner)
            if members is not None:
                or_clauses = []
                for member in members:
                    or_clauses.append(UserToUserGroup.user_code == member)
                stmt = stmt.where(or_(*or_clauses))
            stmt = stmt.distinct()
            result = session.scalar(stmt)
            return result
    except Exception as e:
        Logger.error(e)
    return None


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
