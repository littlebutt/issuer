from datetime import datetime
import logging
from typing import Sequence

from sqlmodel import Session, select
from issuer.db.database import DatabaseFactory
from issuer.db.gen import generate_code
from issuer.db.models import IssueComment


Logger = logging.getLogger(__name__)


def insert_issue_comment(comment: "IssueComment") -> str | None:
    if comment.comment_code is None:
        comment.comment_code = generate_code('IC')
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            session.add(comment)
            session.commit()
            session.refresh(comment)
    except Exception as e:
        Logger.error(e)
        return None
    return comment.comment_code


def delete_issue_comment_by_issue(issue_code: str) -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(IssueComment)\
                .where(IssueComment.issue_code == issue_code)
            results = session.exec(stmt).all()

            for result in results:
                session.delete(result)
            session.commit()
    except Exception as e:
        Logger.error(e)
        return False
    return True


def change_issue_comment_by_code(comment: "IssueComment") -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(IssueComment)\
                .where(IssueComment.comment_code == comment.comment_code)
            result = session.exec(stmt).one()

            result.gmt_modified = datetime.utcnow()
            result.fold = comment.fold
            session.add(result)
            session.commit()
            session.refresh(result)
    except Exception as e:
        Logger.error(e)
        return False
    return True


def list_issue_comment_by_issue(issue_code: str) -> Sequence["IssueComment"]:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(IssueComment)\
                .where(IssueComment.issue_code == issue_code)
            return session.exec(stmt).all()
    except Exception as e:
        Logger.error(e)
    return list()


def list_issue_comment_by_commenter(user_code: str) -> \
        Sequence["IssueComment"]:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(IssueComment)\
                .where(IssueComment.commenter == user_code)
            return session.exec(stmt).all()
    except Exception as e:
        Logger.error(e)
    return list()


def delete_all_issue_comments() -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(IssueComment)
            results = session.exec(stmt).all()

            for result in results:
                session.delete(result)
            session.commit()
    except Exception as e:
        Logger.error(e)
        return False
    return True
