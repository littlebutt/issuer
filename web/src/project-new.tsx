import React, { useEffect, useState } from "react"
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle
} from "./components/ui/drawer"
import { Label } from "./components/ui/label"
import { useForm } from "react-hook-form"
import { Input } from "./components/ui/input"
import { useToast } from "./components/ui/use-toast"
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from "./components/ui/popover"
import { Button } from "./components/ui/button"
import { cn } from "./lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "./components/ui/calendar"
import { Checkbox } from "./components/ui/checkbox"
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
import { fetchProjectPrivileges } from "./fetch"

interface IProjectNew {
	drawerOpen: boolean
	setDrawerOpen: (open: boolean) => void
	refresh?: () => void
	children?: React.ReactElement
}

const ProjectNew: React.FC<IProjectNew> = props => {
	const [projectName, setProjectName] = useState<string>("")
	const [startDate, setStartDate] = useState<Date>()
	const [endDate, setEndDate] = useState<Date>()
	const [privilege, setPrivilege] = useState<string>("Public")
	const [budget, setBudget] = useState<number>(0)
	const [description, setDescription] = useState<string>("")
	const [noBudget, setNoBudget] = useState<boolean>(false)

	const [projectPrivileges, setProjectPrivileges] = useState<
		{ label: string; value: string }[]
	>([])

	const [startDateError, setStartDateError] = useState<boolean>(false)

	const { toast } = useToast()

	const {
		register,
		formState: { errors },
		handleSubmit
	} = useForm()

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
					if (props.refresh) {
						props.refresh()
					}
					props.setDrawerOpen(false)
				} else {
					toast({
						title: "新增失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
	}

	useEffect(() => {
		fetchProjectPrivileges(projectPrivileges, setProjectPrivileges)
	}, [])

	return (
		<Drawer
			direction="right"
			open={props.drawerOpen}
			onOpenChange={props.setDrawerOpen}
		>
			{props.children}
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
											setProjectName(e.target.value)
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
														<span>选择日期</span>
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
														setStartDateError(false)
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
														<span>选择日期</span>
													)}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0">
												<Calendar
													mode="single"
													selected={endDate}
													onSelect={setEndDate}
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
													Number(e.target.value)
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
									<Label htmlFor="privilege">公开性</Label>
									<Select
										onValueChange={v => setPrivilege(v)}
										value={privilege}
									>
										<SelectTrigger className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												{projectPrivileges.map(p => (
													<SelectItem
														value={p?.value}
													>
														{p?.label}
													</SelectItem>
												))}
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
											setDescription(e.target.value)
										}
									/>
								</div>
							</div>
						</form>
					</div>
					<DrawerFooter>
						<Button onClick={handleSubmit(newProject)}>确定</Button>
						<DrawerClose asChild>
							<Button variant="outline">取消</Button>
						</DrawerClose>
					</DrawerFooter>
				</div>
			</DrawerContent>
		</Drawer>
	)
}

export default ProjectNew
