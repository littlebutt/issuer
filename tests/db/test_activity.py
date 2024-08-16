from datetime import datetime
import pytest

from issuer.db import (
    delete_activity_by_create_time,
    insert_activity,
    list_activities_by_subject,
    list_activities_by_targets,
)
from issuer.db import Activity


def setup_function(function):
    delete_activity_by_create_time(datetime.now())


def teardown_function(function):
    delete_activity_by_create_time(datetime.now())


def test_insert_activity():
    activity = Activity(subject="test", target="test", category="NEW")
    res = insert_activity(activity)
    assert res is True


def test_list_activities():
    activity = Activity(subject="test", target="test1", category="NEW")
    res = insert_activity(activity)
    assert res is True

    activity = Activity(subject="test", target="test2", category="NEW")
    res = insert_activity(activity)
    assert res is True

    res = list_activities_by_subject("test")
    assert len(res) == 2

    res = list_activities_by_targets(["test1", "test2"])
    assert len(res) == 2
