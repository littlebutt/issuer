from fastapi import FastAPI

from issuer.db import DatabaseFactory, User, Metas, insert_user, insert_metas
from issuer.routers import users, user_group, project, issue, comment


app = FastAPI()


app.include_router(users.router)
app.include_router(user_group.router)
app.include_router(project.router)
app.include_router(issue.router)
app.include_router(comment.router)


@app.on_event('startup')
async def create_engine():
    # 创建schema
    app.db = DatabaseFactory.get_db()

    # 添加管理员
    admin = User(user_name="admin", passwd="21232f297a57a5a743894a0e4a801fc3",
                 role='admin', email="NULL")
    insert_user(admin)

    # 添加管理员角色
    user_role_admin = Metas(meta_type='USER_ROLE', meta_value='admin')
    insert_metas(user_role_admin)
    user_role_default = Metas(meta_type='USER_ROLE', meta_value='default')
    insert_metas(user_role_default)

    # 添加项目状态
    project_status_start = Metas(meta_type='PROJECT_STATUS',
                                 meta_value='start')
    insert_metas(project_status_start)
    project_status_processing = Metas(meta_type='PROJECT_STATUS',
                                      meta_value='processing')
    insert_metas(project_status_processing)
    project_status_checking = Metas(meta_type='PROJECT_STATUS',
                                    meta_value='checking')
    insert_metas(project_status_checking)
    project_status_finished = Metas(meta_type='PROJECT_STATUS',
                                    meta_value='checked')
    insert_metas(project_status_finished)

    # 添加议题状态
    issue_status_open = Metas(meta_type='ISSUE_STATUS',
                              meta_value='open')
    insert_metas(issue_status_open)
    issue_status_finished = Metas(meta_type='ISSUE_STATUS',
                                  meta_value='finished')
    insert_metas(issue_status_finished)
    issue_status_closed = Metas(meta_type='ISSUE_STATUS',
                                meta_value='closed')
    insert_metas(issue_status_closed)
