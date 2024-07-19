import React, { useEffect, useState } from "react"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "./components/ui/table"
import {
	Pagination,
	PaginationContent,
	PaginationItem
} from "./components/ui/pagination"
import { Button } from "./components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Issue } from "./types"
import { Badge } from "./components/ui/badge"
import { useCookie } from "./lib/cookies"
import { getIssues, getIssuesCount } from "./fetch"
import { toast } from "./components/ui/use-toast"
import { formatIssue, formatProject } from "./utils"

const MyIssue: React.FC = () => {
	const [tableContent, setTableContent] = useState<Issue[]>([])
	const [pageNum, setPageNum] = useState<number>(1)
	const [pageTotal, setPageTotal] = useState<number>(1)

	const cookie = useCookie()

	const formatIssueStatus = (issueStatus: string) => {
		let badge = <Badge></Badge>
		if (issueStatus === "open") {
			badge.props.children = "开放"
			badge.props.variant = "success"
		} else if (issueStatus === "finished") {
			badge.props.children = "完成"
			badge.props.variant = "gray"
		} else if (issueStatus === "closed") {
			badge.props.children = "关闭"
			badge.props.variant = "destructive"
		} else {
			badge.props.children = issueStatus
		}
		return badge
	}

	const fetchIssues = (currentPageNum?: number) => {
		let user_code = cookie.getCookie("current_user") as string
		user_code = user_code.split(":")[0]
		getIssues(
			"",
			"",
			"",
			"",
			"",
			user_code,
			"",
			"",
			"",
			"",
			"",
			currentPageNum ?? pageNum,
			12
		)
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					setTableContent(res.data.data)
				} else {
					toast({
						title: "获取议题列表失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
	}

	const fetchIssuesCount = () => {
		let user_code = cookie.getCookie("current_user") as string
		user_code = user_code.split(":")[0]
		getIssuesCount("", "", "", "", "", user_code, "", "", "", "", "")
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					setPageTotal(Math.ceil(res.data.data / 12))
				} else {
					toast({
						title: "获取议题列表数量失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
	}

	const refresh = () => {
		fetchIssues()
		fetchIssuesCount()
	}

	const gotoPrevious = () => {
		setPageNum(pageNum => Math.max(pageNum - 1, 1))
		fetchIssues(Math.max(pageNum - 1, 1))
	}

	const gotoNext = () => {
		setPageNum(pageNum => Math.min(pageNum + 1, pageTotal))
		fetchIssues(Math.min(pageNum + 1, pageTotal))
	}

	useEffect(() => {
		refresh()
	}, [])

	return (
		<div>
			<div className="flex flex-col space-y-1 w-full px-5 py-0 gap-0 h-full">
				<div className="flex flex-row justify-between">
					<div className="text-2xl font-semibold leading-none tracking-tight">
						我的议题
					</div>
				</div>
				<div className="flex justify-center h-[86vh]">
					<div className="w-full border rounded-lg border-zinc-200 p-2 shadow-sm">
						<div className="w-full min-h-[95%]">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-1/10">
											编号
										</TableHead>
										<TableHead className="w-1/5">
											标题
										</TableHead>
										<TableHead className="w-1/5">
											项目
										</TableHead>
										<TableHead className="w-1/5">
											提出日期
										</TableHead>
										<TableHead className="w-1/5">
											标签
										</TableHead>
										<TableHead className="w-1/10">
											状态
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{tableContent.map((content, idx) => (
										<TableRow
											key={content.issue_code}
											className="h-[45px]"
										>
											<TableCell className="font-semibold">
												#{idx + 1}
											</TableCell>
											<TableCell className="overflow-hidden">
												{formatIssue(content)}
											</TableCell>
											<TableCell>
												{formatProject(content.project)}
											</TableCell>
											<TableCell>
												{content.propose_date}
											</TableCell>
											<TableCell className="space-x-1 w-full justify-start flex flex-row flex-wrap overflow-y-auto text-xs mt-2">
												{content.tags
													?.split(",")
													.map(tag => (
														<Badge>{tag}</Badge>
													))}
											</TableCell>
											<TableCell>
												{formatIssueStatus(
													content.status
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
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
										第{pageNum}页/共{pageTotal}页
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
				</div>
			</div>
		</div>
	)
}

export default MyIssue
