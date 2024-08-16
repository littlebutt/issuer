from datetime import datetime
import logging
from typing import Optional, Sequence
from sqlmodel import Session, select
from issuer.db.models import User
from issuer.db.database import DatabaseFactory
from issuer.db.gen import generate_code


Logger = logging.getLogger(__name__)


def insert_user(user: "User") -> bool:
    if user.user_code is None:
        user.user_code = generate_code("US")
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            session.add(user)
            session.commit()
            session.refresh(user)
    except Exception:
        return False
    return True


def update_user_by_code(user: "User") -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(User).where(User.user_code == user.user_code)
            results = session.exec(stmt)
            result = results.one()

            result.gmt_modified = datetime.utcnow()
            result.user_name = user.user_name
            result.passwd = user.passwd
            result.role = user.role
            result.description = user.description
            result.phone = user.phone
            result.email = user.email
            result.token = user.token
            result.avatar = user.avatar

            session.add(result)
            session.commit()
            session.refresh(result)
    except Exception as e:
        Logger.error(e)
        return False
    return True


def delete_user_by_code(user_code: str):
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(User).where(User.user_code == user_code)
            results = session.exec(stmt)
            result = results.one()

            session.delete(result)
            session.commit()
    except Exception as e:
        Logger.error(e)
    return True


def delete_all_users():
    with Session(DatabaseFactory.get_db().get_engine()) as session:
        stmt = select(User)
        results = session.exec(stmt).all()
        for result in results:
            session.delete(result)
        session.commit()


def find_user_by_email(email: str) -> Optional["User"]:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(User).where(User.email == email)
            return session.exec(stmt).one()
    except Exception as e:
        Logger.error(e)
    return None


def find_user_by_code(user_code: str) -> Optional["User"]:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(User).where(User.user_code == user_code)
            return session.exec(stmt).one()
    except Exception as e:
        Logger.error(e)
    return None


def list_users(page_num: int = 1, page_size: int = 10) -> Sequence["User"]:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = (
                select(User)
                .limit(page_size)
                .offset((page_num - 1) * page_size)
            )
            return session.exec(stmt).all()
    except Exception as e:
        Logger.error(e)
    return list()
