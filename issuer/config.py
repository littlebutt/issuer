import os
from typing import Any, ClassVar

from dotenv import load_dotenv


class ConfigDict():

    def __init__(self) -> None:
        load_dotenv()

    def get(self, key: str, default: Any = None):
        return os.getenv(key, default=default)


class ConfigFactory:
    config: ClassVar["ConfigDict"] = None

    @classmethod
    def get_config(cls):
        if cls.config is None:
            cls.config = ConfigDict()
        return cls.config


def GET_CONFIG(key: str, default: Any = None):
    return ConfigFactory.get_config().get(key=key, default=default)
