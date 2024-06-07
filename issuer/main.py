from fastapi import FastAPI

from issuer.db import DatabaseFactory, User, insert_user
from issuer.routers import users, user_group, project, issue


app = FastAPI()


app.include_router(users.router)
app.include_router(user_group.router)
app.include_router(project.router)
app.include_router(issue.router)


@app.on_event('startup')
async def create_engine():
    app.db = DatabaseFactory.get_db()
    admin = User(user_name="admin", passwd="21232f297a57a5a743894a0e4a801fc3",
                 role='admin', email="NULL")
    insert_user(admin)
