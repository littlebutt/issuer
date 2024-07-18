import React, { useEffect, useState } from "react"
import { useToast } from "./components/ui/use-toast"
import { Button } from "./components/ui/button"
import { UserGroup } from "./types"
import { getUserGroupsCount, getUserGroups, fetchUserOptions } from "./fetch"
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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "./components/ui/table"
import { formatMembers, formatOwner } from "./utils"
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger
} from "./components/ui/tooltip"
import { Card, CardContent } from "./components/ui/card"
import GroupOperation from "./group-operation"
import {
	Pagination,
	PaginationContent,
	PaginationItem
} from "./components/ui/pagination"
import { ChevronLeft, ChevronRight } from "lucide-react"

const Groups: React.FC = () => {
	const [tableContent, setTableContent] = useState<UserGroup[]>([])
	const [pageNum, setPageNum] = useState<number>(1)
	const [pageTotal, setPageTotal] = useState<number>(1)

	const [owner, setOwner] = useState<string>("")
	const [userOptions, setUserOptions] = useState<
		{ value: string; label: string }[]
	>([])
	const [groupName, setGroupName] = useState<string>("")
	const [members, setMembers] = useState<string>("")

	const { toast } = useToast()

	const fetchUserGroups = (
		groupName?: string,
		owner?: string,
		members?: string,
		currentPageNum?: number
	) => {
		getUserGroups(
			"",
			groupName ?? "",
			owner ?? "",
			members ?? "",
			12,
			currentPageNum ?? pageNum
		)
			.then(res => {
				if (res.status === 200 && res.data?.success === true) {
					setTableContent(res.data?.data)
				} else {
					toast({
						title: "获取我的组织失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
	}

	const fetchUserGroupCount = (
		groupName?: string,
		owner?: string,
		members?: string
	) => {
		getUserGroupsCount("", groupName ?? "", owner ?? "", members ?? "")
			.then(res => {
				if (res.status === 200 && res.data?.success === true) {
					setPageTotal(Math.ceil(res.data?.data / 12))
				} else {
					toast({
						title: "获取我的组织失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
	}

	const gotoNext = () => {
		setPageNum(pageNum => Math.min(pageNum + 1, pageTotal))
		fetchUserGroups(
			groupName,
			owner,
			members,
			Math.min(pageNum + 1, pageTotal)
		)
	}

	const gotoPrevious = () => {
		setPageNum(pageNum => Math.max(pageNum - 1, 1))
		fetchUserGroups(groupName, owner, members, Math.max(pageNum - 1, 1))
	}

	const search = () => {
		fetchUserGroups(groupName, owner, members, 1)
		fetchUserGroupCount(groupName, owner, members)
	}

	const clearInput = () => {
		setGroupName("")
		setOwner("")
		setMembers("")
	}

	const refresh = () => {
		fetchUserGroups()
		fetchUserGroupCount()
	}

	useEffect(() => {
		refresh()
		fetchUserOptions(userOptions, setUserOptions)
	}, [])

	return (
		<div>
			<div className="flex flex-col space-y-1 w-full px-5 py-0 gap-0 h-full">
				<div className="flex justify-between">
					<div className="text-2xl font-semibold leading-none tracking-tight">
						探索组织
					</div>
					<div className="flex flex-row space-x-2">
						<div className="flex flex-row space-x-0">
							<Label
								htmlFor="group-name"
								className="w-[70px] pt-1 text-base font-semibold"
							>
								名称
							</Label>
							<Input
								className="h-8"
								id="group-name"
								onChange={e => setGroupName(e.target.value)}
								value={groupName}
							></Input>
						</div>
						<div className="flex flex-row space-x-0 px-3">
							<Label
								htmlFor="owner"
								className="w-[70px] pt-1 text-base font-semibold"
							>
								创建者
							</Label>
							<Select
								onValueChange={v => setOwner(v)}
								value={owner}
							>
								<SelectTrigger className="md:w-[187px] h-8">
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
						<Button onClick={search}>搜索</Button>
						<Button variant="outline" onClick={clearInput}>
							重置
						</Button>
					</div>
				</div>
				<div className="flex justify-center h-[86vh]">
					<div className="w-full border rounded-lg border-zinc-200 p-2 shadow-sm">
						<div className="w-full min-h-[95%]">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[10%]">
											编号
										</TableHead>
										<TableHead className="w-1/5">
											名称
										</TableHead>
										<TableHead className="w-1/5">
											创建者
										</TableHead>
										<TableHead className="w-[30%]">
											成员
										</TableHead>
										<TableHead className="w-1/5">
											操作
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{tableContent.map((content, idx) => (
										<TableRow
											key={content.group_code}
											className="h-[10px]"
										>
											<TableCell className="font-semibold">
												#{idx + 1}
											</TableCell>
											<TableCell>
												{content.group_name}
											</TableCell>
											<TableCell>
												{formatOwner(content.owner)}
											</TableCell>
											<TableCell>
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger>
															{formatMembers(
																content.members
															)}
														</TooltipTrigger>
														<TooltipContent>
															<Card className="flex items-center bg-slate-900 text-slate-200 max-w-[300px] h-[30px] mb-[-5px]">
																<CardContent className="p-1">
																	{content.members
																		.map(
																			u =>
																				u.user_name
																		)
																		.join(
																			"/"
																		)}
																</CardContent>
															</Card>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</TableCell>
											<TableCell className="space-x-1">
												<GroupOperation
													isMine={false}
													content={content}
													userOptions={userOptions}
													refresh={refresh}
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

export default Groups
