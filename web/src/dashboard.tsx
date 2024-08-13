import React, { useEffect, useState } from "react"

import { Label } from "./components/ui/label"
import { useForm } from "react-hook-form"
import { newGroupApi } from "./group-api"
import { useToast } from "./components/ui/use-toast"
import { Activity, Issue, Notice, Project, User } from "./types"
import {
	fetchSelf,
	getCommentsByCommenter,
	getIssues,
	getProjects,
	getUserGroupsCount
} from "./fetch"
import { useCookie } from "./lib/cookies"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "./components/ui/table"
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger
} from "./components/ui/tooltip"
import axios from "axios"
import { CircleAlert, MessageCircleMore, StickyNote } from "lucide-react"
import { Progress } from "./components/ui/progress"
import { Separator } from "./components/ui/seperator"

const Dashboard: React.FC = () => {
	const [userInfo, setUserInfo] = useState<User>({})

	const [activities, setActivities] = useState<Activity[]>([])
	const [notices, setNotices] = useState<Notice[]>([])
	const [limit, setLimit] = useState<number>(6)
	const [issueStat, setIssueStat] = useState<{
		open: number
		closed: number
		finished: number
		other: number
	}>({ open: 0, closed: 0, finished: 0, other: 0 })
	const [issuesStatTotal, setIssuesStatTotal] = useState<number>(0)
	const [projectStat, setProjectStat] = useState<{
		start: number
		processing: number
		checking: number
		checked: number
		other: number
	}>({ start: 0, processing: 0, checking: 0, checked: 0, other: 0 })
	const [projectStatTotal, setProjectStatTotal] = useState<number>(0)
	const [commentNum, setCommentNum] = useState<number>(0)
	const [groupStat, setGroupStat] = useState<{
		create: number
		join: number
	}>({ create: 0, join: 0 })
	// TODO: 后期清理
	const {
		register,
		formState: { errors },
		handleSubmit
	} = useForm()

	const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
	const [groupName, setGroupName] = useState<string>("")

	const { toast } = useToast()
	const cookie = useCookie()
	const navigate = useNavigate()

	const newGroup = () => {
		newGroupApi(
			toast,
			() => {
				setDrawerOpen(false)
			},
			groupName
		)
	}

	const greetings = () => {
		let now = new Date()
		if (now.getHours() < 6) {
			return `凌晨好，${userInfo.user_name}！`
		} else if (now.getHours() < 12) {
			return `上午好，${userInfo.user_name}！`
		} else if (now.getHours() < 13) {
			return `中午好，${userInfo.user_name}！`
		} else if (now.getHours() < 18) {
			return `下午好，${userInfo.user_name}！`
		} else {
			return `晚上好，${userInfo.user_name}！`
		}
	}

	const formatContent = (content: string, limit: number = 25) => {
		let cellContent = content
		if (content.length > limit) {
			cellContent = content.substring(0, limit) + "..."
		}
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>{cellContent}</TooltipTrigger>
					<TooltipContent className="p-0 m-0">
						<div className=" bg-slate-900 text-slate-200 p-1 rounded-sm">
							{content}
						</div>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		)
	}

	const fetchActivities = () => {
		axios({
			method: "GET",
			url: `/users/stat_targets?limit=${limit}`
		})
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					setActivities(res.data.data)
				} else {
					toast({
						title: "获取关注列表失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
	}

	const fetchNotices = () => {
		axios({
			method: "GET",
			url: `/notice/list_notices?limit=5`
		})
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					setNotices(res.data.data)
				} else {
					toast({
						title: "获取通知失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
	}

	const formatActivityType = (typed: string) => {
		switch (typed) {
			case "comment":
				return "评论"
			case "issue":
				return "议题"
			case "project":
				return "项目"
			case "group":
				return "组织"
			default:
				return "unknown"
		}
	}

	useEffect(() => {
		getIssues(
			"",
			"",
			"",
			"",
			"",
			"",
			"",
			"",
			"",
			userInfo.user_code as string,
			"",
			1,
			99
		)
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					let _issueStat = {
						open: 0,
						closed: 0,
						finished: 0,
						other: 0
					}
					res.data.data.forEach((iss: Issue) => {
						switch (iss.status) {
							case "open":
								_issueStat.open += 1
								break
							case "closed":
								_issueStat.closed += 1
								break
							case "finished":
								_issueStat.finished += 1
								break
							default:
								_issueStat.other += 1
						}
					})
					setIssueStat(_issueStat)
					setIssuesStatTotal(
						Object.values(_issueStat).reduce((a, b) => a + b, 0)
					)
				} else {
					toast({
						title: "获取关注的议题数据失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
		getProjects("", "", "", "", "", "", userInfo.user_code as string, 1, 99)
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					let _projectStat = {
						start: 0,
						processing: 0,
						checking: 0,
						checked: 0,
						other: 0
					}
					res.data.data.forEach((pro: Project) => {
						switch (pro.status) {
							case "start":
								_projectStat.start += 1
								break
							case "processing":
								_projectStat.processing += 1
								break
							case "checking":
								_projectStat.checking += 1
								break
							case "checked":
								_projectStat.checked += 1
								break
							default:
								_projectStat.other += 1
						}
					})
					setProjectStat(_projectStat)
					setProjectStatTotal(
						Object.values(_projectStat).reduce((a, b) => a + b, 0)
					)
				} else {
					toast({
						title: "获取参与的项目数据失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
		getUserGroupsCount("", "", userInfo.user_code as string, "")
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					setGroupStat({ ...groupStat, create: res.data.data })
				} else {
					toast({
						title: "获取参与的组织数据失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
		getUserGroupsCount("", "", "", userInfo.user_code as string)
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					setGroupStat({ ...groupStat, join: res.data.data })
				} else {
					toast({
						title: "获取参与的组织数据失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
		getCommentsByCommenter(userInfo.user_code as string)
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					setCommentNum(res.data.data.length)
				} else {
					toast({
						title: "获取评论数据失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
	}, [userInfo])

	useEffect(() => {
		fetchSelf(cookie, navigate)
			.then(res => {
				if (res.status === 200) {
					setUserInfo(res.data.data)
				}
			})
			.catch(err => console.log(err))
		fetchActivities()
		fetchNotices()
	}, [])

	return (
		<div className="flex flex-col space-y-1 w-full px-5 py-0 gap-0 h-full">
			<div className="flex flex-row justify-between h-[6%]">
				<div className="text-3xl font-semibold leading-none tracking-tight">
					{greetings()}
				</div>
			</div>
			<div className="flex h-[92%] flex-col space-y-3">
				<div className="grid gap-4 grid-cols-3">
					<Card className="border-2">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-xl">议题</CardTitle>
							<CircleAlert className="mr-2" color="#6b7280" />
						</CardHeader>
						<CardContent className="flex flex-col space-y-2 pt-4">
							<div className="flex flex-row justify-between">
								<Label className="text-base font-normal text-muted-foreground">
									开放
								</Label>
								<div className="w-52 flex items-center space-x-1">
									<div className="w-4/5">
										<Progress
											value={issueStat.open}
											total={issuesStatTotal}
										/>
									</div>
									<div className="w-1/5 text-center">
										{issueStat.open}
									</div>
								</div>
							</div>
							<div className="flex flex-row justify-between">
								<Label className="text-base font-normal text-muted-foreground">
									完成
								</Label>
								<div className="w-52 flex items-center space-x-1">
									<div className="w-4/5">
										<Progress
											value={issueStat.finished}
											total={issuesStatTotal}
										/>
									</div>
									<div className="w-1/5 text-center">
										{issueStat.finished}
									</div>
								</div>
							</div>
							<div className="flex flex-row justify-between">
								<Label className="text-base font-normal text-muted-foreground">
									关闭
								</Label>
								<div className="w-52 flex items-center space-x-1">
									<div className="w-4/5">
										<Progress
											value={issueStat.closed}
											total={issuesStatTotal}
										/>
									</div>
									<div className="w-1/5 text-center">
										{issueStat.closed}
									</div>
								</div>
							</div>
							<div className="flex flex-row justify-between">
								<Label className="text-base font-normal text-muted-foreground">
									其它
								</Label>
								<div className="w-52 flex items-center space-x-1">
									<div className="w-4/5">
										<Progress
											value={issueStat.other}
											total={issuesStatTotal}
										/>
									</div>
									<div className="w-1/5 text-center">
										{issueStat.other}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card className="border-2">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-xl">项目</CardTitle>
							<StickyNote className="mr-2" color="#6b7280" />
						</CardHeader>
						<CardContent className="flex flex-col space-y-2 pt-4">
							<div className="flex flex-row justify-between">
								<Label className="text-base font-normal text-muted-foreground">
									开始
								</Label>
								<div className="w-52 flex items-center space-x-1">
									<div className="w-4/5">
										<Progress
											value={projectStat.start}
											total={projectStatTotal}
										/>
									</div>
									<div className="w-1/5 text-center">
										{projectStat.start}
									</div>
								</div>
							</div>
							<div className="flex flex-row justify-between">
								<Label className="text-base font-normal text-muted-foreground">
									进行
								</Label>
								<div className="w-52 flex items-center space-x-1">
									<div className="w-4/5">
										<Progress
											value={projectStat.processing}
											total={projectStatTotal}
										/>
									</div>
									<div className="w-1/5 text-center">
										{projectStat.processing}
									</div>
								</div>
							</div>
							<div className="flex flex-row justify-between">
								<Label className="text-base font-normal text-muted-foreground">
									验收
								</Label>
								<div className="w-52 flex items-center space-x-1">
									<div className="w-4/5">
										<Progress
											value={projectStat.checking}
											total={projectStatTotal}
										/>
									</div>
									<div className="w-1/5 text-center">
										{projectStat.checking}
									</div>
								</div>
							</div>
							<div className="flex flex-row justify-between">
								<Label className="text-base font-normal text-muted-foreground">
									完工
								</Label>
								<div className="w-52 flex items-center space-x-1">
									<div className="w-4/5">
										<Progress
											value={projectStat.checked}
											total={projectStatTotal}
										/>
									</div>
									<div className="w-1/5 text-center">
										{projectStat.checked}
									</div>
								</div>
							</div>
							<div className="flex flex-row justify-between">
								<Label className="text-base font-normal text-muted-foreground">
									其它
								</Label>
								<div className="w-52 flex items-center space-x-1">
									<div className="w-4/5">
										<Progress
											value={projectStat.other}
											total={projectStatTotal}
										/>
									</div>
									<div className="w-1/5 text-center">
										{projectStat.other}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card className="border-2">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-xl">评论&组织</CardTitle>
							<MessageCircleMore
								className="mr-2"
								color="#6b7280"
							/>
						</CardHeader>
						<CardContent className="flex flex-col space-y-2 pt-4">
							<div className="flex flex-row justify-between mr-4">
								<Label className="text-base font-normal text-muted-foreground">
									发表评论
								</Label>
								<div className="text-base font-medium">
									{commentNum}
								</div>
							</div>
							<div className="flex flex-row justify-between mr-4">
								<Label className="text-base font-normal text-muted-foreground">
									创建组织
								</Label>
								<div className="text-base font-medium">
									{groupStat.create}
								</div>
							</div>
							<div className="flex flex-row justify-between mr-4">
								<Label className="text-base font-normal text-muted-foreground">
									参与组织
								</Label>
								<div className="text-base font-medium">
									{groupStat.join}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
				<div className="flex flex-row">
					<div className="w-2/3 p-1">
						<div className="w-full flex flex-col space-y-1 border-2 rounded-lg border-zinc-200 p-6 shadow-sm">
							<div className="flex flex-row justify-start pb-5">
								<div className="text-xl font-semibold leading-none tracking-tight">
									我的关注
								</div>
							</div>
							<Table>
								<TableHeader>
									<TableRow className="[line-height:30px]">
										<TableHead className="w-[10%]">
											编号
										</TableHead>
										<TableHead className="w-1/5">
											类型
										</TableHead>
										<TableHead className="w-1/2">
											内容
										</TableHead>
										<TableHead className="w-1/5">
											时间
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{activities.map((activity, idx) => (
										<TableRow className="[line-height:30px]">
											<TableCell>#{idx + 1}</TableCell>
											<TableCell>
												{formatActivityType(
													activity.type
												)}
											</TableCell>
											<TableCell>
												{formatContent(activity.desc)}
											</TableCell>
											<TableCell>
												{activity.trigger_time}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</div>
					<div className="w-1/3 p-1">
						<Card className="border-2 ml-2">
							<CardHeader className="pb-2">
								<CardTitle className="text-xl">通知</CardTitle>
							</CardHeader>
							<CardContent className="flex flex-col space-y-1">
								{notices.map((notice, idx) => (
									<>
										<div className="grid grid-cols-[1fr_6fr] items-center">
											<div className="font-semibold text-xl leading-none tracking-tight">
												#{idx + 1}
											</div>
											<div className="flex flex-col space-y-1 items-start">
												<div className="font-medium text-sm text-muted-foreground">
													{notice.publish_time}
												</div>
												<div className="font-normal text-base">
													{formatContent(
														notice.content,
														10
													)}
												</div>
											</div>
										</div>
										<Separator />
									</>
								))}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
			{/* <Drawer
				direction="right"
				open={drawerOpen}
				onOpenChange={setDrawerOpen}
			>
				<DrawerTrigger asChild>
					<Button className="">新增</Button>
				</DrawerTrigger>
				<DrawerContent>
					<div className="my-auto h-full w-full">
						<DrawerHeader>
							<DrawerTitle>新增组织</DrawerTitle>
						</DrawerHeader>
						<div className="p-4 pb-0 w-full">
							<form>
								<div className="mt-3 h-[520px] flex flex-col space-y-2">
									<div className="flex flex-col space-y-1">
										<Label htmlFor="groupName">
											名称
											{errors.groupName && (
												<span className="text-red-500">
													{" "}
													请填写名称
												</span>
											)}
										</Label>
										<Input
											id="groupname"
											{...register("groupName", {
												required: true
											})}
											onChange={e =>
												setGroupName(e.target.value)
											}
										/>
									</div>
								</div>
							</form>
						</div>
						<DrawerFooter>
							<Button onClick={handleSubmit(newGroup)}>
								确定
							</Button>
							<DrawerClose asChild>
								<Button variant="outline">取消</Button>
							</DrawerClose>
						</DrawerFooter>
					</div>
				</DrawerContent>
			</Drawer> */}
		</div>
	)
}

export default Dashboard
