import React, { useEffect, useState } from "react"
import axios from "axios"

import { Button } from "./components/ui/button"
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle
} from "./components/ui/card"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { PasswordInput } from "./components/ui/password"
import { useToast } from "./components/ui/use-toast"
import { useNavigate } from "react-router-dom"
import { useCookie } from "./lib/cookies"
import { useForm } from "react-hook-form"

const Login: React.FC = () => {
	const [loginMode, setLoginMode] = useState<boolean>(true)
	const [email, setEmail] = useState<string>("")
	const [password, setPassword] = useState<string>("")
	const [repassword, setRepassword] = useState<string>("")
	const [username, setUsername] = useState<string>("")

	const { toast } = useToast()

	const navigate = useNavigate()

	const cookie = useCookie()

	const {
		register: registerForSignin,
		formState: { errors: errorsForSignin },
		handleSubmit: handleSubmitForSignin
	} = useForm()
	const {
		register: registerForSignup,
		formState: { errors: errorsForSignup },
		handleSubmit: handleSubmitForSignup
	} = useForm()

	const switchMode = () => {
		// FIXME: 切换登录和注册清除用户所有输入
		setLoginMode(!loginMode)
		setEmail("")
		setUsername("")
		setPassword("")
		setRepassword("")
	}

	const doSignin = () => {
		axios({
			method: "POST",
			url: "/users/sign_in",
			data: {
				email: email,
				passwd: password
			}
		})
			.then(res => {
				console.log(res.data)
				if (res.status === 200 && res.data.success === true) {
					toast({
						title: "登陆成功"
					})
					cookie.setCookie(
						"current_user",
						`${res.data.user.user_code}:${res.data.user.token}`,
						{ expires: 0.5 }
					)
					navigate("/main/dashboard")
				} else {
					toast({
						title: "登陆失败"
					})
				}
			})
			.catch(err => {
				console.log(err)
			})
	}

	const doSignup = () => {
		if (password !== repassword) {
			return
		}
		if (username.trim() === "") {
			return
		}
		axios({
			method: "POST",
			url: "/users/sign_up",
			data: {
				email: email,
				passwd: password,
				user_name: username
			}
		})
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					toast({
						title: "注册成功"
					})
					setLoginMode(true)
				} else {
					toast({
						title: "注册失败"
					})
				}
			})
			.catch(err => {
				console.log(err)
			})
	}

	const autoLogin = () => {
		let current_user = cookie.getCookie("current_user")
		if (current_user) {
			navigate("/main/dashboard")
		}
	}

	useEffect(() => {
		autoLogin()
	}, [])

	return (
		<div className="grid grid-cols-[2fr_1fr] h-screen w-full bg-zinc-100">
			<div className=" bg-zinc-950 dark:bg-white"></div>
			<div className="h-full grid place-items-center">
				{loginMode ? (
					<Card className="w-[350px]">
						<CardHeader>
							<CardTitle>登录</CardTitle>
						</CardHeader>
						<CardContent>
							<form>
								<div className="grid w-full items-center gap-4">
									<div className="flex flex-col space-y-1.5">
										<Label htmlFor="email">
											邮箱
											{errorsForSignin.email && (
												<span className="text-red-500">
													{" "}
													请输入正确的邮箱
												</span>
											)}
										</Label>
										<Input
											id="email"
											value={email}
											{...registerForSignin("email", {
												required: true,
												pattern:
													/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
											})}
											onChange={e =>
												setEmail(e.target.value)
											}
										/>
									</div>
									<div className="flex flex-col space-y-1.5">
										<Label htmlFor="password">
											密码
											{errorsForSignin.password && (
												<span className="text-red-500">
													{" "}
													密码必须5-18位且由数字字母和@、_和!组成
												</span>
											)}
										</Label>
										<PasswordInput
											id="password"
											value={password}
											{...registerForSignin("password", {
												required: true,
												pattern: /^[A-Za-z0-9!@_]+$/,
												minLength: 5,
												maxLength: 18
											})}
											onChange={e =>
												setPassword(e.target.value)
											}
										/>
									</div>
								</div>
							</form>
						</CardContent>
						<CardFooter className="flex justify-between">
							<Button variant="link" onClick={switchMode}>
								注册
							</Button>
							<Button
								onClick={handleSubmitForSignin(doSignin)}
								variant="default"
							>
								登录
							</Button>
						</CardFooter>
					</Card>
				) : (
					<Card className="w-[350px]">
						<CardHeader>
							<CardTitle>注册</CardTitle>
						</CardHeader>
						<CardContent>
							<form>
								<div className="grid w-full items-center gap-1">
									<div className="flex flex-row space-x-1.5">
										<div className="flex flex-col space-y-1.5">
											<Label htmlFor="email">
												邮箱
												{errorsForSignup.email && (
													<span className="text-red-500">
														请输入正确的邮箱
													</span>
												)}
											</Label>
											<Input
												id="email"
												value={email}
												{...registerForSignup("email", {
													required: true,
													pattern:
														/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
												})}
												onChange={e =>
													setEmail(e.target.value)
												}
											/>
										</div>
										<div className="flex flex-col space-y-1.5">
											<Label htmlFor="username">
												用户名
												{errorsForSignup.username && (
													<span className="text-red-500">
														请填写用户名(4-8个字符)
													</span>
												)}
											</Label>
											<Input
												id="username"
												value={username}
												{...registerForSignup(
													"username",
													{
														required: true,
														minLength: 4,
														maxLength: 8
													}
												)}
												onChange={e =>
													setUsername(e.target.value)
												}
											/>
										</div>
									</div>
									<div className="flex flex-col space-y-1.5">
										<Label htmlFor="password">
											密码
											{errorsForSignup.password && (
												<span className="text-red-500">
													{" "}
													密码必须5-18位且由数字字母和@、_和!组成
												</span>
											)}
										</Label>
										<PasswordInput
											id="password"
											value={password}
											{...registerForSignup("password", {
												required: true,
												pattern: /^[A-Za-z0-9!@_]+$/,
												minLength: 5,
												maxLength: 18
											})}
											onChange={e =>
												setPassword(e.target.value)
											}
										/>
									</div>
									<div className="flex flex-col space-y-1.5">
										<Label htmlFor="repassword">
											重复密码
											{errorsForSignup.repassword && (
												<span className="text-red-500">
													{" "}
													重复输入密码于原密码不一致
												</span>
											)}
										</Label>
										<PasswordInput
											id="repassword"
											value={repassword}
											{...registerForSignup(
												"repassword",
												{
													required: true,
													minLength: 5,
													maxLength: 18,
													validate: value =>
														value === password
												}
											)}
											onChange={e =>
												setRepassword(e.target.value)
											}
										/>
									</div>
								</div>
							</form>
						</CardContent>
						<CardFooter className="flex justify-between">
							<Button variant="link" onClick={switchMode}>
								已有账号，现在登录
							</Button>
							<Button
								onClick={handleSubmitForSignup(doSignup)}
								variant="default"
							>
								注册
							</Button>
						</CardFooter>
					</Card>
				)}
			</div>
		</div>
	)
}

export default Login
