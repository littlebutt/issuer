import Reacr from "react"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "./components/ui/table"
import { User, UserGroup } from "./types"
import {
	Pagination,
	PaginationContent,
	PaginationItem
} from "./components/ui/pagination"
import { Button } from "./components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
	Tooltip,
	TooltipProvider,
	TooltipTrigger
} from "./components/ui/tooltip"
import { TooltipContent } from "@radix-ui/react-tooltip"
import { Card, CardContent } from "./components/ui/card"
import GroupOperation from "./group-operation"
import { AvatarCircles } from "./components/ui/avatar-circle"
import { Avatar, AvatarImage } from "./components/ui/avatar"
import { formatMembers, formatOwner } from "./utils"

interface IGroupTable {
	isMine: boolean
	tableContent: UserGroup[]
	current: number
	total: number
	gotoPrevious: () => void
	gotoNext: () => void
	userOptions: { value: string; label: string }[]
	refresh: () => void
}

const GroupTable: Reacr.FC<IGroupTable> = (props: IGroupTable) => {

	return (
		<div className="w-full border rounded-lg border-zinc-200 p-2 shadow-sm">
			<div className="w-full min-h-[95%]">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[10%]">编号</TableHead>
							<TableHead className="w-1/5">名称</TableHead>
							<TableHead className="w-1/5">创建者</TableHead>
							<TableHead className="w-[30%]">成员</TableHead>
							<TableHead className="w-1/5">操作</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{props.tableContent.map((content, idx) => (
							<TableRow
								key={content.group_code}
								className="h-[10px]"
							>
								<TableCell className="font-semibold">
									#{idx + 1}
								</TableCell>
								<TableCell>{content.group_name}</TableCell>
								<TableCell>
									{formatOwner(content.owner)}
								</TableCell>
								<TableCell>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger>
												{formatMembers(content.members)}
											</TooltipTrigger>
											<TooltipContent>
												<Card className="flex items-center bg-slate-900 text-slate-200 max-w-[300px] h-[30px] mb-[-5px]">
													<CardContent className="p-1">
														{content.members
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
								<TableCell className="space-x-1">
									<GroupOperation
										isMine={props.isMine}
										content={content}
										userOptions={props.userOptions}
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

export default GroupTable
