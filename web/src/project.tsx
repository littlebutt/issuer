import React, { useCallback, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { Project as ProjectType, User } from "./types"
import {
	fetchIssueStatuses,
	fetchProjectStatuses,
	getProjectDailyStat,
	getProjectStatusStat,
	getProjects
} from "./fetch"
import { useToast } from "./components/ui/use-toast"
import { formatMembers, formatOwner, statusValue2label } from "./utils"
import { Badge } from "./components/ui/badge"
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger
} from "./components/ui/collapsible"
import { Label } from "./components/ui/label"
import { Button } from "./components/ui/button"
import { ChevronsUpDown } from "lucide-react"
import IssuePanel from "./issue-panel"
import { Calendar } from "./components/ui/calendar"
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from "./components/ui/popover"
import { cn } from "./lib/utils"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent
} from "./components/ui/chart"
import {
	Bar,
	BarChart,
	XAxis,
	Label as ChartLabel,
	Pie,
	PieChart
} from "recharts"

const Project: React.FC = () => {
	const { projectCode } = useParams()

	const [project, setProject] = useState<ProjectType>()
	const [projectStatuses, setProjectStatuses] = useState<
		{ label: string; value: string }[]
	>([])
	const [issueStatuses, setIssueStatuses] = useState<
		{ label: string; value: string }[]
	>([])
	const [isStatsOpen, setIsStatsOpen] = useState<boolean>(true)
	const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false)

	const [statDate, setStatDate] = React.useState<DateRange | undefined>({
		from: new Date(new Date().setDate(new Date().getDate() - 7)),
		to: new Date()
	})

	const { toast } = useToast()

	const dailyChartConfig = {
		value: {
			label: "日期",
			color: "#18181b"
		}
	} satisfies ChartConfig

	let statusChartConfig: any = {
		value: {
			label: "状态"
		}
	} satisfies ChartConfig

	const initStatusChartConfig = () => {
		projectStatuses.forEach(
			v => (statusChartConfig[v.value] = { label: v.label })
		)
	}

	const [dailyChartData, setDailyChartData] = useState<
		{ date: string; value: number }[]
	>([])
	const [statusChartData, setStatusChartData] = useState<
		{ status: string; value: Number; fill: string }[]
	>([])
	const [chartTotal, setChartTotal] = useState<number>(0)

	const refreshChartData = useCallback(() => {
		getProjectDailyStat(
			projectCode as string,
			format(statDate?.from as Date, "yyyy-MM-dd"),
			format(statDate?.to as Date, "yyyy-MM-dd")
		)
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					let stat: { date: string; value: number }[] = []
					Object.keys(res.data.data).forEach(k =>
						stat.push({ date: k, value: res.data.data[k] })
					)
					setDailyChartData(stat)
				} else {
					toast({
						title: "获取每日议题统计数据失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
		getProjectStatusStat(
			projectCode as string,
			format(statDate?.from as Date, "yyyy-MM-dd"),
			format(statDate?.to as Date, "yyyy-MM-dd")
		)
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					let stat: {
						status: string
						value: number
						fill: string
					}[] = []
					// XXX: 整理value-label转换逻辑
					Object.keys(res.data.data).forEach(k =>
						stat.push({
							status: statusValue2label(k, issueStatuses).props
								.children,
							value: res.data.data[k],
							fill: "#18181b"
						})
					)
					setStatusChartData(stat)
					let total = Object.values(res.data.data).reduce(
						(p: any, c: any) => p + c,
						0
					)
					setChartTotal(total as number)
				} else {
					toast({
						title: "获取议题状态统计数据失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
	}, [statDate])

	useEffect(() => {
		initStatusChartConfig()
	}, [projectStatuses])

	useEffect(() => {
		getProjects(projectCode as string, "", "", "", "", "", "")
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					setProject(res.data.data[0])
				} else {
					toast({
						title: "获取项目失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
		fetchProjectStatuses(projectStatuses, setProjectStatuses)
		fetchIssueStatuses(issueStatuses, setIssueStatuses)
		refreshChartData()
	}, [])
	return (
		<div>
			<div className="w-full flex flex-row space-x-2 h-full p-1">
				<Card className="w-1/3">
					<CardHeader className="px-6 py-3">
						<CardTitle className="flex flex-row space-x-3 items-end">
							<span className="text-3xl font-semibold leading-none tracking-tight">
								{project?.project_name}
							</span>
							<span className="text-base font-thin tracking-tight align-text-bottom">
								{project?.project_code}
							</span>
							{project?.privilege === "Private" && (
								<Badge variant="outline" className="text-sm">
									私有
								</Badge>
							)}
						</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col space-y-3 p-9">
						<div className="flex flex-col space-y-2">
							<div className="flex flex-row justify-between">
								<Label className="text-base font-medium">
									状态
								</Label>
								<div className="text-sm font-normal text-muted-foreground">
									{statusValue2label(
										project?.status as string,
										projectStatuses
									)}
								</div>
							</div>
							<div className="flex flex-row justify-between">
								<Label className="text-base font-medium">
									创建者
								</Label>
								<div className="text-sm font-normal text-muted-foreground">
									{formatOwner(project?.owner as User)}
								</div>
							</div>
							<div className="flex flex-row justify-between">
								<Label className="text-base font-medium">
									成员
								</Label>
								<div className="text-sm font-normal text-muted-foreground">
									{formatMembers(
										project?.participants as User[]
									)}
								</div>
							</div>
							<div className="flex flex-row justify-between">
								<Label className="text-base font-medium">
									开始日期
								</Label>
								<div className="text-sm font-normal text-muted-foreground">
									{project?.start_date}
								</div>
							</div>
							<div className="flex flex-row justify-between">
								<Label className="text-base font-medium">
									结束日期
								</Label>
								<div className="text-sm font-normal text-muted-foreground">
									{project?.end_date ?? "未设定"}
								</div>
							</div>
							<div className="flex flex-row justify-between overflow-y-auto max-h-[200px]">
								<Label className="text-base font-medium">
									项目描述
								</Label>
								<div className="text-sm font-normal text-muted-foreground">
									{project?.description}
								</div>
							</div>
						</div>
						<div>
							<Collapsible
								open={isStatsOpen}
								onOpenChange={setIsStatsOpen}
								className="w-full space-y-2"
							>
								<div className="flex items-center justify-between space-x-4">
									<div className="text-base font-medium">
										统计
									</div>
									<CollapsibleTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											className="w-9 p-0"
										>
											<ChevronsUpDown className="h-4 w-4" />
											<span className="sr-only">
												Toggle
											</span>
										</Button>
									</CollapsibleTrigger>
								</div>
								<CollapsibleContent className="space-y-2">
									<div className="text-sm text-muted-foreground flex flex-col items-start space-y-1">
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant={"outline"}
													className={cn(
														"w-[180px] h-9 px-1 py-1 justify-start text-left text-sm font-normal",
														!statDate &&
															"text-muted-foreground"
													)}
												>
													{statDate?.from ? (
														statDate.to ? (
															<>
																{format(
																	statDate.from,
																	"yyyy-MM-dd"
																)}{" "}
																-{" "}
																{format(
																	statDate.to,
																	"yyyy-MM-dd"
																)}
															</>
														) : (
															format(
																statDate.from,
																"yyyy-MM-dd"
															)
														)
													) : (
														<span>选择日期</span>
													)}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0">
												<Calendar
													mode="range"
													defaultMonth={
														statDate?.from
													}
													selected={statDate}
													onSelect={setStatDate}
													initialFocus
													numberOfMonths={2}
													onDayBlur={refreshChartData}
												/>
											</PopoverContent>
										</Popover>
									</div>
									<div>
										<ChartContainer
											config={dailyChartConfig}
											className="min-h-[200px] w-full"
										>
											<BarChart
												accessibilityLayer
												data={dailyChartData}
											>
												<XAxis
													dataKey="date"
													tickLine={false}
													tickMargin={10}
													axisLine={false}
													tickFormatter={value =>
														value.substring(5)
													}
												/>
												<ChartTooltip
													content={
														<ChartTooltipContent />
													}
												/>
												<Bar
													dataKey="value"
													fill="var(--color-value)"
													radius={4}
												/>
											</BarChart>
										</ChartContainer>
									</div>
									<div>
										<ChartContainer
											config={statusChartConfig}
											className="min-h-[200px] w-full"
										>
											<PieChart>
												<ChartTooltip
													cursor={false}
													content={
														<ChartTooltipContent
															hideLabel
														/>
													}
												/>
												<Pie
													data={statusChartData}
													dataKey="value"
													nameKey="status"
													innerRadius={50}
													strokeWidth={5}
													paddingAngle={5}
												>
													<ChartLabel
														content={({
															viewBox
														}) => {
															if (
																viewBox &&
																"cx" in
																	viewBox &&
																"cy" in viewBox
															) {
																return (
																	<text
																		x={
																			viewBox.cx
																		}
																		y={
																			viewBox.cy
																		}
																		textAnchor="middle"
																		dominantBaseline="middle"
																	>
																		<tspan
																			x={
																				viewBox.cx
																			}
																			y={
																				viewBox.cy
																			}
																			className="fill-foreground text-3xl font-bold"
																		>
																			{
																				chartTotal
																			}
																		</tspan>
																		<tspan
																			x={
																				viewBox.cx
																			}
																			y={
																				(viewBox.cy ||
																					0) +
																				24
																			}
																			className="fill-muted-foreground"
																		>
																			议题总数
																		</tspan>
																	</text>
																)
															}
														}}
													/>
												</Pie>
											</PieChart>
										</ChartContainer>
									</div>
								</CollapsibleContent>
							</Collapsible>
						</div>
						<div>
							<Collapsible
								open={isAdvancedOpen}
								onOpenChange={setIsAdvancedOpen}
								className="w-full space-y-2"
							>
								<div className="flex items-center justify-between space-x-4">
									<div className="text-base font-medium">
										高级
										{/* TODO: 修改高级 */}
									</div>
									<CollapsibleTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											className="w-9 p-0"
										>
											<ChevronsUpDown className="h-4 w-4" />
											<span className="sr-only">
												Toggle
											</span>
										</Button>
									</CollapsibleTrigger>
								</div>
								<CollapsibleContent className="space-y-2">
									<div className="rounded-md border px-4 py-3 font-mono text-sm">
										@radix-ui/colors
									</div>
									<div className="rounded-md border px-4 py-3 font-mono text-sm">
										@stitches/react
									</div>
								</CollapsibleContent>
							</Collapsible>
						</div>
					</CardContent>
				</Card>
				<div className="w-2/3">
					<IssuePanel projectCode={projectCode as string} />
				</div>
			</div>
		</div>
	)
}

export default Project
