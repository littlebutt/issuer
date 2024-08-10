import logging
from typing import Optional, Sequence

from sqlmodel import Session, select

from issuer.db.database import DatabaseFactory
from issuer.db.gen import generate_code
from issuer.db.models import Notice


Logger = logging.getLogger(__name__)


def insert_notice(notice: "Notice") -> str | None:
    if notice.notice_code is None:
        notice.notice_code = generate_code('NT')
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            session.add(notice)
            session.commit()
            session.refresh(notice)
    except Exception as e:
        Logger.error(e)
        return None
    return notice.notice_code


def list_notices(limit: Optional[int] = None) -> Sequence["Notice"]:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(Notice).order_by(Notice.id.desc())
            if limit is not None:
                stmt.limit(limit)
            results = session.exec(stmt).all()
            return results
    except Exception as e:
        Logger.error(e)
    return []


def delete_notice_by_code(notice_code: str) -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(Notice).where(Notice.notice_code == notice_code)
            result = session.exec(stmt).one()
            session.delete(result)
            session.commit()
            return True
    except Exception as e:
        Logger.error(e)
    return False


def delete_all_notices() -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(Notice)
            results = session.exec(stmt).all()
            for result in results:
                session.delete(result)
            session.commit()
            return True
    except Exception as e:
        Logger.error(e)
    return False
