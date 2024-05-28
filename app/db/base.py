from sqlalchemy.ext.declarative import declarative_base


Base = declarative_base()


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, autoincrement=True)
    gmt_create = Column(DateTime, default=datetime.datetime.now())
    gmt_modified = Column(DateTime, default=datetime.datetime.now())

