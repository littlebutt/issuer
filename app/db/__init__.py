import os
from typing import ClassVar

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import models


def get_default_db_url() -> str:
    this_dir = os.path.dirname(__file__)
    par_dir = os.path.abspath(os.path.join(this_dir, os.path.pardir))
    db_file = os.path.join(par_dir, 'issuer.db')
    return 'sqlite://' + db_file


SQLALCHEMY_DB_URL = os.getenv('DB_URL', default=get_default_db_url())


class Database:
    
    def __init__(self):
        self.engine = create_engine(SQLALCHEMY_DB_URL, connect_args={'check_same_thread': False})
        models.Base.metadata.create_all(self.engine)
        self.session_local = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
    
    def get_session(self):
        return self.session_local


class DatabaseFactory:

    db: ClassVar["Database"] = None

    @classmethod
    def get_db(cls):
        if cls.db is None:
            cls.db = Database()
        return cls.db

