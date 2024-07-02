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

interface IGroupTable {
	isMine: boolean
	tableContent: UserGroup[]
	current: number
	total: number
	gotoPrevious: () => void
	gotoNext: () => void
	userOptions: { value: string; label: string }[]
	deleteGroup: (groupCode: string) => void
	updateGroup: (
		groupCode: string,
		groupName: string,
		owner: string,
		members: string
	) => void
	addGroup?: (userCode: string, groupCode: string) => void
}

const GroupTable: Reacr.FC<IGroupTable> = (props: IGroupTable) => {
	const formatMembers = (members: User[]): string => {
		let end = Math.min(5, members.length)
		let res = ""
		for (let i = 0; i < end; i++) {
			res += members[i].user_name
			res += "/"
		}
		res = res.substring(0, res.lastIndexOf("/"))
		res += members.length > end ? `+${members.length - end}` : ""
		return res
	}

	return (
		<div className="w-full">
			<div className="w-full h-[562px]">
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
									{content.owner?.user_name}
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
										addGroup={props.addGroup}
										userOptions={props.userOptions}
										updateGroup={props.updateGroup}
										deleteGroup={props.deleteGroup}
									/>
								</TableCell>
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

export default GroupTable
