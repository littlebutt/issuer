import logging
from sqlmodel import Session, select
from db.models import User
from db.database import DatabaseFactory
from db.gen import generate_code


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

            session.add(result)
            session.commit()
            session.refresh(result)
    except Exception as e:
        Logger.error(e)
        return False
    return True


def delete_user_by_code(user_code: str):
    with Session(DatabaseFactory.get_db().get_engine()) as session:
        stmt = select(User).where(User.user_code == user_code)
        results = session.exec(stmt)
        result = results.one()

        session.delete(result)
        session.commit()


def delete_all_users():
    with Session(DatabaseFactory.get_db().get_engine()) as session:
        stmt = select(User)
        results = session.exec(stmt).all()
        for result in results:
            session.delete(result)
        session.commit()


def find_user_by_email(email: str):
    with Session(DatabaseFactory.get_db().get_engine()) as session:
        stmt = select(User).where(User.email == email)
        return session.exec(stmt).one()
