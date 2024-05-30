from db.models import User
from db.database import DatabaseFactory
from db.gen import generate_code

def insertresult(user: "User"):
    user.user_code = generate_code('us') 
    with Session(DatabaseFactory.get_db().get_engine()) as session:
        session.add(user)
        session.commit()


def update_user_by_code(user: "User"):
    with Session(DatabaseFactory.get_db().get_engine()) as session:
        stmt = select(User).where(User.user_code == user.user_code)
        results = session.exec(stmt)
        result = results.one()
    
        result.user_name = user.user_name
        result.passwd = user.passwd
        result.role = user.role
        result.description = user.description
        result.phone = user.phone

        session.add(result)
        session.commit()


def delete_user_by_code(user_code: str):
    with Session(DatabaseFactory.get_db().get_engine()) as session:
        stmt = select(User).where(User.user_code == user_code)
        results = session.exec(stmt)
        result = results.one()

        session.delete(result)
        session.commit()


def find_user_by_email(email: str): 
    with Session(DatabaseFactory.get_db().get_engine()) as session:
        stmt = select(User).where(User.email == email)
        return session.exec(stmt).one()
