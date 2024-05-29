from fastapi import FastAPI

from db import DatabaseFactory
from routers import users


app = FastAPI()


app.include_router(users.router)


@app.on_event('startup')
async def create_engine():
    app.db = DatabaseFactory.get_db()