import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
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
	Phone,
	UserRound
} from "lucide-react"
import { Button } from "./components/ui/button"
import { AvatarCircles } from "./components/ui/avatar-circle"
import { formatMembers, formatOwner } from "./utils"

const User: React.FC = () => {
	const { userCode } = useParams()

	const { toast } = useToast()

	const [userInfo, setUserInfo] = useState<UserType>({})
	const [groups, setGroups] = useState<UserGroup[]>([])
	const [groupPage, setGroupPage] = useState<number>(1)
	const [groupPageTotal, setGroupPageTotal] = useState<number>(1)
	const [projects, setProjects] = useState<Project[]>([])
	const [projectPage, setProjectPage] = useState<number>(1)
	const [projectPageTotal, setProjectPageTotal] = useState<number>(1)
	const [roles, setRoles] = useState<{ label: string; value: string }[]>([])

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
		<div className="flex flex-col items-center space-y-2 w-full py-0 h-[calc(100vh-55px)] overflow-y-auto">
			<div className="w-[600px] flex flex-col space-y-4">
				<div className="flex flex-row space-x-3 items-end">
					<span className="text-3xl font-semibold leading-none tracking-tight">
						{userInfo.user_name}
					</span>
					<span className="text-base font-thin tracking-tight align-text-bottom">
						{userInfo.user_code}
					</span>
				</div>
				<Separator />
				<div className="flex flex-col items-center">
					<Avatar className="size-64">
						<AvatarImage
							src={userInfo.avatar ?? "/statics/avatar.png"}
						/>
						<AvatarFallback>{userInfo.user_name}</AvatarFallback>
					</Avatar>
					<div className="flex flex-row flex-wrap space-y-2 mt-3 mb-3 w-full">
						<div className="text-base text-muted-foreground flex flex-row space-x-2 basis-[48%] m-1">
							<UserRound size="20"></UserRound>
							{value2label(userInfo.role) as string}
						</div>
						<div className="text-base text-muted-foreground flex flex-row space-x-2 basis-[48%] m-1">
							<Mail size="20" />
							{userInfo.email}
						</div>
						{userInfo.phone && (
							<div className="text-base text-muted-foreground flex flex-row space-x-2 basis-[48%] m-1">
								<Phone size="20" />
								{userInfo.phone}
							</div>
						)}
						{userInfo.description && (
							<div className="text-base text-muted-foreground space-x-2 basis-[48%] overflow-auto m-1">
								{userInfo.description}
							</div>
						)}
					</div>
				</div>
				<Separator />
				<div className="flex flex-col space-y-1 items-start">
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
								<CardContent className="p-0 text-sm font-normal text-muted-foreground flex flex-col space-y-1">
									<div className="flex flex-row">
										创建者&nbsp;
										{formatOwner(group.owner)}
									</div>
									<div className="flex flex-row">
										成员&nbsp;
										{formatMembers(group.members)}
									</div>
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
				<div className="flex flex-col space-y-1 items-start">
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
										/>
									</CardTitle>
								</CardHeader>
								<CardContent className="p-0 text-sm font-normal text-muted-foreground flex flex-col space-y-1">
									<div className="flex flex-row">
										创建者&nbsp;
										{formatOwner(project.owner)}
									</div>
									<div className="flex flex-row">
										成员&nbsp;
										{formatMembers(project.participants)}
									</div>
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
