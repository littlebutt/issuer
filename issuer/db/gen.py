from sqlmodel import Session, select

from issuer.db.models import Generator
from issuer.db.database import DatabaseFactory


def generate_code(meta_type: str) -> str:
    gen = Generator(meta_type=meta_type)
    engine = DatabaseFactory.get_db().get_engine()
    with Session(engine) as session:
        session.add(gen)
        session.commit()

    with Session(engine) as session:
        stmt = select(Generator).order_by(Generator.id.desc()).limit(1)
        result = session.exec(stmt).first()
        return meta_type + str(result.id)
