from datetime import datetime
import json
import logging
from typing import List
from issuer import db
from issuer.db import UserGroup, User, Project, Issue, IssueComment, Notice, \
    Activity
from issuer.routers.models import ActivityEnum, ActivityModel, \
    IssueCommentRes, IssueRes, NoticeModel, ProjectRes, UserGroupRes, UserModel


Logger = logging.getLogger(__name__)


def convert_user(do_: User) -> "UserModel":
    return UserModel(
        user_code=do_.user_code,
        user_name=do_.user_name,
        passwd=do_.passwd,
        email=do_.email,
        role=do_.role,
        description=do_.description,
        phone=do_.phone,
        avatar=do_.avatar
    )


def convert_user_group(do_: UserGroup) -> "UserGroupRes":
    user_do = db.find_user_by_code(do_.group_owner)
    if user_do is None:
        Logger.error("Cannot find User with user_code: "
                     f"{do_.group_owner}")
    users = db.list_user_to_user_group_by_group(do_.group_code)
    members = list()
    for user in users:
        _user = db.find_user_by_code(user.user_code)
        if _user is None:
            Logger.error("Cannot find User with user_code: "
                         f"{user.user_code}")
            continue
        members.append(convert_user(_user))
    return UserGroupRes(
        group_code=do_.group_code,
        group_name=do_.group_name,
        owner=convert_user(user_do),
        members=members
    )


def convert_project(do_: Project) -> "ProjectRes":
    user_do = db.find_user_by_code(do_.owner)
    if user_do is None:
        Logger.error("Cannot find User with user_code: "
                     f"{do_.owner}")
    p2us = db.list_project_to_user_by_project(do_.project_code)
    participants: List["UserModel"] = list()
    for p2u in p2us:
        _user_do = db.find_user_by_code(p2u.user_code)
        if _user_do is None:
            Logger.error("Cannot find User with user_code: "
                         f"{p2u.user_code}")
            continue
        participants.append(convert_user(_user_do))
    return ProjectRes(
        project_code=do_.project_code,
        project_name=do_.project_name,
        start_date=datetime.strftime(do_.start_date, '%Y-%m-%d'),
        end_date=datetime.strftime(do_.end_date, '%Y-%m-%d') if do_.end_date is not None else None, # noqa
        owner=convert_user(user_do),
        description=do_.description,
        status=do_.status,
        budget=do_.budget,
        privilege=do_.privilege,
        participants=participants
    )


def convert_issue(do_: Issue) -> "IssueRes":
    project_do = db.find_project_by_code(do_.project_code)
    if project_do is None:
        Logger.error("Cannot find Project with project_code: "
                     f"{do_.project_code}")
    owner_do = db.find_user_by_code(do_.owner)
    if owner_do is None:
        Logger.error("Cannot find User with user_code: "
                     f"{do_.owner}")
    followers: List[User] = list()
    if do_.followers is not None:
        for follower in do_.followers.split(','):
            f = db.find_user_by_code(follower)
            if f is None:
                Logger.error("Cannot find User with user_code: "
                             f"{follower}")
                continue
            followers.append(convert_user(f))
    assigneds = list()
    if do_.assigned is not None:
        for assigned in do_.assigned.split(','):
            a = db.find_user_by_code(assigned)
            if a is None:
                Logger.error("Cannot find User with user_code: "
                             f"{assigned}")
                continue
            assigneds.append(convert_user(a))
    res = IssueRes(
        issue_code=do_.issue_code,
        project=convert_project(project_do),
        issue_id=do_.issue_id,
        title=do_.title,
        description=do_.description,
        owner=convert_user(owner_do),
        propose_date=datetime.strftime(do_.propose_date, '%Y-%m-%d'),
        status=do_.status,
        tags=do_.tags,
        followers=followers,
        assigned=assigneds
    )
    return res


def convert_comment(do_: IssueComment) -> "IssueCommentRes":
    commenter_do = db.find_user_by_code(do_.commenter)
    if commenter_do is None:
        Logger.error("Cannot find User with user_code: "
                     f"{do_.commenter}")
    return IssueCommentRes(
        comment_code=do_.comment_code,
        issue_code=do_.issue_code,
        comment_time=datetime.strftime(do_.comment_time,
                                       '%Y-%m-%d %H:%M:%S'),
        commenter=convert_user(commenter_do),
        fold=do_.fold,
        content=do_.content,
        appendices=do_.appendices.split(",")
        if do_.appendices is not None else []
    )


def convert_activity(activity: "Activity") -> "ActivityModel":
    user_do = db.find_user_by_code(activity.subject)
    if user_do is None:
        Logger.error("Cannot find User with user_code: "
                     f"{activity.subject}")
    user = convert_user(user_do)
    trigger_time = datetime.strftime(activity.gmt_create, '%Y-%m-%d')
    match activity.category:
        case ActivityEnum.NewComment.name:
            return ActivityModel(trigger_time=trigger_time,
                                 subject=user,
                                 type="comment",
                                 desc=f"{user.user_name}向项目{json.loads(activity.ext_info)['name']}议题添加了一条评论") # noqa
        case ActivityEnum.FoldComment.name:
            return ActivityModel(trigger_time=trigger_time,
                                 subject=user,
                                 type="comment",
                                 desc=f"{user.user_name}折叠了项目{json.loads(activity.ext_info)['name']}议题的一条评论") # noqa
        case ActivityEnum.NewIssue.name:
            return ActivityModel(trigger_time=trigger_time,
                                 subject=user,
                                 type="issue",
                                 desc=f"{user.user_name}向项目{json.loads(activity.ext_info)['name']}添加了一个议题") # noqa
        case ActivityEnum.ChangeIssue.name:
            return ActivityModel(trigger_time=trigger_time,
                                 subject=user,
                                 type="issue",
                                 desc=f"用户{user.user_name}变更了项目{json.loads(activity.ext_info)['name']}的一个议题") # noqa
        case ActivityEnum.DeleteIssue.name:
            return ActivityModel(trigger_time=trigger_time,
                                 subject=user,
                                 type="issue",
                                 desc=f"{user.user_name}删除了项目{json.loads(activity.ext_info)['name']}的一个议题") # noqa
        case ActivityEnum.FollowIssue.name:
            return ActivityModel(trigger_time=trigger_time,
                                 subject=user,
                                 type="issue",
                                 desc=f"{user.user_name}关注了项目{json.loads(activity.ext_info)['name']}的一个议题") # noqa
        case ActivityEnum.UnfollowIssue.name:
            return ActivityModel(trigger_time=trigger_time,
                                 subject=user,
                                 type="issue",
                                 desc=f"{user.user_name}取消关注了项目{json.loads(activity.ext_info)['name']}的一个议题") # noqa
        case ActivityEnum.NewProject.name:
            return ActivityModel(trigger_time=trigger_time,
                                 subject=user,
                                 type="project",
                                 desc=f"{user.user_name}新增了一个项目{json.loads(activity.ext_info)['name']}") # noqa
        case ActivityEnum.DeleteProject.name:
            return ActivityModel(trigger_time=trigger_time,
                                 subject=user,
                                 type="project",
                                 desc=f"{user.user_name}删除了项目{json.loads(activity.ext_info)['name']}") # noqa
        case ActivityEnum.ChangeProject.name:
            return ActivityModel(trigger_time=trigger_time,
                                 subject=user,
                                 type="project",
                                 desc=f"{user.user_name}变更了项目{json.loads(activity.ext_info)['name']}") # noqa
        case ActivityEnum.JoinProject.name:
            return ActivityModel(trigger_time=trigger_time,
                                 subject=user,
                                 type="project",
                                 desc=f"{user.user_name}加入了项目{json.loads(activity.ext_info)['name']}") # noqa
        case ActivityEnum.NewGroup.name:
            return ActivityModel(trigger_time=trigger_time,
                                 subject=user,
                                 type="group",
                                 desc=f"{user.user_name}创建了组织{json.loads(activity.ext_info)['name']}") # noqa
        case ActivityEnum.DeleteGroup.name:
            return ActivityModel(trigger_time=trigger_time,
                                 subject=user,
                                 type="group",
                                 desc=f"{user.user_name}删除了组织{json.loads(activity.ext_info)['name']}") # noqa
        case ActivityEnum.ChangeGroup.name:
            return ActivityModel(trigger_time=trigger_time,
                                 subject=user,
                                 type="group",
                                 desc=f"用户{user.user_name}变更了组织{json.loads(activity.ext_info)['name']}") # noqa
        case ActivityEnum.AddGroup.name:
            return ActivityModel(trigger_time=trigger_time,
                                 subject=user,
                                 type="group",
                                 desc=f"用户{user.user_name}加入了组织{json.loads(activity.ext_info)['name']}") # noqa


def convert_notice(notice: "Notice") -> "NoticeModel":
    return NoticeModel(publish_time=datetime.strftime(notice.gmt_create,
                                                      '%Y-%m-%d'),
                       notice_code=notice.notice_code,
                       content=notice.content)
