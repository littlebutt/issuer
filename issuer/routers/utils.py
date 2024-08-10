import json
from typing import Dict
from pydantic import BaseModel

from issuer import db
from issuer.db.models import Activity


def empty_string_to_none(param: str | int):
    return param if param != '' else None


def empty_strings_to_none(obj: BaseModel) -> BaseModel:
    for param in obj.__dict__.keys():
        obj.__dict__[param] = None \
            if obj.__dict__[param] == '' else obj.__dict__[param]
    return obj


def activity_helper(subject: str,
                    target: str,
                    category: str,
                    kv: Dict[str, str]) -> str:
    ext_info = json.dumps(kv)
    db.insert_activity(Activity(subject=subject,
                                target=target,
                                category=category,
                                ext_info=ext_info))
