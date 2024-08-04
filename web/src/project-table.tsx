import React from "react"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "./components/ui/table"
import { Project } from "./types"
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
import ProjectOperation from "./project-operation"
import {
	formatMembers,
	formatOwner,
	formatProject,
	statusValue2label
} from "./utils"

interface IProjectTable {
	isMine: boolean
	tableContent: Project[]
	projectStatuses: { label: string; value: string }[]
	current: number
	total: number
	gotoPrevious: () => void
	gotoNext: () => void
	userOptions: { value: string; label: string }[]
	projectPrivileges: { value: string; label: string }[]
	refresh: () => void
}

const ProjectTable: React.FC<IProjectTable> = props => {
	return (
		<div className="w-full h-full p-2 shadow-sm">
			<div className="w-full min-h-[95%]">
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
								className="h-[42px]"
							>
								<TableCell className="font-semibold">
									#{idx + 1}
								</TableCell>
								<TableCell>
									{formatProject(content)}

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
									{formatOwner(content.owner)}
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
									{statusValue2label(
										content.status,
										props.projectStatuses
									)}
								</TableCell>
								<TableCell>
									<ProjectOperation
										isMine={props.isMine}
										content={content}
										userOptions={props.userOptions}
										projectStatuses={props.projectStatuses}
										projectPrivileges={
											props.projectPrivileges
										}
										refresh={props.refresh}
									/>
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
								onClick={props.gotoPrevious}
								size="xs"
							>
								<ChevronLeft />
							</Button>
						</PaginationItem>
						<PaginationItem className="w-[100px] flex justify-center mx-0">
							第{props.current}页/共{props.total}页
						</PaginationItem>
						<PaginationItem>
							<Button
								variant="ghost"
								onClick={props.gotoNext}
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

export default ProjectTable
