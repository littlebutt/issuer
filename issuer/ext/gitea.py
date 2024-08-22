from datetime import datetime
import json
import re
from typing import Dict, Sequence

from issuer import db
from issuer.db.models import Activity, IssueComment


class GiteaAdaptor:
    def __init__(self, project_code: str) -> None:
        self.project_code = project_code

    def parse_commits(self, payload: Dict):
        try:
            for commit in payload["commits"]:
                commiter = commit["author"]["name"]
                message = commit["message"]
                git_compare_url = commit["url"]
                urls = self._get_urls(message)
                ids = self._get_ids(message)
                for _id in ids:
                    issue = db.find_issue_by_project_and_code_id(
                        project_code=self.project_code, issue_id=_id
                    )
                    self._build_comment(
                        issue.issue_code, commiter, git_compare_url, urls
                    )
                    self._change_issue_status(issue.issue_code)
        except Exception as e:
            raise RuntimeError(e.args)

    @staticmethod
    def _build_comment(
        issue_code: str,
        commiter: str,
        git_compare_url: str,
        urls: Sequence[str],
    ):
        bot = db.find_user_by_email("bot@issuer.com")
        if bot is None:
            raise RuntimeError("Cannot find the user bot")
        content = f"""_{commiter}通过提交代码完成了本议题_ \n\n_代码仓库链接详情[{git_compare_url}]({git_compare_url})_"""  # noqa
        if len(urls) > 0:
            content += """\n\n_包含其它参考链接详情："""
            for idx, url in enumerate(urls):
                content += f"""[链接{idx + 1}]({url})"""
            content += "_"
        comment_do = IssueComment(
            issue_code=issue_code,
            comment_time=datetime.now(),
            commenter=bot.user_code,
            fold=False,
            content=content,
        )
        res = db.insert_issue_comment(comment_do)
        if res is None:
            raise RuntimeError("Cannot insert a comment")
        issue = db.find_issue_by_code(issue_code)
        if issue is None:
            raise RuntimeError("Cannot insert the issue for stat activity")
        project = db.find_project_by_code(issue.project_code)
        if project is None:
            raise RuntimeError("Cannot insert the project for stat activity")
        ext_info = json.dumps(
            {"name": f"{project.project_name}#{issue.issue_id}"}
        )  # noqa
        res = db.insert_activity(
            Activity(
                subject=bot.user_code,
                target=issue_code,
                category="NewComment",
                ext_info=ext_info,
            )
        )
        if not res:
            raise RuntimeError("Cannot insert an activity")

    @staticmethod
    def _change_issue_status(issue_code: str):
        issue = db.find_issue_by_code(issue_code)
        issue.status = "finished"
        res = db.update_issue_by_code(issue=issue)
        if not res:
            raise RuntimeError("Cannot update an issue status")

    @staticmethod
    def _get_urls(message: str) -> Sequence[str]:
        pattern = re.compile(r"https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+")
        return re.findall(pattern=pattern, string=message)

    @staticmethod
    def _get_ids(message: str) -> Sequence[str]:
        pattern = re.compile(r"\$\d+")
        res = re.findall(pattern=pattern, string=message)
        return list(map(lambda t: int(t[1]), res))
