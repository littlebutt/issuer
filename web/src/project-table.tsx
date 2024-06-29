import React from "react"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "./components/ui/table"
import { Project, User } from "./types"
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger
} from "./components/ui/tooltip"
import { Card, CardContent } from "./components/ui/card"
import { Badge } from "./components/ui/badge"
import {
	Pagination,
	PaginationContent,
	PaginationItem
} from "./components/ui/pagination"
import { Button } from "./components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface IProjectTable {
	tableContent: Project[]
	projectStatuses: { label: string; value: string }[]
	current: number
	total: number
	gotoPrevious: () => void
	gotoNext: () => void
}

const ProjectTable: React.FC<IProjectTable> = props => {
	const statusValue2label = (value: string) => {
		for (let item of props.projectStatuses) {
			if (item.value === value) {
				return item.label
			}
		}
		return "unknown"
	}

	const formatMembers = (members: User[]): string => {
		let end = Math.min(3, members.length)
		let res = ""
		for (let i = 0; i < end; i++) {
			res += members[i].user_name
			res += "/"
		}
		res = res.substring(0, res.lastIndexOf("/"))
		res += members.length > end ? `+${members.length - end}` : ""
		return res
	}

	// TODO: 表格出血
	return (
		<div className="w-full">
			<div className="w-full h-[562px]">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[5%]">编号</TableHead>
							<TableHead className="w-[10%]">名称</TableHead>
							<TableHead className="w-[10%]">创建者</TableHead>
							<TableHead className="w-[15%]">参与者</TableHead>
							<TableHead className="w-[20%]">开始时间</TableHead>
							<TableHead className="w-[20%]">完成时间</TableHead>
							<TableHead className="w-[5%]">状态</TableHead>
							<TableHead className="w-[15%]">操作</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{props.tableContent.map((content, idx) => (
							<TableRow
								key={content.project_code}
								className="h-[45px]"
							>
								<TableCell className="font-semibold">
									#{idx + 1}
								</TableCell>
								<TableCell>
									{content.project_name}
									{content.privilege === "Private" && (
										<Badge
											variant="outline"
											className="text-xs"
										>
											私有
										</Badge>
									)}
								</TableCell>
								<TableCell>
									{content.owner?.user_name}
								</TableCell>
								<TableCell>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger>
												{formatMembers(
													content.participants
												)}
											</TooltipTrigger>
											<TooltipContent className="p-0 m-0">
												<Card className="flex items-center bg-slate-900 text-slate-200 max-w-[300px] h-[30px]">
													<CardContent className="p-1">
														{content.participants
															.map(
																u => u.user_name
															)
															.join("/")}
													</CardContent>
												</Card>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</TableCell>
								<TableCell>{content.start_date}</TableCell>
								<TableCell>
									{content.end_date ?? "未设定"}
								</TableCell>
								<TableCell>
									<Badge>
										{statusValue2label(content.status)}
									</Badge>
								</TableCell>
								<TableCell></TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			<div className="flex justify-start w-fit">
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<Button onClick={props.gotoPrevious} size="sm">
								<ChevronLeft />
							</Button>
						</PaginationItem>
						<PaginationItem className="w-[100px] flex justify-center mx-0">
							第{props.current}页/共{props.total}页
						</PaginationItem>
						<PaginationItem>
							<Button onClick={props.gotoNext} size="sm">
								<ChevronRight />
							</Button>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	)
}

export default ProjectTable
