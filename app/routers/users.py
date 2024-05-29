from fastapi import APIRouter, HTTPException


from routers.models import User


router = APIRouter(
        prefix='/users',
        tags=["users"],
        responses={404: {"description": "Not Found"}}
        )



@router.post('/sign_in')
async def sign_up(user: User):
    if user.user_name is None:
        raise HTTPException(status_code=404, detail="user_name not provided")
    if user.passwd is None:
        raise HTTPException(status_code=404, detail="passwd not provided")

