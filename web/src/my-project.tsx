import React, { useEffect, useState } from "react"
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger
} from "./components/ui/drawer"
import { Button } from "./components/ui/button"
import { Label } from "./components/ui/label"
import { Input } from "./components/ui/input"
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
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from "./components/ui/popover"
import { cn } from "./lib/utils"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "./components/ui/calendar"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "./components/ui/select"
import { Textarea } from "./components/ui/textarea"
import axios from "axios"
import ProjectTable from "./project-table"
import { Checkbox } from "./components/ui/checkbox"
import { useForm } from "react-hook-form"

const MyProject: React.FC = () => {
	const [userOptions, setUserOptions] = useState<
		{ value: string; label: string }[]
	>([])

	const [tableContent, setTableContent] = useState<Project[]>([])
	const [pageNum, setPageNum] = useState<number>(1)
	const [pageTotal, setPageTotal] = useState<number>(1)
	const [projectName, setProjectName] = useState<string>("")
	const [startDate, setStartDate] = useState<Date>()
	const [endDate, setEndDate] = useState<Date>()
	const [privilege, setPrivilege] = useState<string>("Public")
	const [budget, setBudget] = useState<number>(0)
	const [description, setDescription] = useState<string>("")
	const [noBudget, setNoBudget] = useState<boolean>(false)

	const [projectStatuses, setProjectStatuses] = useState<
		{ label: string; value: string }[]
	>([])
	const [projectPrivileges, setProjectPrivileges] = useState<
		{ label: string; value: string }[]
	>([])

	const cookie = useCookie()
	const { toast } = useToast()
	const {
		register,
		formState: { errors },
		handleSubmit
	} = useForm()
	const [startDateError, setStartDateError] = useState<boolean>(false)

	const [drawerOpen, setDrawerOpen] = useState<boolean>(false)

	const newProject = () => {
		// FIXME: 用react-hook-form检查startDate
		if (!startDate) {
			setStartDateError(true)
			return
		}
		let startDateParam = format(startDate, "yyyy-MM-dd")
		let endDateParam = endDate ? format(endDate, "yyyy-MM-dd") : ""
		let budgetParam = noBudget ? "" : budget.toString()
		axios({
			method: "POST",
			url: "/project/new",
			data: {
				project_name: projectName,
				start_date: startDateParam,
				end_date: endDateParam,
				description,
				budget: budgetParam,
				privilege
			}
		})
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					toast({
						title: "新增成功",
						variant: "success"
					})
					fetchProjects()
					fetchProjectsCount()
					setDrawerOpen(false)
				} else {
					toast({
						title: "新增失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
	}

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

	return (
		<div className="flex flex-col space-y-1 w-full px-5 py-0 gap-0 h-full">
			<div className="flex flex-row justify-between h-[6%]">
				<div className="text-3xl font-semibold leading-none tracking-tight">
					我的项目
				</div>
				<Drawer
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
								<DrawerTitle>新增项目</DrawerTitle>
							</DrawerHeader>
							<div className="p-4 pb-0 w-full">
								<form>
									<div className="mt-3 h-[520px] flex flex-col space-y-2">
										<div className="flex flex-col space-y-1">
											<Label htmlFor="projectName">
												名称
												{errors.projectName && (
													<span className="text-red-500">
														{" "}
														请填写名称
													</span>
												)}
											</Label>
											<Input
												id="projectName"
												{...register("projectName", {
													required: true
												})}
												onChange={e =>
													setProjectName(
														e.target.value
													)
												}
											/>
										</div>
										<div className="flex flex-row space-x-1">
											<div className="flex flex-col space-y-1">
												<Label htmlFor="startDate">
													开始日期
													{startDateError && (
														<span className="text-red-500">
															{" "}
															请填写开始日期
														</span>
													)}
												</Label>
												<Popover>
													<PopoverTrigger asChild>
														<Button
															variant={"outline"}
															className={cn(
																"w-[280px] justify-start text-left font-normal",
																!startDate &&
																	"text-muted-foreground"
															)}
														>
															<CalendarIcon className="mr-2 h-4 w-4" />
															{startDate ? (
																format(
																	startDate,
																	"yyyy-MM-dd"
																)
															) : (
																<span>
																	选择日期
																</span>
															)}
														</Button>
													</PopoverTrigger>
													<PopoverContent className="w-auto p-0">
														<Calendar
															className="z-50"
															mode="single"
															selected={startDate}
															onSelect={v => {
																setStartDate(v)
																setStartDateError(
																	false
																)
															}}
															initialFocus
														/>
													</PopoverContent>
												</Popover>
											</div>
											<div className="flex flex-col space-y-1">
												<Label htmlFor="startDate">
													结束日期
												</Label>
												<Popover>
													<PopoverTrigger asChild>
														<Button
															variant={"outline"}
															className={cn(
																"w-[280px] justify-start text-left font-normal",
																!endDate &&
																	"text-muted-foreground"
															)}
														>
															<CalendarIcon className="mr-2 h-4 w-4" />
															{endDate ? (
																format(
																	endDate,
																	"yyyy-MM-dd"
																)
															) : (
																<span>
																	选择日期
																</span>
															)}
														</Button>
													</PopoverTrigger>
													<PopoverContent className="w-auto p-0">
														<Calendar
															mode="single"
															selected={endDate}
															onSelect={
																setEndDate
															}
															initialFocus
														/>
													</PopoverContent>
												</Popover>
											</div>
										</div>
										<div className="flex flex-col space-y-1">
											<Label htmlFor="budget">预算</Label>
											<div className="flex flex-row space-x-1 items-center">
												<span className="text-xl font-semibold">
													￥
												</span>
												<Input
													type="number"
													id="budget"
													value={budget}
													disabled={noBudget}
													onChange={e =>
														setBudget(
															Number(
																e.target.value
															)
														)
													}
													className="w-3/4"
												/>
												&nbsp;
												<Checkbox
													id="noBudget"
													className="peer"
													checked={noBudget}
													onCheckedChange={() =>
														setNoBudget(!noBudget)
													}
												/>
												<Label htmlFor="noBudget">
													未设预算
												</Label>
											</div>
										</div>
										<div className="flex flex-col space-y-1">
											<Label htmlFor="privilege">
												公开性
											</Label>
											<Select
												onValueChange={v =>
													setPrivilege(v)
												}
												value={privilege}
											>
												<SelectTrigger className="w-full">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectGroup>
														{projectPrivileges.map(
															p => (
																<SelectItem
																	value={
																		p?.value
																	}
																>
																	{p?.label}
																</SelectItem>
															)
														)}
													</SelectGroup>
												</SelectContent>
											</Select>
										</div>
										<div className="flex flex-col space-y-1">
											<Label htmlFor="description">
												项目描述
											</Label>
											<Textarea
												className="h-150 min-h-[150px]"
												onChange={e =>
													setDescription(
														e.target.value
													)
												}
											/>
										</div>
									</div>
								</form>
							</div>
							<DrawerFooter>
								<Button onClick={handleSubmit(newProject)}>
									确定
								</Button>
								<DrawerClose asChild>
									<Button variant="outline">取消</Button>
								</DrawerClose>
							</DrawerFooter>
						</div>
					</DrawerContent>
				</Drawer>
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
