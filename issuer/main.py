from fastapi import FastAPI

from issuer.db import DatabaseFactory, User, insert_user
from issuer.routers import users, user_group


app = FastAPI()


app.include_router(users.router)
app.include_router(user_group.router)


@app.on_event('startup')
async def create_engine():
    app.db = DatabaseFactory.get_db()
    admin = User(user_name="admin", passwd="admin", role='admin', email="NULL")
    insert_user(admin)
