from datetime import datetime
import logging
from typing import Optional, Sequence

from sqlmodel import Session, or_, select

from issuer.db.database import DatabaseFactory
from issuer.db.models import Activity


Logger = logging.getLogger(__name__)


def insert_activity(activity: "Activity") -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            session.add(activity)
            session.commit()
            session.refresh(activity)
    except Exception as e:
        Logger.error(e)
        return False
    return True


def delete_activity_by_create_time(create_time: datetime) -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(Activity).where(Activity.gmt_create < create_time)
            results = session.exec(stmt).all()

            for result in results:
                session.delete(result)
            session.commit()
    except Exception as e:
        Logger.error(e)
        return False
    return True


def list_activities_by_subject(
    subject: str, limit: Optional[int] = None
) -> Sequence["Activity"]:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = (
                select(Activity)
                .where(Activity.subject == subject)
                .order_by(Activity.id.desc())
            )
            if limit is not None:
                stmt = stmt.limit(limit)
            results = session.exec(stmt).all()
            return results
    except Exception as e:
        Logger.error(e)
    return []


def list_activities_by_targets(
    targets: Sequence[str], limit: Optional[int] = None
) -> Sequence["Activity"]:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(Activity)
            or_clauses = []
            for target in targets:
                or_clauses.append(Activity.target == target)
            stmt = stmt.where(or_(*or_clauses)).order_by(Activity.id.desc())
            if limit is not None:
                stmt = stmt.limit(limit)
            results = session.exec(stmt).all()
            return results
    except Exception as e:
        Logger.error(e)
    return []
