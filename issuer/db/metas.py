import logging
from typing import Optional, Sequence

from sqlmodel import Session, select
from issuer.db.database import DatabaseFactory
from issuer.db.models import Metas


Logger = logging.getLogger(__name__)


def insert_metas(metas: "Metas") -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            session.add(metas)
            session.commit()
            session.refresh(metas)
    except Exception:
        return False
    return True


def delete_metas(metas: "Metas") -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(Metas).where(Metas.meta_type == metas.meta_type)\
                .where(Metas.meta_value == metas.meta_value)
            result = session.exec(stmt).one()
            session.delete(result)
            session.commit()
    except Exception as e:
        Logger.error(e)
        return False
    return True


def list_metas_by_type(meta_type: str) -> Sequence["Metas"]:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(Metas).where(Metas.meta_type == meta_type)
            results = session.exec(stmt).all()
            return results
    except Exception as e:
        Logger.error(e)
    return list()
