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
import { UserGroup } from "./types"
import { Button } from "./components/ui/button"
import { PenLine, Plus } from "lucide-react"
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
	Popover,
	PopoverContent,
	PopoverTrigger
} from "./components/ui/popover"
import { cn } from "./lib/utils"
import { useForm } from "react-hook-form"
import { addGroupApi, updateGroupApi } from "./group-api"
import { useToast } from "./components/ui/use-toast"
import {
	MultiSelector,
	MultiSelectorContent,
	MultiSelectorInput,
	MultiSelectorItem,
	MultiSelectorList,
	MultiSelectorTrigger
} from "./components/ui/multi-select"

interface IGroupOperation {
	isMine: boolean
	content: UserGroup
	userOptions: { value: string; label: string }[]
	refresh: () => void
	className?: string
}

const GroupOperation: React.FC<IGroupOperation> = props => {
	const cookie = useCookie()
	const [groupName, setGroupName] = useState<string>("")
	const [owner, setOwner] = useState<string>("")
	const [selectedUsers, setSelectedUsers] = useState<string[]>([])

	const {
		register,
		formState: { errors },
		handleSubmit
	} = useForm()

	const [dialogOpen, setDialogOpen] = useState<boolean>(false)

	const { toast } = useToast()

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
		updateGroupApi(
			toast,
			props.refresh,
			groupCode,
			groupName,
			owner,
			members
		)
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
							onClick={() => {
								addGroup(
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
									<MultiSelector
										values={selectedUsers}
										onValuesChange={setSelectedUsers}
										className="max-w-xs w-full"
									>
										<MultiSelectorTrigger>
											<MultiSelectorInput placeholder="选择用户" />
										</MultiSelectorTrigger>
										<MultiSelectorContent>
											<MultiSelectorList>
												{props.userOptions.map(
													userOption => (
														<MultiSelectorItem
															key={
																userOption.value
															}
															value={
																userOption.value
															}
														>
															{userOption.label}
														</MultiSelectorItem>
													)
												)}
											</MultiSelectorList>
										</MultiSelectorContent>
									</MultiSelector>
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
									selectedUsers.join(",")
								)
								setDialogOpen(false)
							})}
						>
							确认
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default GroupOperation
