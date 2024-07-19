import React, { useEffect, useState } from "react"
import { Label } from "./components/ui/label"
import {
	fetchIssueStatuses,
	fetchUserOptions,
	getIssues,
	getIssuesCount
} from "./fetch"
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
import { ChevronLeft, ChevronRight, Circle } from "lucide-react"
import { Badge } from "./components/ui/badge"
import {
	Pagination,
	PaginationContent,
	PaginationItem
} from "./components/ui/pagination"
import { formatIssue } from "./utils"

interface IIssueTable {
	projectCode: string
}

const IssueTable: React.FC<IIssueTable> = props => {
	const [isAdvancedSearch, setIsAdvancedSearch] = useState<boolean>(false)

	const [issues, setIssues] = useState<Issue[]>([])
	const [title, setTitle] = useState<string>("")
	const [issueStatus, setIssueStatus] = useState<string>("")
	const [owner, setOwner] = useState<string>("")
	const [id, setId] = useState<string>("")
	const [proposeDate, setProposeDate] = useState<string>("")
	const [desc, setDesc] = useState<string>("")
	const [tags, setTags] = useState<string[]>([])

	const [advancedInput, setAdvancedInput] = useState<string>("")

	const [current, setCurrent] = useState<number>(1)
	const [total, setTotal] = useState<number>(1)

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
			circle.props.color = "#EF4444"
			circle.props.fill = "#EF4444"
		}
		return circle
	}

	const lable2val = (label: string) => {
		for (let opt of issueStatusOptions) {
			if (opt.label === label) {
				return opt.value
			}
		}
		return "unknown"
	}

	const fetchIssue = (pageNum?: number) => {
		getIssues(
			"",
			props.projectCode,
			id,
			title,
			desc,
			owner,
			proposeDate,
			issueStatus,
			tags.join(","),
			"",
			"",
			pageNum ?? current
		)
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
	}

	const refresh = () => {
		fetchIssue()

		getIssuesCount(
			"",
			props.projectCode,
			id,
			title,
			desc,
			owner,
			proposeDate,
			issueStatus,
			tags.join(","),
			"",
			""
		)
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					setTotal(Math.ceil(res.data?.data / 10))
				} else {
					toast({
						title: "获取议题列表数量失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
	}

	const gotoNext = () => {
		setCurrent(current => Math.min(current + 1, total))
		fetchIssue(Math.min(current + 1, total))
	}

	const gotoPrevious = () => {
		setCurrent(current => Math.max(current - 1, 1))
		fetchIssue(Math.max(current - 1, 1))
	}

	const parseAdvancedInput = () => {
		advancedInput.split(" ").forEach(input => {
			if (input.startsWith("序号")) {
				setId(input.substring(2))
			}
			if (input.startsWith("日期")) {
				setProposeDate(input.substring(2))
			}
			if (input.startsWith("描述")) {
				setDesc(input.substring(2))
			}
			if (input.startsWith("标签")) {
				setTags([input.substring(2), ...tags])
			}
			if (input.startsWith("标题")) {
				setTitle(input.substring(2))
			}
			if (input.startsWith("作者")) {
				setOwner(input.substring(2))
			}
			if (input.startsWith("状态")) {
				setIssueStatus(lable2val(input.substring(2)))
			}
		})
	}

	const clearInput = () => {
		setTitle("")
		setIssueStatus("")
		setOwner("")
		setAdvancedInput("")
		setId("")
		setProposeDate("")
		setDesc("")
		setTags([])
	}

	useEffect(() => {
		refresh()
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
							<Input
								id="title"
								className="h-8 w-[150px]"
								onChange={e => setTitle(e.target.value)}
								value={title}
							/>
						</div>
						<div className="flex flex-row space-x-1">
							<Label className="text-base font-semibold">
								状态
							</Label>
							<Select
								value={issueStatus}
								onValueChange={v => setIssueStatus(v)}
							>
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
							<Select
								value={owner}
								onValueChange={v => setOwner(v)}
							>
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
							placeholder="请填写搜索表达式，例如“标签测试 作者US101 序号3”"
							value={advancedInput}
							onBlur={parseAdvancedInput}
							onChange={e => setAdvancedInput(e.target.value)}
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
				<Button
					size="sm"
					variant="link"
					className="text-sm"
					onClick={refresh}
				>
					搜索
				</Button>
				<Button
					size="sm"
					variant="link"
					className="text-sm"
					onClick={clearInput}
				>
					重置
				</Button>
			</div>
			<div className="w-full flex flex-1 flex-col flex-wrap space-y-2 min-h-[80%]">
				{issues.map(issue => (
					<div className="w-full p-2 m-1 border rounded-lg border-zinc-200 bg-white text-zinc-950 shadow-sm hover:bg-zinc-100 flex flex-col space-y-2">
						<div className="w-full flex flex-row justify-between items-end">
							<div className="mr-2 flex flex-row space-x-1 items-end">
								{formatIssueStatus(issue.status)}
								<span className="text-base font-semibold leading-none tracking-tight">
									{formatIssue(issue)}
								</span>
								<span className="text-base font-thin leading-none tracking-tight">
									#{issue.issue_id}
								</span>
							</div>
							<div className="text-sm font-normal text-muted-foreground">
								{issue.propose_date}
							</div>
						</div>
						<div className="w-full justify-start flex flex-row flex-wrap space-x-1 overflow-y-auto text-xs">
							{issue.tags
								?.split(",")
								.map(tag => <Badge>{tag}</Badge>)}
						</div>
					</div>
				))}
			</div>
			<div className="flex justify-start w-fit h-10">
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<Button
								variant="ghost"
								onClick={gotoPrevious}
								size="xs"
							>
								<ChevronLeft />
							</Button>
						</PaginationItem>
						<PaginationItem className="w-[100px] flex justify-center mx-0">
							第{current}页/共{total}页
						</PaginationItem>
						<PaginationItem>
							<Button
								variant="ghost"
								onClick={gotoNext}
								size="xs"
							>
								<ChevronRight />
							</Button>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	)
}

export default IssueTable
