import logging
from typing import Annotated, Dict, List, Optional
from fastapi import APIRouter, Cookie

from issuer import db
from issuer.db.models import Notice
from issuer.routers.convertors import convert_notice
from issuer.routers.models import NoticeModel
from issuer.routers.users import check_cookie
from issuer.routers.utils import empty_string_to_none


router = APIRouter(
    prefix='/notice',
    tags=["notice"],
    responses={404: {"description": "Not Found"}}
)


Logger = logging.getLogger(__name__)


@router.post('/new')
async def new_notice(content: str,
                     current_user: Annotated[str | None, Cookie()] = None):
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    res = db.insert_notice(Notice(content=content))
    if res is not None:
        return {"success": True}
    return {"success": False}


@router.get('/list_notices',
            response_model=Dict[str, bool | str | List[NoticeModel]])
async def list_notice(limit: Optional[int],
                      current_user: Annotated[str | None, Cookie()] = None):
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    limit = empty_string_to_none(limit)
    results = db.list_notices(limit=limit)
    res = []
    for result in results:
        res.append(convert_notice(result))
    return {"success": True, "data": res}


@router.post('/delete')
async def delete_notice(notice_code: str,
                        current_user: Annotated[str | None, Cookie()] = None):
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    res = db.delete_notice_by_code(notice_code)
    return {"success": res}
