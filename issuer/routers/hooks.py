from typing import Dict
from fastapi import APIRouter

from issuer.ext.gitea import GiteaAdaptor


router = APIRouter(
    prefix="/hooks",
    tags=["hooks"],
    responses={404: {"description": "Not Found"}},
)


@router.post("/project/{project_code}")
async def hook_gitea(project_code: str, payload: Dict):
    print(f"project_code: {project_code}")
    print(f"payload: {payload}")
    ga = GiteaAdaptor(project_code)
    try:
        ga.parse_commits(payload)
    except Exception as e:
        return {"success": False, "reason": e}
    return {"success": True}
