import pytest

from app import db
from app.db.models import User


def test_insert_user():
    user1 = User(user_name="test", passwd="test", role="admin", email="test")
    res = db.insert_user(user=user1)
    assert res is True

    user2 = User(user_name="test", passwd="test", role="admin", email="test")
    res = db.insert_user(user=user2)
    assert res is False

    db.delete_all_users()
