import logging
from typing import Optional
from sqlmodel import Session, select
from issuer.db.models import User
from issuer.db.database import DatabaseFactory
from issuer.db.gen import generate_code


Logger = logging.getLogger(__name__)


def insert_user(user: "User") -> bool:
    user.user_code = generate_code('us')
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            session.add(user)
            session.commit()
            session.refresh(user)
    except Exception as e:
        Logger.error(e)
        return False
    return True


def update_user_by_code(user: "User") -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(User).where(User.user_code == user.user_code)
            results = session.exec(stmt)
            result = results.one()

            result.user_name = user.user_name
            result.passwd = user.passwd
            result.role = user.role
            result.description = user.description
            result.phone = user.phone
            result.token = user.token

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
