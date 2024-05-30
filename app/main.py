from fastapi import FastAPI

from db import DatabaseFactory, User, insert_user
from routers import users


app = FastAPI()


app.include_router(users.router)


@app.on_event('startup')
async def create_engine():
    app.db = DatabaseFactory.get_db()
    admin = User(user_name="admin", passwd="admin", role='admin', email="NULL")
    insert_user(admin)
