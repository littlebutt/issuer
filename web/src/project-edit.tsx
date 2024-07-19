import React, { useState } from "react"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "./components/ui/dialog"
import { Button } from "./components/ui/button"
import { CalendarIcon, PenLine } from "lucide-react"
import { useCookie } from "./lib/cookies"
import { Project } from "./types"
import { Label } from "./components/ui/label"
import { useForm } from "react-hook-form"
import { Input } from "./components/ui/input"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "./components/ui/select"
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from "./components/ui/popover"
import { cn } from "./lib/utils"
import { format } from "date-fns"
import { Calendar } from "./components/ui/calendar"
import { Checkbox } from "./components/ui/checkbox"
import { Textarea } from "./components/ui/textarea"
import { updateProjectApi } from "./project-api"
import { useToast } from "./components/ui/use-toast"

interface IProjectEdit {
	project: Project
	userOptions: { label: string; value: string }[]
	projectStatuses: { label: string; value: string }[]
	projectPrivileges: { label: string; value: string }[]
	refresh: () => void
}

const ProjectEdit: React.FC<IProjectEdit> = props => {
	const [dialogOpen, setDialogOpen] = useState<boolean>(false)

	const cookie = useCookie()

	const [projectName, setProjectName] = useState<string>(
		props.project.project_name
	)
	const [owner, setOwner] = useState<string>(
		props.project.owner.user_code as string
	)
	const [endDate, setEndDate] = useState<Date>()
	const [projectStatus, setProjectStatus] = useState<string>(
		props.project.status
	)
	const [budget, setBudget] = useState<number>(
		props.project.budget ? parseInt(props.project.budget) : 0
	)
	const [noBudget, setNoBudget] = useState<boolean>(
		props.project.budget === undefined
	)
	const [privilege, setPrivilege] = useState<string>(props.project.privilege)
	const [description, setDescription] = useState<string | undefined>(
		props.project.description
	)

	const {
		register,
		formState: { errors },
		handleSubmit
	} = useForm()

	const { toast } = useToast()

	const isProjectOwner = (content: Project) => {
		let user_code = cookie.getCookie("current_user")?.split(":")[0]
		return content.owner.user_code === user_code
	}

	const clearInput = () => {
		setProjectName(props.project.project_name)
		setOwner(props.project.owner.user_code as string)
		setEndDate(undefined)
		setProjectStatus(props.project.status)
		setBudget(props.project.budget ? parseInt(props.project.budget) : 0)
		setNoBudget(props.project.budget === undefined)
		setPrivilege(props.project.privilege)
		setDescription(props.project.description)
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
		updateProjectApi(
			toast,
			props.refresh,
			projectCode,
			projectName,
			owner,
			projectStatus,
			noBudget,
			privilege,
			endDate,
			budget,
			description
		)
	}

	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					disabled={!isProjectOwner(props.project)}
					onClick={clearInput}
				>
					<PenLine className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>修改项目</DialogTitle>
				</DialogHeader>
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
									value={projectName}
								/>
							</div>
							<div className="flex flex-col space-y-1">
								<Label htmlFor="owner">所有者</Label>
								<Select
									onValueChange={v => setOwner(v)}
									value={owner}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{props.userOptions.map(o => (
											<SelectItem value={o.value}>
												{o.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="flex flex-col space-y-1">
								<Label htmlFor="endDate">结束日期</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant={"outline"}
											className={cn(
												"w-full justify-start text-left font-normal",
												!endDate &&
													"text-muted-foreground"
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{endDate ? (
												format(endDate, "yyyy-MM-dd")
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
							<div className="flex flex-col space-y-1">
								<Label>状态</Label>
								<Select
									onValueChange={v => setProjectStatus(v)}
									value={projectStatus}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											{props.projectStatuses.map(p => (
												<SelectItem value={p?.value}>
													{p?.label}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
							<div className="flex flex-col space-y-1">
								<Label>预算</Label>
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
											setBudget(Number(e.target.value))
										}
										className="w-3/5"
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
									<Label htmlFor="noBudget">未设预算</Label>
								</div>
							</div>
							<div className="flex flex-col space-y-1">
								<Label>权限</Label>
								<Select
									onValueChange={v => setPrivilege(v)}
									value={privilege}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											{props.projectPrivileges.map(p => (
												<SelectItem value={p?.value}>
													{p?.label}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
							<div className="flex flex-col space-y-1">
								<Label>项目描述</Label>
								<Textarea
									className="h-150 min-h-[100px]"
									onChange={e =>
										setDescription(e.target.value)
									}
									value={description}
								/>
							</div>
						</div>
					</form>
				</div>
				<DialogFooter className="sm:justify-end">
					<DialogClose asChild className="flex justify-end space-x-1">
						<Button type="button" variant="secondary">
							取消
						</Button>
					</DialogClose>
					<Button
						onClick={handleSubmit(() => {
							updateProject(
								props.project.project_code,
								projectName,
								owner,
								projectStatus,
								noBudget,
								privilege,
								endDate,
								budget,
								description
							)
							setDialogOpen(false)
						})}
					>
						确认
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export default ProjectEdit
