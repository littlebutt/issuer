import React, { useState } from "react"
import { Project } from "./types"
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from "./components/ui/popover"
import { Button } from "./components/ui/button"
import { cn } from "./lib/utils"
import { useCookie } from "./lib/cookies"
import { CalendarIcon, CircleX, PenLine, Plus } from "lucide-react"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "./components/ui/dialog"
import { Label } from "./components/ui/label"
import { Input } from "./components/ui/input"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "./components/ui/select"
import { format } from "date-fns"
import { Calendar } from "./components/ui/calendar"
import { Checkbox } from "./components/ui/checkbox"
import { Textarea } from "./components/ui/textarea"

interface IProjectOperation {
	isMine: boolean
	content: Project
	userOptions: { value: string; label: string }[]
	projectStatuses: { value: string; label: string }[]
	projectPrivileges: { value: string; label: string }[]
	updateProject: (
		projectCode: string,
		projectName: string,
		owner: string,
		projectStatus: string,
		noBudget: boolean,
		privilege: string,
		endDate?: Date,
		budget?: number,
		description?: string
	) => void
	deleteProject: (projectCode: string) => void
	className?: string
	addProject?: (userCode: string, projectCode: string) => void
}

const ProjectOperation: React.FC<IProjectOperation> = props => {
	const cookie = useCookie()

	const [projectName, setProjectName] = useState<string>(
		props.content.project_name
	)
	const [owner, setOwner] = useState<string>(
		props.content.owner.user_code as string
	)
	const [endDate, setEndDate] = useState<Date>()
	const [projectStatus, setProjectStatus] = useState<string>(
		props.content.status
	)
	const [budget, setBudget] = useState<number>(
		props.content.budget ? parseInt(props.content.budget) : 0
	)
	const [noBudget, setNoBudget] = useState<boolean>(
		props.content.budget === undefined
	)
	const [privilege, setPrivilege] = useState<string>(props.content.privilege)
	const [description, setDescription] = useState<string | undefined>(
		props.content.description
	)

	const [dialogOpen, setDialogOpen] = useState<boolean>(false)

	const isProjectParticipant = (content: Project) => {
		let user_code = cookie.getCookie("current_user")?.split(":")[0]
		let res = false
		content.participants.forEach(participant => {
			if (participant.user_code === user_code) {
				res = true
			}
		})
		return res
	}

	const isProjectOwner = (content: Project) => {
		let user_code = cookie.getCookie("current_user")?.split(":")[0]
		return content.owner.user_code === user_code
	}

	const clearInput = () => {
		setProjectName(props.content.project_name)
		setOwner(props.content.owner.user_code as string)
		setEndDate(undefined)
		setProjectStatus(props.content.status)
		setBudget(props.content.budget ? parseInt(props.content.budget) : 0)
		setNoBudget(props.content.budget === undefined)
		setPrivilege(props.content.privilege)
		setDescription(props.content.description)
	}

	return (
		<div className={cn("w-full h-full space-x-1", props.className)}>
			{!props.isMine && (
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							disabled={isProjectParticipant(props.content)}
						>
							<Plus className="h-4 w-4" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[160px] h-[50px] flex flex-row justify-center items-center text-xs space-x-1 p-1 my-1">
						<p>确认加入？</p>
						<Button
							size="sm"
							className="p-1.5 [line-height:10px]"
							onClick={() => {
								if (props.addProject !== undefined) {
									props.addProject(
										cookie
											.getCookie("current_user")
											?.split(":")[0] as string,
										props.content.project_code
									)
								}
							}}
						>
							确认
						</Button>
					</PopoverContent>
				</Popover>
			)}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						disabled={!isProjectOwner(props.content)}
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
						<div className="mt-3 h-[520px] flex flex-col space-y-2">
							<div className="flex flex-col space-y-1">
								<Label htmlFor="projectName">名称</Label>
								<Input
									id="projectName"
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
					</div>
					<DialogFooter className="sm:justify-end">
						<DialogClose
							asChild
							className="flex justify-end space-x-1"
						>
							<Button type="button" variant="secondary">
								取消
							</Button>
						</DialogClose>
						<Button
							onClick={() => {
								props.updateProject(
									props.content.project_code,
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
							}}
						>
							确认
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						disabled={!isProjectOwner(props.content)}
					>
						<CircleX className="h-4 w-4" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[160px] h-[50px] flex flex-row justify-center items-center text-xs space-x-1 p-1 my-1">
					<p>确认删除？</p>
					<Button
						size="sm"
						className="p-1.5 [line-height:10px]"
						onClick={() =>
							props.deleteProject(props.content.project_code)
						}
					>
						确认
					</Button>
				</PopoverContent>
			</Popover>
		</div>
	)
}

export default ProjectOperation
