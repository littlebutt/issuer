import React, { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar"
import axios from "axios"
import { useCookie } from "./lib/cookies"
import { User } from "./types"
import { Button } from "./components/ui/button"
import { useNavigate } from "react-router-dom"
import { fetchSelf } from "./fetch"
import { useToast } from "./components/ui/use-toast"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "./components/ui/dropdown-menu"
import {
	LayoutGrid,
	LogOut,
	Settings,
	StickyNote,
	User as UserIcon,
	Users
} from "lucide-react"
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle
} from "./components/ui/drawer"
import { Label } from "./components/ui/label"
import { useForm } from "react-hook-form"
import { Input } from "./components/ui/input"
import { newGroupApi } from "./group-api"
import ProjectNew from "./project-new"

const Header: React.FC = () => {
	const [userInfo, setUserInfo] = useState<User>({})

	const navigate = useNavigate()
	const { toast } = useToast()
	const cookie = useCookie()
	const [groupDrawerOpen, setGroupDrawerOpen] = useState<boolean>(false)
	const [projectDrawerOpen, setProjectDrawerOpen] = useState<boolean>(false)

	const {
		register,
		formState: { errors },
		handleSubmit
	} = useForm()

	const [groupName, setGroupName] = useState<string>("")

	const newGroup = () => {
		newGroupApi(
			toast,
			() => {
				setGroupDrawerOpen(false)
			},
			groupName
		)
	}

	const doSignout = () => {
		cookie.setCookie("current_user", "", { expires: -1 })
		axios({
			method: "POST",
			url: "/users/sign_out",
			data: {
				user_code: userInfo.user_code
			}
		}).catch(err => {
			console.log(err)
		})
		navigate("/login")
	}

	useEffect(() => {
		let user_code = cookie.getCookie("current_user")
		if (typeof user_code !== "string") {
			toast({
				title: "登录过期，请重新登录"
			})
			navigate("/login")
			return
		}
		fetchSelf(cookie, navigate)
			.then(res => {
				if (res.status === 200) {
					setUserInfo(res.data.data)
				}
			})
			.catch(err => console.log(err))
	}, [])

	return (
		<div className="w-full h-[8%] bg-zinc-950 mb-2">
			<div className="w-32 float-end my-1">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<div className="flex space-x-2 justify-center items-center pt-2 pb-1">
							<Avatar className="w-8 h-8">
								<AvatarImage
									src={
										userInfo.avatar ?? "/statics/avatar.png"
									}
									alt="avatar"
								/>
								<AvatarFallback>
									{userInfo.user_name}
								</AvatarFallback>
							</Avatar>
						</div>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-24">
						<DropdownMenuLabel>我的账号</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem
								onClick={() => navigate("/main/dashboard")}
							>
								<LayoutGrid className="mr-2 h-4 w-4" />
								<span>控制台</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() =>
									navigate(`/main/user/${userInfo.user_code}`)
								}
							>
								<UserIcon className="mr-2 h-4 w-4" />
								<span>个人</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => navigate("/main/settings")}
							>
								<Settings className="mr-2 h-4 w-4" />
								<span>设置</span>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem
								onClick={() => setGroupDrawerOpen(true)}
							>
								<Users className="mr-2 h-4 w-4" />
								<span>新增组织</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => setProjectDrawerOpen(true)}
							>
								<StickyNote className="mr-2 h-4 w-4" />
								<span>新增项目</span>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => doSignout()}>
							<LogOut className="mr-2 h-4 w-4" />
							<span>退出登录</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<Drawer
				direction="right"
				open={groupDrawerOpen}
				onOpenChange={setGroupDrawerOpen}
			>
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
			</Drawer>
			<ProjectNew
				drawerOpen={projectDrawerOpen}
				setDrawerOpen={setProjectDrawerOpen}
			/>
		</div>
	)
}

export default Header
