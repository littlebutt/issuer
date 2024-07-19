import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { Issue as IssueType, User, defaultIssue } from "./types"
import { Label } from "./components/ui/label"
import { formatMembers, formatOwner, formatProject } from "./utils"
import { Badge } from "./components/ui/badge"
import { Button } from "./components/ui/button"
import { getIssues } from "./fetch"
import { useToast } from "./components/ui/use-toast"
import IssueEdit from "./issue-edit"
import { useCookie } from "./lib/cookies"
import { updateIssueApi } from "./issue-api"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from "./components/ui/alert-dialog"
import { CircleX } from "lucide-react"

const Issue: React.FC = () => {
	const { issueCode } = useParams()

	const [issue, setIssue] = useState<IssueType>(defaultIssue())

	const { toast } = useToast()
	const cookie = useCookie()
	const navigate = useNavigate()

	const formatIssueStatus = (issueStatus?: string, className?: string) => {
		let badge = <Badge className={className}></Badge>
		if (issueStatus === "open") {
			badge.props.children = "开放"
			badge.props.variant = "success"
		} else if (issueStatus === "finished") {
			badge.props.children = "完成"
			badge.props.variant = "gray"
		} else if (issueStatus === "closed") {
			badge.props.children = "关闭"
			badge.props.variant = "destructive"
		} else {
			badge.props.children = issueStatus
		}
		return badge
	}

	const isFollowed = () => {
		let user_code = cookie.getCookie("current_user")?.split(":")[0]
		if (user_code === undefined) {
			return false
		}
		return issue.followers
			.map(follower => follower.user_code)
			.includes(user_code)
	}

	const follow = () => {
		let user_code = cookie.getCookie("current_user")?.split(":")[0]
		updateIssueApi(
			toast,
			refresh,
			issue.issue_code,
			"",
			"",
			`${issue.followers},${user_code}`,
			""
		)
	}

	const deleteIssue = () => {
		navigate(`/#/main/project/${issue.project.project_code}`)
	}

	const refresh = () => {
		getIssues(issueCode as string, "", "", "", "", "", "", "", "", "", "")
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					setIssue(res.data.data[0])
				} else {
					toast({
						title: "获取议题信息失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
	}

	useEffect(() => {
		refresh()
	}, [])

	return (
		<div className="w-full flex flex-row space-x-2 p-1">
			<Card className="w-1/3">
				<CardHeader className="px-6 py-3 flex flex-row justify-between">
					<CardTitle className="flex flex-row space-x-3 text-end">
						<span className="text-2xl font-semibold leading-none tracking-tight">
							{issue?.title}
						</span>
						<span className="text-2xl font-thin tracking-tight align-text-bottom">
							#{issue?.issue_id}
						</span>
						{formatIssueStatus(issue?.status, "h-[30px]")}
					</CardTitle>
					<div className="flex flex-row space-x-1">
						<IssueEdit issue={issue} refresh={refresh} />
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="ghost" size="icon">
									<CircleX className="h-4 w-4" />
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>
										确认删除?
									</AlertDialogTitle>
									<AlertDialogDescription>
										删除当前议题可能会带来无法预计的后果
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>取消</AlertDialogCancel>
									<AlertDialogAction onClick={deleteIssue}>
										确定
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</CardHeader>
				<CardContent className="flex flex-col space-y-3 p-9">
					<div className="flex flex-col space-y-2">
						<div className="flex flex-row justify-between">
							<Label className="text-base font-medium">
								项目
							</Label>
							<div className="text-sm font-normal text-muted-foreground">
								{formatProject(issue?.project)}
							</div>
						</div>
						<div className="flex flex-row justify-between">
							<Label className="text-base font-medium">
								创建者
							</Label>
							<div className="text-sm font-normal text-muted-foreground">
								{formatOwner(issue?.owner as User)}
							</div>
						</div>
						<div className="flex flex-row justify-between">
							<Label className="text-base font-medium">
								关注
							</Label>
							<div className="text-sm font-normal text-muted-foreground">
								{formatMembers(issue?.followers as User[])}
							</div>
						</div>
						<div className="flex flex-row justify-between">
							<Label className="text-base font-medium">
								指派给
							</Label>
							<div className="text-sm font-normal text-muted-foreground flex flex-row space-x-1">
								{issue?.assigned?.map(user =>
									formatOwner(user)
								)}
							</div>
						</div>
						<div className="flex flex-row justify-between">
							<Label className="text-base font-medium">
								提出日期
							</Label>
							<div className="text-sm font-normal text-muted-foreground">
								{issue?.propose_date}
							</div>
						</div>
						<div className="flex flex-row justify-between">
							<Label className="text-base font-medium">
								标签
							</Label>
							<div className="text-sm font-normal flex flex-row flex-wrap space-x-1">
								{issue?.tags
									?.split(",")
									.map(tag => <Badge>{tag}</Badge>)}
							</div>
						</div>
					</div>
					<div className="w-full flex flex-col space-y-2">
						<Button
							className="p-2 w-full"
							disabled={isFollowed()}
							onClick={follow}
						>
							关注
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default Issue
