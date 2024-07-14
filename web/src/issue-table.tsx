import React, { useEffect, useState } from "react"
import { Label } from "./components/ui/label"
import { fetchIssueStatuses, fetchUserOptions, getIssues } from "./fetch"
import { useToast } from "./components/ui/use-toast"
import { Input } from "./components/ui/input"
import { Issue } from "./types"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "./components/ui/select"
import { Button } from "./components/ui/button"
import { Circle } from "lucide-react"
import { Badge } from "./components/ui/badge"

interface IIssueTable {
	projectCode: string
}

const IssueTable: React.FC<IIssueTable> = props => {
	const [isAdvancedSearch, setIsAdvancedSearch] = useState<boolean>(false)

	const [issues, setIssues] = useState<Issue[]>([])

	const [issueStatusOptions, setIssueStatusOptions] = useState<
		{ value: string; label: string }[]
	>([])
	const [userOptions, setUserOptions] = useState<
		{ value: string; label: string }[]
	>([])

	const { toast } = useToast()

	const formatIssueStatus = (issueStatus: string) => {
		let circle = <Circle size="12" color="#22C55E" fill="#22C55E" />
		if (issueStatus === "open") {
			circle.props.color = "#22C55E"
			circle.props.fill = "#22C55E"
		} else if (issueStatus === "finished") {
			circle.props.color = "#71717A"
			circle.props.fill = "#71717A"
		} else if (issueStatus === "closed") {
			circle.props.color = "	EF4444"
			circle.props.fill = "#71717A"
		}
		return circle
	}

	useEffect(() => {
		getIssues("", props.projectCode, "", "", "", "", "", "", "", "", "")
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					setIssues(res.data.data)
				} else {
					toast({
						title: "获取议题列表失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
		fetchIssueStatuses(issueStatusOptions, setIssueStatusOptions)
		fetchUserOptions(userOptions, setUserOptions)
	}, [])

	return (
		<div className="w-full flex-1 flex flex-col space-y-3">
			<div className="w-full flex flex-row space-x-2">
				{!isAdvancedSearch ? (
					<div className="w-full flex felx-row space-x-1">
						<div className="flex flex-row space-x-1">
							<Label
								htmlFor="title"
								className="text-base font-semibold"
							>
								标题
							</Label>
							<Input id="title" className="h-8 w-[150px]" />
						</div>
						<div className="flex flex-row space-x-1">
							<Label className="text-base font-semibold">
								状态
							</Label>
							<Select>
								<SelectTrigger className="h-8 w-[150px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{issueStatusOptions.map(o => (
										<SelectItem value={o.value}>
											{o.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-row space-x-1">
							<Label className="text-base font-semibold">
								创建者
							</Label>
							<Select>
								<SelectTrigger className="h-8 w-[150px]">
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
					</div>
				) : (
					<div className="w-full">
						<Input
							className="h-8 w-full"
							placeholder="请填写搜索表达式，例如“tags:测试,重建 owner:US101”"
						/>
					</div>
				)}
				<Button
					variant="link"
					onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
					className="text-sm"
				>
					{isAdvancedSearch ? "普通搜索" : "高级搜索"}
				</Button>
				<Button size="sm">搜索</Button>
				<Button size="sm" variant="outline">
					重置
				</Button>
			</div>
			<div className="w-full flex flex-1 flex-col flex-wrap space-y-2">
				{issues.map(issue => (
					<div className=" w-full p-2 m-1 border rounded-lg border-zinc-200 bg-white text-zinc-950 shadow-sm flex flex-col space-y-1">
						<div className="w-full flex flex-row justify-start items-end">
							<div className="mr-2">
								{formatIssueStatus(issue.status)}
							</div>
							<div className="flex flex-row space-x-1 items-end">
								<span className="text-lg font-semibold leading-none tracking-tight">
									{issue.title}
								</span>
								<span className="text-base font-thin leading-none tracking-tight">
									#{issue.issue_id}
								</span>
							</div>
						</div>
						<div className="w-full justify-start flex flex-row flex-wrap space-x-1 overflow-y-auto">
							{issue.tags
								?.split(",")
								.map(tag => <Badge>{tag}</Badge>)}
						</div>
						<div className="w-full h-14 overflow-x-auto text-base font-normal text-muted-foreground">
							{issue.description}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default IssueTable
