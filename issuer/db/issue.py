from datetime import date, datetime
import logging
from typing import Optional, Sequence
from sqlalchemy import func
from sqlmodel import Session, select
from issuer.db.database import DatabaseFactory
from issuer.db.gen import generate_code
from issuer.db.models import Issue


Logger = logging.getLogger(__name__)


def insert_issue(issue: "Issue") -> str | None:
    if issue.issue_code is None:
        issue.issue_code = generate_code('IS')
    issue_id = count_issue_by_project(issue.project_code)
    issue.issue_id = issue_id + 1
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            session.add(issue)
            session.commit()
            session.refresh(issue)
    except Exception as e:
        Logger.error(e)
        return None
    return issue.issue_code


def update_issue_by_code(issue: "Issue") -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(Issue).where(Issue.issue_code == issue.issue_code)
            result = session.exec(stmt).one()

            result.gmt_modified = datetime.utcnow()
            result.title = issue.title
            result.status = issue.status
            result.tags = issue.tags
            result.followers = issue.followers
            session.add(result)
            session.commit()
            session.refresh(result)
    except Exception as e:
        Logger.error(e)
        return False
    return True


def count_issue_by_project(project_code: str) -> int:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(func.count(Issue.id)) \
                .where(Issue.project_code == project_code)
            result = session.scalar(stmt)
            return result
    except Exception as e:
        Logger.error(e)
    return None


def delete_issue_by_code(issue_code: str) -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(Issue).where(Issue.issue_code == issue_code)
            result = session.exec(stmt).one()

            session.delete(result)
            session.commit()
    except Exception as e:
        Logger.error(e)
        return False
    return True


def list_issues_by_condition(issue_code: Optional[str] = None,
                             project_code: Optional[str] = None,
                             owner: Optional[str] = None,
                             status: Optional[str] = None,
                             issue_id: Optional[int] = None,
                             title: Optional[str] = None,
                             start_date: Optional[date] = None,
                             end_date: Optional[date] = None,
                             follower: Optional[str] = None,
                             page_num: int = 1,
                             page_size: int = 10) -> Sequence["Issue"]:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(Issue)
            if issue_code is not None:
                stmt = stmt.where(Issue.issue_code == issue_code)
            if project_code is not None:
                stmt = stmt.where(Issue.project_code == project_code)
            if owner is not None:
                stmt = stmt.where(Issue.owner == owner)
            if status is not None:
                stmt - stmt.where(Issue.status == status)
            if issue_id is not None:
                stmt = stmt.where(Issue.issue_id == issue_id)
            if title is not None:
                stmt = stmt.where(Issue.title.like('%' + title + '%'))
            if start_date is not None:
                stmt = stmt.where(Issue.propose_date >= start_date)
            if end_date is not None:
                stmt = stmt.where(Issue.propose_date <= end_date)
            if follower is not None:
                stmt = stmt.where(Issue.followers.like('%' + follower + '%'))
            stmt = stmt.limit(page_size).offset((page_num - 1) * page_size)
            results = session.exec(stmt).all()
            return results
    except Exception as e:
        Logger.error(e)
    return list()


def delete_all_issues() -> bool:
    try:
        with Session(DatabaseFactory.get_db().get_engine()) as session:
            stmt = select(Issue)
            results = session.exec(stmt).all()

            for result in results:
                session.delete(result)
            session.commit()
    except Exception as e:
        Logger.error(e)
        return False
    return True

# TODO: list issues by tags
