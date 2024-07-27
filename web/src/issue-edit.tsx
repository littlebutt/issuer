import React, { useEffect, useState } from "react"
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
import { Issue } from "./types"
import { useCookie } from "./lib/cookies"
import { PenLine } from "lucide-react"
import { Label } from "./components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "./components/ui/select"
import { fetchIssueStatuses, fetchUserOptions } from "./fetch"
import {
	MultiSelector,
	MultiSelectorContent,
	MultiSelectorInput,
	MultiSelectorItem,
	MultiSelectorList,
	MultiSelectorTrigger
} from "./components/ui/multi-select"
import { Badge } from "./components/ui/badge"
import { Input } from "./components/ui/input"
import { updateIssueApi } from "./issue-api"
import { useToast } from "./components/ui/use-toast"

interface IIssueEdit {
	issue: Issue
	refresh: () => void
}

const IssueEdit: React.FC<IIssueEdit> = props => {
	const [dialogOpen, setDialogOpen] = useState<boolean>(false)
	const [issueStatuses, setIssueStatuses] = useState<
		{ label: string; value: string }[]
	>([])
	const [userOptions, setUserOptions] = useState<
		{ value: string; label: string }[]
	>([])

	const [issueStatus, setIssueStatus] = useState<string>(props.issue.status)
	const [assigned, setAssigned] = useState<string[]>(
		props.issue.assigned?.map(u => u.user_code) as string[]
	)
	const [tags, setTags] = useState<string[]>(
		props.issue.tags?.split(",") ?? []
	)
	const [cached, setCached] = useState<string>("")

	const cookie = useCookie()
	const { toast } = useToast()

	function isIssueOwner(issue: Issue) {
		let user_code = cookie.getCookie("current_user")?.split(":")[0]
		return issue.owner.user_code === user_code
	}

	const clearInput = () => {
		setIssueStatus(props.issue.status)
		setAssigned(props.issue.assigned?.map(u => u.user_code) as string[])
		setTags(props.issue.tags?.split(",") ?? [])
		setCached("")
	}

	const addTags = (e: any) => {
		if (e.key === "Enter") {
			setTags([cached, ...tags])
			setCached(cached => "")
		}
	}

	const deleteTag = (tag: string) => {
		let _tags = tags.filter(t => t !== tag)
		setTags(_tags)
	}

	const updateIssue = () => {
		updateIssueApi(
			toast,
			props.refresh,
			props.issue.issue_code,
			issueStatus,
			tags.join(","),
			"",
			assigned.join(",")
		)
	}

	useEffect(() => {
		fetchUserOptions(userOptions, setUserOptions)
		fetchIssueStatuses(issueStatuses, setIssueStatuses)
	}, [])

	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					disabled={!isIssueOwner(props.issue)}
					onClick={clearInput}
				>
					<PenLine className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>修改议题</DialogTitle>
				</DialogHeader>
				<div className="p-4 pb-0 w-full">
					<form>
						<div className="mt-3 h-[520px] flex flex-col space-y-2">
							<div className="flex flex-col space-y-1">
								<Label>状态</Label>
								<Select
									onValueChange={v => setIssueStatus(v)}
									value={issueStatus}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{issueStatuses.map(o => (
											<SelectItem value={o.value}>
												{o.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="flex flex-col space-y-1">
								<Label>指派</Label>
								{/* TODO: 组件删除指派影响关注和标签 */}
								<MultiSelector
									values={assigned}
									onValuesChange={setAssigned}
									className="w-full"
								>
									<MultiSelectorTrigger>
										<MultiSelectorInput placeholder="选择用户" />
									</MultiSelectorTrigger>
									<MultiSelectorContent>
										<MultiSelectorList>
											{userOptions.map(userOption => (
												<MultiSelectorItem
													key={userOption.value}
													value={userOption.value}
												>
													{userOption.label}
												</MultiSelectorItem>
											))}
										</MultiSelectorList>
									</MultiSelectorContent>
								</MultiSelector>
							</div>
							<div className="flex flex-col space-y-1">
								<Label>标签</Label>
								<div className="w-full flex flex-row flex-wrap space-x-1">
									{tags.map(tag => (
										<Badge>
											{tag}
											<span
												className="text-zinc-100 ml-1"
												onClick={() => deleteTag(tag)}
											>
												x
											</span>
										</Badge>
									))}
									<Input
										className="h-6 w-24"
										placeholder="按回车新建"
										value={cached}
										onChange={e =>
											setCached(e.target.value)
										}
										onKeyDown={addTags}
									/>
								</div>
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
						onClick={() => {
							updateIssue()
							setDialogOpen(false)
						}}
					>
						确认
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export default IssueEdit
