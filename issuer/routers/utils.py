from pydantic import BaseModel


def empty_string_to_none(param: str):
    return param if param != '' else None


def empty_strings_to_none(obj: BaseModel) -> BaseModel:
    for param in obj.__dict__.keys():
        obj.__dict__[param] is None \
            if obj.__dict__[param] == '' else obj.__dict__[param]
    return obj
