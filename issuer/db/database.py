import os
from typing import ClassVar

from sqlalchemy import Engine
from sqlmodel import SQLModel, create_engine

from issuer.db import models # noqa


def get_default_db_url() -> str:
    this_dir = os.path.dirname(__file__)
    par_dir = os.path.abspath(os.path.join(this_dir, os.path.pardir))
    db_file = os.path.join(par_dir, 'issuer.db')
    return 'sqlite:///' + db_file


SQLALCHEMY_DB_URL = os.getenv('DB_URL', default=get_default_db_url())


class Database:

    def __init__(self):
        self.engine = create_engine(SQLALCHEMY_DB_URL)
        SQLModel.metadata.create_all(self.engine)

    def get_engine(self) -> "Engine":
        return self.engine


class DatabaseFactory:

    db: ClassVar["Database"] = None # noqa

    @classmethod
    def get_db(cls) -> "Database":
        if cls.db is None:
            cls.db = Database()
        return cls.db
