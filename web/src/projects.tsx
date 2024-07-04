import React, { useEffect, useState } from "react"
import { Label } from "./components/ui/label"
import { Input } from "./components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "./components/ui/select"
import {
	fetchProjectPrivileges,
	fetchProjectStatuses,
	fetchUserOptions,
	getProjects,
	getProjectsCount
} from "./fetch"
import { Button } from "./components/ui/button"
import ProjectTable from "./project-table"
import { Project } from "./types"
import { useToast } from "./components/ui/use-toast"
import { format } from "date-fns"
import axios from "axios"

const Projects: React.FC = () => {
	const [tableContent, setTableContent] = useState<Project[]>([])
	const [projectName, setProjectName] = useState<string>("")
	const [owner, setOwner] = useState<string>("")
	const [projectStatus, setProjectStatus] = useState<string>("")

	const [userOptions, setUserOptions] = useState<
		{ label: string; value: string }[]
	>([])
	const [projectStatuses, setProjectStatuses] = useState<
		{ label: string; value: string }[]
	>([])
	const [projectPrivileges, setProjectPrivileges] = useState<
		{ label: string; value: string }[]
	>([])

	const [pageNum, setPageNum] = useState<number>(1)
	const [pageTotal, setPageTotal] = useState<number>(0)

	const { toast } = useToast()

	const search = () => {
		fetchProjects()
		fetchProjectsCount()
	}

	const clearInput = () => {
		setProjectName("")
		setOwner("")
		setProjectStatus("")
	}

	const fetchProjects = (currentPageNum?: number) => {
		getProjects(
			"",
			projectName,
			"",
			"",
			owner,
			projectStatus,
			"",
			currentPageNum ?? pageNum,
			12
		)
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					setTableContent(res.data.data)
				} else {
					toast({
						title: "获取项目失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
	}

	const fetchProjectsCount = () => {
		getProjectsCount("", projectName, "", "", owner, projectStatus, "")
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					setPageTotal(Math.ceil(res.data.data / 12))
				} else {
					toast({
						title: "获取项目总数失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
	}

	const updateProject = (
		projectCode: string,
		projectName: string,
		owner: string,
		projectStatus: string,
		noBudget: boolean,
		privilege: string,
		endDate?: Date,
		budget?: number,
		description?: string
	) => {
		let endDateParam = endDate ? format(endDate, "yyyy-MM-dd") : ""
		let budgetParam = noBudget ? "" : (budget as number).toString()
		axios({
			method: "POST",
			url: "/project/change",
			data: {
				project_code: projectCode,
				project_name: projectName,
				end_date: endDateParam,
				status: projectStatus,
				owner,
				description,
				budget: budgetParam,
				privilege
			}
		})
			.then(res => {
				if (res.status === 200 && res.data?.success === true) {
					toast({
						title: "更新成功",
						variant: "success"
					})
					fetchProjects()
					fetchProjectsCount()
				} else {
					toast({
						title: "更新失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
	}

	const deleteProject = (projectCode: string) => {
		axios({
			method: "POST",
			url: "/project/delete",
			data: {
				project_code: projectCode
			}
		})
			.then(res => {
				if (res.status === 200 && res.data?.success === true) {
					toast({
						title: "删除成功",
						variant: "success"
					})
					fetchProjects()
					fetchProjectsCount()
				} else {
					toast({
						title: "删除失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
	}

	const addProject = (userCode: string, projectCode: string) => {
		axios({
			method: "POST",
			url: "/project/add",
			data: {
				project_code: projectCode,
				new_member: userCode
			}
		}).then(res => {
			if (res.status === 200 && res.data.success === true) {
				toast({
					title: "加入成功",
					variant: "success"
				})
				fetchProjects()
			} else {
				toast({
					title: "加入失败",
					variant: "destructive"
				})
			}
		})
	}

	const gotoPrevious = () => {
		setPageNum(pageNum => Math.max(pageNum - 1, 1))
		fetchProjects(Math.max(pageNum - 1, 1))
	}

	const gotoNext = () => {
		setPageNum(pageNum => Math.min(pageNum + 1, pageTotal))
		fetchProjects(Math.min(pageNum + 1, pageTotal))
	}

	useEffect(() => {
		fetchProjects()
		fetchProjectsCount()
		fetchUserOptions(userOptions, setUserOptions)
		fetchProjectStatuses(projectStatuses, setProjectStatuses)
		fetchProjectPrivileges(projectPrivileges, setProjectPrivileges)
	}, [])

	return (
		<div>
			<div className="grid grid-rows-[45px_590px] w-full px-5 py-0 gap-0 max-h-[618px]">
				<div className="flex justify-start space-x-2 space-y-1">
					<div className="flex flex-row space-x-0">
						<Label
							htmlFor="group-name"
							className="w-[70px] pt-1 text-base font-semibold"
						>
							名称
						</Label>
						<Input
							className="h-8"
							id="group-name"
							onChange={e => setProjectName(e.target.value)}
							value={projectName}
						></Input>
					</div>
					<div className="flex flex-row space-x-0 px-3">
						<Label
							htmlFor="owner"
							className="w-[70px] pt-1 text-base font-semibold"
						>
							创建者
						</Label>
						<Select onValueChange={v => setOwner(v)} value={owner}>
							<SelectTrigger className="md:w-[187px] h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{userOptions.map(o => (
									<SelectItem value={o.value}>
										{o.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex flex-row space-x-0 px-3">
						<Label className="w-[70px] pt-1 text-base font-semibold">
							状态
						</Label>
						<Select
							onValueChange={v => setProjectStatus(v)}
							value={projectStatus}
						>
							<SelectTrigger className="md:w-[187px] h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{projectStatuses.map(o => (
									<SelectItem value={o.value}>
										{o.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<Button onClick={search}>搜索</Button>
					<Button variant="outline" onClick={clearInput}>
						重置
					</Button>
				</div>
				<div className="flex justify-center">
					<ProjectTable
						isMine={false}
						current={pageNum}
						total={pageTotal}
						gotoNext={gotoNext}
						gotoPrevious={gotoPrevious}
						tableContent={tableContent}
						userOptions={userOptions}
						projectStatuses={projectStatuses}
						projectPrivileges={projectPrivileges}
						updateProject={updateProject}
						deleteProject={deleteProject}
						addProject={addProject}
					/>
				</div>
			</div>
		</div>
	)
}

export default Projects
