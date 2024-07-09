import React, { ChangeEvent, useEffect, useState } from "react"
import { Label } from "./components/ui/label"
import { Input } from "./components/ui/input"
import { useCookie } from "./lib/cookies"
import { User, UserRole } from "./types"
import { fetchSelf, fetchUserRoles } from "./fetch"
import { useNavigate } from "react-router-dom"
import { PasswordInput } from "./components/ui/password"
import { Button } from "./components/ui/button"
import { Textarea } from "./components/ui/textarea"
import { Avatar, AvatarImage } from "./components/ui/avatar"
import axios from "axios"
import { useToast } from "./components/ui/use-toast"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "./components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { useForm } from "react-hook-form"

const Settings: React.FC = () => {
	const [userInfo, setUserInfo] = useState<User>({})
	const [repassword, setRepassword] = useState<string>("")
	const [avatarFile, setAvatarFile] = useState<File | null>(null)
	const [roles, setRoles] = useState<UserRole[]>([])

	const cookie = useCookie()
	const navigate = useNavigate()
	const { toast } = useToast()

	const {
		register,
		formState: { errors },
		handleSubmit
	} = useForm()

	const previewAvatar = (e: ChangeEvent<HTMLInputElement>) => {
		let files = e.currentTarget.files
		if (files) {
			let avatar = document.querySelector("#avatar")
			let wuc = window.URL.createObjectURL(files[0])
			setAvatarFile(files[0])
			avatar?.setAttribute("src", wuc)
		}
	}

	const uploadAvatar = () => {
		if (avatarFile === null) {
			toast({
				title: "请选择文件"
			})
			return
		}
		let data = new FormData()
		data.append("file", avatarFile as Blob)
		axios({
			method: "POST",
			url: "/users/upload_avatar",
			headers: {
				"Content-Type": "multipart/form-data"
			},
			data
		})
			.then(res => {
				if (res.status === 200 && res.data?.success === true) {
					setUserInfo({ ...userInfo, avatar: res.data.filename })
					toast({
						title: "上传成功"
					})
				} else {
					toast({
						title: "上传失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
	}

	const changeProfile = () => {
		axios({
			method: "POST",
			url: "/users/change",
			data: userInfo
		}).then(res => {
			if (res.status === 200 && res.data.success === true) {
				toast({
					title: "更新成功"
				})
			} else {
				toast({
					title: "更新失败",
					variant: "destructive"
				})
			}
		})
	}

	const resetProfile = () => {
		fetchSelf(cookie, navigate)
			.then(res => {
				if (res.status === 200) {
					setUserInfo(res.data.data)
				}
			})
			.catch(err => console.log(err))
	}

	const value2label = (value: string | undefined) => {
		if (value === undefined) {
			return undefined
		}
		let role = roles.filter(role => role.value === value)
		if (role.length > 0) {
			return role[0].label
		}
		return undefined
	}

	useEffect(() => {
		fetchSelf(cookie, navigate)
			.then(res => {
				if (res.status === 200) {
					res.data.data.passwd = ""
					setUserInfo(res.data.data)
				}
			})
			.catch(err => console.log(err))
		fetchUserRoles(roles, setRoles)
	}, [])

	return (
		<div className="flex flex-col items-center space-y-2 w-full py-0 h-[calc(100vh-55px)] overflow-y-auto">
			<form>
				<div className="w-[600px] space-y-2">
					<div className="w-full">
						<span className="text-3xl font-semibold leading-none tracking-tight">
							设置
						</span>
					</div>
					<Card className="w-full">
						<CardHeader>
							<CardTitle>头像设置</CardTitle>
						</CardHeader>

						<CardContent className="flex flex-row space-x-2 p-4">
							<Avatar className="size-12">
								<AvatarImage
									id="avatar"
									className="object-fill"
									src={
										userInfo.avatar ?? "/statics/avatar.png"
									}
								/>
							</Avatar>
							<div className="flex flex-row justify-center space-x-1">
								<Input
									className="w-1/2"
									type="file"
									accept="image/png, image/jpeg"
									onChange={e => previewAvatar(e)}
								/>
								<Button
									className="w-1/4 hover:bg-zinc-200"
									variant="outline"
									onClick={uploadAvatar}
								>
									上传
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
				<div className="w-[600px]">
					<Card className="w-full">
						<CardHeader>
							<CardTitle>基本设置</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="flex flex-row space-x-2">
								<div className="w-1/2">
									<Label htmlFor="username">用户名</Label>
									<Input
										id="username"
										value={userInfo.user_name}
										onChange={e =>
											setUserInfo({
												...userInfo,
												user_name: e.target.value
											})
										}
									/>
								</div>
								<div className="w-1/2">
									<Label htmlFor="role">角色</Label>
									<Select
										onValueChange={v =>
											setUserInfo({
												...userInfo,
												role: v
											})
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue
												placeholder={value2label(
													userInfo.role
												)}
											/>
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												{roles.map(
													role =>
														role.value !==
															"admin" && (
															<SelectItem
																value={
																	role?.value
																}
															>
																{role?.label}
															</SelectItem>
														)
												)}
											</SelectGroup>
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className="flex flex-col space-y-2">
								<Label htmlFor="email">
									邮箱
									{errors.email && (
										<span className="text-red-500">
											{" "}
											请输入正确的邮箱
										</span>
									)}
								</Label>
								<Input
									id="email"
									value={userInfo.email}
									className="w-full"
									{...register("email", {
										pattern:
											/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
									})}
									onChange={e =>
										setUserInfo({
											...userInfo,
											email: e.target.value
										})
									}
								/>
							</div>
							<div className="flex flex-col space-y-2">
								<Label htmlFor="password">
									密码
									{errors.password && (
										<span className="text-red-500">
											{" "}
											密码必须由数字字母和@、_和!组成
										</span>
									)}
								</Label>
								<PasswordInput
									id="password"
									className="w-full"
									{...register("password", {
										pattern: /^[A-Za-z0-9!@_]+$/,
										minLength: 5,
										maxLength: 18
									})}
									onChange={e =>
										setUserInfo({
											...userInfo,
											passwd: e.target.value
										})
									}
								/>
							</div>
							<div className="flex flex-col space-y-2">
								<Label htmlFor="repassword">
									重复密码
									{errors.repassword && (
										<span className="text-red-500">
											{" "}
											重复输入密码于原密码不一致
										</span>
									)}
								</Label>
								<PasswordInput
									id="repassword"
									value={repassword}
									className="w-full"
									{...register("repassword", {
										validate: value =>
											userInfo.passwd
												? value === userInfo.passwd
												: true
									})}
									onChange={e =>
										setRepassword(e.target.value)
									}
								/>
							</div>
							<div className="flex flex-col space-y-2">
								<Label htmlFor="phone">联系方式</Label>
								<Input
									id="phone"
									value={userInfo.phone}
									className="w-full"
									onChange={e =>
										setUserInfo({
											...userInfo,
											phone: e.target.value
										})
									}
								/>
							</div>
							<div className="flex flex-col space-y-2">
								<Label htmlFor="description">签名</Label>
								<Textarea
									className="h-150 min-h-[150px]"
									placeholder={userInfo.description}
									onChange={e =>
										setUserInfo({
											...userInfo,
											description: e.target.value
										})
									}
								/>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="flex flex-row space-x-2 w-[600px]">
					<Button
						className="w-1/4 mx-1 hover:bg-zinc-200"
						variant="outline"
						onClick={resetProfile}
					>
						重置
					</Button>
					<Button
						className="w-1/4"
						onClick={handleSubmit(changeProfile)}
					>
						更新
					</Button>
				</div>
			</form>
		</div>
	)
}

export default Settings
