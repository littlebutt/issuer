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
import { useCookie } from "./lib/cookies"
import { SelectValue as Selected } from "react-tailwindcss-select/dist/components/type"
import { UserGroup } from "./types"
import { Button } from "./components/ui/button"
import { CircleX, PenLine, Plus } from "lucide-react"
import { Label } from "./components/ui/label"
import { Input } from "./components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "./components/ui/select"
import { MultiSelect } from "./components/ui/multi-select"
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from "./components/ui/popover"
import { cn } from "./lib/utils"
import { useForm } from "react-hook-form"
import { addGroupApi, deleteGroupApi, updateGroupApi } from "./group-api"
import { useToast } from "./components/ui/use-toast"

interface IGroupOperation {
	isMine: boolean
	content: UserGroup
	userOptions: { value: string; label: string }[]
	refresh: () => void,
	className?: string
}

const GroupOperation: React.FC<IGroupOperation> = props => {
	const cookie = useCookie()
	const [groupName, setGroupName] = useState<string>("")
	const [owner, setOwner] = useState<string>("")
	const [selectedUsers, setSelectedUsers] = useState<any[]>([])

	const {
		register,
		formState: { errors },
		handleSubmit
	} = useForm()

	const [dialogOpen, setDialogOpen] = useState<boolean>(false)

	const { toast } = useToast()

	const changeUserOptions: (value: Selected) => void = (value: Selected) => {
		setSelectedUsers(value as any)
	}

	const users2str = (users: any[]) => {
		return users.map(u => u.value).join(",")
	}

	const isGroupMember = (content: UserGroup) => {
		let user_code = cookie.getCookie("current_user")?.split(":")[0]
		let res = false
		content.members.forEach(member => {
			if (member.user_code === user_code) {
				res = true
			}
		})
		return res
	}

	const isGroupOwner = (content: UserGroup) => {
		let user_code = cookie.getCookie("current_user")?.split(":")[0]
		return content.owner.user_code === user_code
	}

	const clearInput = () => {
		setGroupName("")
		setOwner("")
		setSelectedUsers([])
	}

	const updateGroup = (
		groupCode: string,
		groupName: string,
		owner: string,
		members: string
	) => {
		updateGroupApi(toast, props.refresh, groupCode, groupName, owner, members)
	}

	const deleteGroup = (
		groupCode: string
	) => {
		deleteGroupApi(toast, props.refresh, groupCode)
	}

	const addGroup = (newMember: string, groupCode: string) => {
		addGroupApi(toast, props.refresh, newMember, groupCode)
	}

	return (
		<div className={cn("w-full h-full space-x-1", props.className)}>
			{!props.isMine && (
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							disabled={isGroupMember(props.content)}
						>
							<Plus className="h-4 w-4" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[140px] h-[40px] flex flex-row justify-center items-center text-xs space-x-1 p-0 my-0">
						<p>确认加入？</p>
						<Button
							variant="link"
							size="sm"
							className="p-1.5 [line-height:10px] text-xs"
							onClick={() => {addGroup(
										cookie
											.getCookie("current_user")
											?.split(":")[0] as string,
										props.content.group_code
									)
								
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
						disabled={!isGroupOwner(props.content)}
						onClick={clearInput}
					>
						<PenLine className="h-4 w-4" />
					</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>修改组织</DialogTitle>
					</DialogHeader>
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
										value={props.content.group_name}
									/>
								</div>
								<div className="flex flex-col space-y-1">
									<Label htmlFor="owner">所有者</Label>
									<Select onValueChange={v => setOwner(v)}>
										<SelectTrigger>
											<SelectValue
												placeholder={
													props.content.owner
														.user_name
												}
											/>
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
									<Label htmlFor="members">成员</Label>
									<MultiSelect
										options={props.userOptions}
										placeholder={props.content.members
											.map(m => m.user_name)
											.join(",")}
										value={selectedUsers}
										onChange={changeUserOptions}
									/>
								</div>
							</div>
						</form>
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
							onClick={handleSubmit(() => {
								updateGroup(
									props.content.group_code,
									groupName,
									owner,
									users2str(selectedUsers)
								)
								setDialogOpen(false)
							})}
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
						disabled={!isGroupOwner(props.content)}
					>
						<CircleX className="h-4 w-4" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[140px] h-[40px] flex flex-row justify-center items-center text-xs space-x-1 p-0 my-0">
					<p>确认删除？</p>
					<Button
						variant="link"
						size="sm"
						className="p-1.5 [line-height:10px] text-xs"
						onClick={() =>
							deleteGroup(props.content.group_code)
						}
					>
						确认
					</Button>
				</PopoverContent>
			</Popover>
		</div>
	)
}

export default GroupOperation
