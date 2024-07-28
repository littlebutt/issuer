import React, { useEffect, useState } from "react"

import { Label } from "./components/ui/label"
import { useForm } from "react-hook-form"
import { newGroupApi } from "./group-api"
import { useToast } from "./components/ui/use-toast"
import { User } from "./types"
import { fetchSelf } from "./fetch"
import { useCookie } from "./lib/cookies"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "./components/ui/table"
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent
} from "./components/ui/chart"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger
} from "./components/ui/tooltip"

const Dashboard: React.FC = () => {
	const [userInfo, setUserInfo] = useState<User>({})
	// TODO: 后期清理
	const {
		register,
		formState: { errors },
		handleSubmit
	} = useForm()

	const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
	const [groupName, setGroupName] = useState<string>("")

	const { toast } = useToast()
	const cookie = useCookie()
	const navigate = useNavigate()

	const newGroup = () => {
		newGroupApi(
			toast,
			() => {
				setDrawerOpen(false)
			},
			groupName
		)
	}

	const greetings = () => {
		let now = new Date()
		if (now.getHours() < 6) {
			return `凌晨好，${userInfo.user_name}！`
		} else if (now.getHours() < 12) {
			return `上午好，${userInfo.user_name}！`
		} else if (now.getHours() < 13) {
			return `中午好，${userInfo.user_name}！`
		} else if (now.getHours() < 18) {
			return `下午好，${userInfo.user_name}！`
		} else {
			return `晚上好，${userInfo.user_name}！`
		}
	}

	const chartConfig = {
		activity: {
			label: "活动次数",
			color: "#18181b"
		}
	} satisfies ChartConfig

	const chartData = [
		{ category: "议题", activity: 20 },
		{ category: "评论", activity: 66 },
		{ category: "项目", activity: 3 },
		{ category: "组织", activity: 1 }
	]

	const formatContent = (content: string) => {
		let cellContent = content
		if (content.length > 8) {
			cellContent = content.substring(0, 6) + "..."
		}
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>{cellContent}</TooltipTrigger>
					<TooltipContent className="p-0 m-0">
						<div className=" bg-slate-900 text-slate-200 p-1 rounded-sm">
							{content}
						</div>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		)
	}

	useEffect(() => {
		fetchSelf(cookie, navigate)
			.then(res => {
				if (res.status === 200) {
					setUserInfo(res.data.data)
				}
			})
			.catch(err => console.log(err))
	}, [])

	return (
		<div className="flex flex-col space-y-1 w-full px-5 py-0 gap-0 h-full">
			<div className="flex flex-row justify-between h-[6%]">
				<div className="text-3xl font-semibold leading-none tracking-tight">
					{greetings()}
				</div>
			</div>
			<div className="flex h-[92%] flex-col space-y-3">
				<div className="flex flex-row justify-around space-x-1 space-y-1">
					<Card className="w-[24%]">
						<CardHeader>
							<CardTitle>议题</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col">
							<div className="flex flex-row justify-between">
								<Label className="text-sm font-normal text-muted-foreground">
									开放
								</Label>
								<div className="text-base font-medium">1</div>
							</div>
							<div className="flex flex-row justify-between">
								<Label className="text-sm font-normal text-muted-foreground">
									完成
								</Label>
								<div className="text-base font-medium">2</div>
							</div>
							<div className="flex flex-row justify-between">
								<Label className="text-sm font-normal text-muted-foreground">
									关闭
								</Label>
								<div className="text-base font-medium">1</div>
							</div>
						</CardContent>
					</Card>
					<Card className="w-[24%]">
						<CardHeader>
							<CardTitle>项目</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col">
							<div className="flex flex-row justify-between">
								<Label className="text-sm font-normal text-muted-foreground">
									开始
								</Label>
								<div className="text-base font-medium">1</div>
							</div>
							<div className="flex flex-row justify-between">
								<Label className="text-sm font-normal text-muted-foreground">
									进行
								</Label>
								<div className="text-base font-medium">2</div>
							</div>
							<div className="flex flex-row justify-between">
								<Label className="text-sm font-normal text-muted-foreground">
									验收
								</Label>
								<div className="text-base font-medium">1</div>
							</div>
							<div className="flex flex-row justify-between">
								<Label className="text-sm font-normal text-muted-foreground">
									完工
								</Label>
								<div className="text-base font-medium">1</div>
							</div>
						</CardContent>
					</Card>
					<Card className="w-[24%]">
						<CardHeader>
							<CardTitle>评论</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col">
							<div className="flex flex-row justify-between">
								<Label className="text-sm font-normal text-muted-foreground">
									发表
								</Label>
								<div className="text-base font-medium">1</div>
							</div>
						</CardContent>
					</Card>
					<Card className="w-[24%]">
						<CardHeader>
							<CardTitle>组织</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col">
							<div className="flex flex-row justify-between">
								<Label className="text-sm font-normal text-muted-foreground">
									参与
								</Label>
								<div className="text-base font-medium">1</div>
							</div>
						</CardContent>
					</Card>
				</div>
				<div className="flex flex-row">
					<div className="w-2/3 p-1">
						<div className="w-full flex flex-col space-y-1 border rounded-lg border-zinc-200 p-2 shadow-sm">
							<div className="flex flex-row justify-start">
								<div className="text-2xl font-semibold leading-none tracking-tight">
									我的关注
								</div>
							</div>
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
											类型
										</TableHead>
										<TableHead className="w-[30%]">
											内容
										</TableHead>
										<TableHead className="w-1/5">
											时间
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									<TableRow>
										<TableCell>#1</TableCell>
										<TableCell>测试</TableCell>
										<TableCell>项目</TableCell>
										<TableCell>
											{formatContent(
												"项目测试进入验收阶段"
											)}
										</TableCell>
										<TableCell>2024-07-28 8:00</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</div>
					</div>
					<div className="w-1/3 p-1">
						<Card>
							<CardHeader>
								<CardTitle>活动</CardTitle>
							</CardHeader>
							<CardContent className="pb-0">
								<ChartContainer
									config={chartConfig}
									className="mx-auto aspect-square max-h-[250px]"
								>
									<RadarChart data={chartData}>
										<ChartTooltip
											cursor={false}
											content={<ChartTooltipContent />}
										/>
										<PolarAngleAxis dataKey="category" />
										<PolarGrid />
										<Radar
											dataKey="activity"
											fill="#18181b"
											fillOpacity={0.6}
										/>
									</RadarChart>
								</ChartContainer>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
			{/* <Drawer
				direction="right"
				open={drawerOpen}
				onOpenChange={setDrawerOpen}
			>
				<DrawerTrigger asChild>
					<Button className="">新增</Button>
				</DrawerTrigger>
				<DrawerContent>
					<div className="my-auto h-full w-full">
						<DrawerHeader>
							<DrawerTitle>新增组织</DrawerTitle>
						</DrawerHeader>
						<div className="p-4 pb-0 w-full">
							<form>
								<div className="mt-3 h-[520px] flex flex-col space-y-2">
									<div className="flex flex-col space-y-1">
										<Label htmlFor="groupName">
											名称
											{errors.groupName && (
												<span className="text-red-500">
													{" "}
													请填写名称
												</span>
											)}
										</Label>
										<Input
											id="groupname"
											{...register("groupName", {
												required: true
											})}
											onChange={e =>
												setGroupName(e.target.value)
											}
										/>
									</div>
								</div>
							</form>
						</div>
						<DrawerFooter>
							<Button onClick={handleSubmit(newGroup)}>
								确定
							</Button>
							<DrawerClose asChild>
								<Button variant="outline">取消</Button>
							</DrawerClose>
						</DrawerFooter>
					</div>
				</DrawerContent>
			</Drawer> */}
		</div>
	)
}

export default Dashboard
