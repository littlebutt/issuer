import React, { useEffect, useState } from "react"
import { DrawerTrigger } from "./components/ui/drawer"
import { Button } from "./components/ui/button"
import { Project } from "./types"
import {
	fetchProjectPrivileges,
	fetchProjectStatuses,
	fetchUserOptions,
	getProjects,
	getProjectsCount
} from "./fetch"
import { useCookie } from "./lib/cookies"
import { useToast } from "./components/ui/use-toast"
import ProjectTable from "./project-table"
import ProjectNew from "./project-new"

const MyProject: React.FC = () => {
	const [userOptions, setUserOptions] = useState<
		{ value: string; label: string }[]
	>([])

	const [tableContent, setTableContent] = useState<Project[]>([])
	const [pageNum, setPageNum] = useState<number>(1)
	const [pageTotal, setPageTotal] = useState<number>(1)

	const [projectStatuses, setProjectStatuses] = useState<
		{ label: string; value: string }[]
	>([])
	const [projectPrivileges, setProjectPrivileges] = useState<
		{ label: string; value: string }[]
	>([])

	const cookie = useCookie()
	const { toast } = useToast()

	const [drawerOpen, setDrawerOpen] = useState<boolean>(false)

	const refresh = () => {
		fetchProjects()
		fetchProjectsCount()
	}

	const fetchProjects = (currentPageNum?: number) => {
		let user_code = cookie.getCookie("current_user") as string
		user_code = user_code.split(":")[0]
		getProjects(
			"",
			"",
			"",
			"",
			"",
			"",
			user_code,
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
		let user_code = cookie.getCookie("current_user") as string
		user_code = user_code.split(":")[0]
		getProjectsCount("", "", "", "", "", "", user_code)
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
		fetchProjectStatuses(projectStatuses, setProjectStatuses)
		fetchProjectPrivileges(projectPrivileges, setProjectPrivileges)
		fetchUserOptions(userOptions, setUserOptions)
	}, [])

	// TODO: 改成DataTable
	return (
		<div className="flex flex-col space-y-1 w-full px-5 py-0 gap-0 h-full">
			<div className="flex flex-row justify-between h-[6%]">
				<div className="text-3xl font-semibold leading-none tracking-tight">
					我的项目
				</div>
				<ProjectNew
					drawerOpen={drawerOpen}
					setDrawerOpen={setDrawerOpen}
					refresh={refresh}
				>
					<DrawerTrigger asChild>
						<Button>新增</Button>
					</DrawerTrigger>
				</ProjectNew>
			</div>
			<div className="flex justify-center h-[92%]">
				<ProjectTable
					isMine={true}
					current={pageNum}
					total={pageTotal}
					gotoNext={gotoNext}
					gotoPrevious={gotoPrevious}
					tableContent={tableContent}
					projectStatuses={projectStatuses}
					userOptions={userOptions}
					projectPrivileges={projectPrivileges}
					refresh={refresh}
				/>
			</div>
		</div>
	)
}

export default MyProject
