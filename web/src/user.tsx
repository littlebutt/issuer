import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Project, UserGroup, User as UserType } from "./types"
import {
	fetchUserRoles,
	getProjects,
	getProjectsCount,
	getUser,
	getUserGroups,
	getUserGroupsCount
} from "./fetch"
import { useToast } from "./components/ui/use-toast"
import { Separator } from "./components/ui/seperator"
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import {
	ChevronLeft,
	ChevronRight,
	Circle,
	Mail,
	PenLine,
	Phone,
	UserRound
} from "lucide-react"
import { Button } from "./components/ui/button"
import { formatMembers, formatOwner } from "./utils"
import { useCookie } from "./lib/cookies"

const User: React.FC = () => {
	// TODO: 添加用户组织项目的hover card
	const { userCode } = useParams()

	const { toast } = useToast()
	const cookie = useCookie()
	const navigate = useNavigate()

	const [userInfo, setUserInfo] = useState<UserType>({})
	const [groups, setGroups] = useState<UserGroup[]>([])
	const [groupPage, setGroupPage] = useState<number>(1)
	const [groupPageTotal, setGroupPageTotal] = useState<number>(1)
	const [projects, setProjects] = useState<Project[]>([])
	const [projectPage, setProjectPage] = useState<number>(1)
	const [projectPageTotal, setProjectPageTotal] = useState<number>(1)
	const [roles, setRoles] = useState<{ label: string; value: string }[]>([])

	const isSelf = () => {
		let current_user = cookie.getCookie("current_user")
		let user_code = current_user?.split(":")[0]
		return user_code === userCode
	}

	const refreshUserGroups = (currentPage?: number) => {
		getUserGroups(
			"",
			"",
			"",
			userCode as string,
			4,
			currentPage ?? groupPage
		)
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					setGroups(res.data.data)
				} else {
					toast({
						title: "用户组织获取失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
	}

	const nextBatchGroups = () => {
		setGroupPage(groupPage => Math.min(groupPage + 1, groupPageTotal))
		refreshUserGroups(Math.min(groupPage + 1, groupPageTotal))
	}

	const previousBatchGroups = () => {
		setGroupPage(groupPage => Math.max(groupPage - 1, 1))
		refreshUserGroups(Math.max(groupPage - 1, 1))
	}

	const refreshProjects = (currentPage?: number) => {
		getProjects(
			"",
			"",
			"",
			"",
			"",
			"",
			userCode as string,
			currentPage ?? projectPage,
			4
		)
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					setProjects(res.data.data)
				} else {
					toast({
						title: "用户项目获取失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
	}

	const nextBatchProjects = () => {
		setProjectPage(projectPage =>
			Math.min(projectPage + 1, projectPageTotal)
		)
		refreshProjects(Math.min(projectPage + 1, projectPageTotal))
	}

	const previousBatchProjects = () => {
		setProjectPage(projectPage => Math.max(projectPage - 1, 1))
		refreshProjects(Math.max(projectPage - 1, 1))
	}

	const value2label = (value: string | undefined) => {
		if (value === undefined) {
			return undefined
		}
		let role = roles.filter(role => role.value === value)
		if (role.length > 0) {
			return role[0].label
		}
		return undefined
	}

	useEffect(() => {
		fetchUserRoles(roles, setRoles)
		getUser(userCode as string)
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					setUserInfo(res.data.data)
				} else {
					toast({
						title: "用户信息获取失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
		refreshUserGroups()
		getUserGroupsCount("", "", "", userCode as string)
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					setGroupPageTotal(Math.ceil(res.data.data / 4))
				}
			})
			.catch(err => console.log(err))
		refreshProjects()
		getProjectsCount("", "", "", "", "", "", userCode as string)
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					setProjectPageTotal(Math.ceil(res.data.data / 4))
				}
			})
			.catch(err => console.log(err))
	}, [])
	return (
		<div className="w-full flex flex-row space-x-2 p-1">
			<Card className="w-1/3">
				<CardHeader className="px-6 py-3 flex flex-row justify-between">
					<CardTitle className="flex flex-row space-x-3 text-end">
						<span className="text-2xl font-semibold leading-none tracking-tight">
							{userInfo.user_name}
						</span>
						<span className="text-2xl font-thin tracking-tight align-text-bottom">
							{userInfo.user_code}
						</span>
					</CardTitle>
					<div className="flex flex-row space-x-1">
						<Button
							variant="ghost"
							size="icon"
							disabled={!isSelf()}
							onClick={() => navigate("/main/settings")}
						>
							<PenLine className="h-4 w-4" />
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col space-y-2 w-full">
						<div className="self-center">
							<Avatar className="size-64">
								<AvatarImage
									src={
										userInfo.avatar ?? "/statics/avatar.png"
									}
								/>
								<AvatarFallback>
									{userInfo.user_name}
								</AvatarFallback>
							</Avatar>
						</div>
						<div className="flex justify-between">
							<UserRound
								className="text-muted-foreground"
								size={20}
							/>
							<span>{value2label(userInfo.role) as string}</span>
						</div>
						<div className="flex justify-between">
							<Mail className="text-muted-foreground" size={20} />
							<span>{userInfo.email}</span>
						</div>
						{userInfo.phone && (
							<div className="flex justify-between">
								<Phone
									className="text-muted-foreground"
									size={20}
								/>
								<span>{userInfo.phone}</span>
							</div>
						)}

						{userInfo.description && (
							<div className="text-base text-muted-foreground overflow-auto m-1 w-full">
								{userInfo.description}
							</div>
						)}
					</div>
				</CardContent>
			</Card>
			<div className="w-2/3">
				<div className="flex flex-col space-y-1 items-start pb-2">
					<span className="text-xl font-semibold leading-none tracking-tight">
						参与组织
					</span>
					<div className="flex flex-row flex-wrap w-full">
						{groups.map(group => (
							<Card className="basis-[48%] p-2 m-1">
								<CardHeader className="p-0">
									<CardTitle className="text-base font-semibold">
										{group.group_name}
									</CardTitle>
								</CardHeader>
								<CardContent className="p-0 pt-2 text-sm align-baseline font-normal text-muted-foreground grid grid-cols-[1fr_3fr] grid-rows-2">
									<div>创建者</div>
									{formatOwner(group.owner)}
									<div>成员</div>
									{formatMembers(group.members)}
								</CardContent>
							</Card>
						))}
					</div>
					<div className="flex flex-row">
						<Button
							size="xxs"
							variant="ghost"
							onClick={previousBatchGroups}
							disabled={groupPage <= 1}
						>
							<ChevronLeft size="18" />
						</Button>
						<Button
							size="xxs"
							variant="ghost"
							onClick={nextBatchGroups}
							disabled={groupPage >= groupPageTotal}
						>
							<ChevronRight size="18" />
						</Button>
					</div>
				</div>
				<Separator />
				<div className="flex flex-col space-y-1 items-start pt-3">
					<span className="text-xl font-semibold leading-none tracking-tight">
						参与项目
					</span>
					<div className="flex flex-row flex-wrap w-full">
						{projects.map(project => (
							<Card className="basis-[48%] p-2 m-1">
								<CardHeader className="p-0">
									<CardTitle className="text-base font-semibold flex flex-row items-center justify-between">
										<div>{project.project_name}</div>
										<Circle
											size="12"
											color={
												project.status === "checked"
													? "#71717A"
													: "#22C55E"
											}
											fill={
												project.status === "checked"
													? "#71717A"
													: "#22C55E"
											}
										/>
									</CardTitle>
								</CardHeader>
								<CardContent className="p-0 pt-2 text-sm align-baseline font-normal text-muted-foreground grid grid-cols-[1fr_3fr] grid-rows-2">
									<div>创建者</div>
									{formatOwner(project.owner)}
									<div>成员</div>
									{formatMembers(project.participants)}
								</CardContent>
							</Card>
						))}
					</div>
					<div className="flex flex-row">
						<Button
							size="xs"
							variant="ghost"
							onClick={previousBatchProjects}
							disabled={projectPage <= 1}
						>
							<ChevronLeft size="18" />
						</Button>
						<Button
							size="xs"
							variant="ghost"
							onClick={nextBatchProjects}
							disabled={projectPage >= projectPageTotal}
						>
							<ChevronRight size="18" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default User
