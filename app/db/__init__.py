import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base


def get_default_db_url() -> str:
    this_dir = os.path.dirname(__file__)
    par_dir = os.path.abspath(os.path.join(this_dir, os.path.pardir))
    db_file = os.path.join(par_dir, 'issuer.db')
    return 'sqlite://' + db_file


SQLALCHEMY_DB_URL = os.getenv('DB_URL', default=get_default_db_url())


engine = create_engine(SQLALCHEMY_DB_URL, connect_args={'check_same_thread': False})



