import React, { useEffect, useState } from "react"
import { Button } from "./components/ui/button"
import GroupTable from "./group-table"
import { UserGroup } from "./types"
import axios from "axios"
import { useCookie } from "./lib/cookies"
import { useToast } from "./components/ui/use-toast"
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger
} from "./components/ui/drawer"
import { Input } from "./components/ui/input"
import { getUserGroupsCount, getUserGroups, fetchUserOptions } from "./fetch"
import { Label } from "./components/ui/label"
import { useForm } from "react-hook-form"

const MyGroup: React.FC = () => {
	const [tableContent, setTableContent] = useState<UserGroup[]>([])
	const [pageNum, setPageNum] = useState<number>(1)
	const [pageTotal, setPageTotal] = useState<number>(0)
	const [userOptions, setUserOptions] = useState<
		{ value: string; label: string }[]
	>([])
	const [groupName, setGroupName] = useState<string>("")

	const cookie = useCookie()
	const { toast } = useToast()

	const {
		register,
		formState: { errors },
		handleSubmit
	} = useForm()

	const [drawerOpen, setDrawerOpen] = useState<boolean>(false)

	const fetchUserGroups = (currentPageNum?: number) => {
		let user_code = cookie.getCookie("current_user") as string
		user_code = user_code.split(":")[0]
		getUserGroups("", "", "", user_code, 12, currentPageNum ?? pageNum)
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

	const fetchUserGroupCount = () => {
		let user_code = cookie.getCookie("current_user") as string
		user_code = user_code.split(":")[0]
		getUserGroupsCount("", "", "", user_code)
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

	const newGroup = () => {
		let members = ""
		if (groupName.trim() === "") {
			toast({
				title: "请填写组名"
			})
			return
		}
		axios({
			method: "POST",
			url: "/user_group/new",
			data: {
				group_name: groupName,
				members
			}
		})
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					toast({
						title: "新建成功",
						variant: "success"
					})
					fetchUserGroups()
					fetchUserGroupCount()
				} else {
					toast({
						title: "新建失败",
						variant: "destructive"
					})
				}
				setDrawerOpen(false)
			})
			.catch(err => console.log(err))
	}

	const gotoNext = () => {
		setPageNum(pageNum => Math.min(pageNum + 1, pageTotal))
		fetchUserGroups(Math.min(pageNum + 1, pageTotal))
	}

	const gotoPrevious = () => {
		setPageNum(pageNum => Math.max(pageNum - 1, 1))
		fetchUserGroups(Math.max(pageNum - 1, 1))
	}

	const refresh = () => {
		fetchUserGroups()
		fetchUserGroupCount()
	}

	useEffect(() => {
		fetchUserGroups()
		fetchUserGroupCount()
		fetchUserOptions(userOptions, setUserOptions)
	}, [])

	return (
		<div>
			<div className="grid grid-rows-[45px_590px] w-full px-5 py-0 gap-0 max-h-[618px]">
				<div className="flex flex-row justify-between">
					<div className="text-2xl font-semibold leading-none tracking-tight">
						我的组织
					</div>
					<Drawer
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
														setGroupName(
															e.target.value
														)
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
					</Drawer>
				</div>
				<div className="flex justify-center">
					<GroupTable
						isMine={true}
						current={pageNum}
						total={pageTotal}
						gotoNext={gotoNext}
						gotoPrevious={gotoPrevious}
						tableContent={tableContent}
						userOptions={userOptions}
						refresh={refresh}
					/>
				</div>
			</div>
		</div>
	)
}

export default MyGroup
