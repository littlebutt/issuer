import React, { useEffect, useState } from "react"
import axios from 'axios'

import { Button } from "./components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { PasswordInput } from "./components/ui/password"
import { useToast } from "./components/ui/use-toast"
import { Toaster } from "./components/ui/toaster"
import { useNavigate } from "react-router-dom"
import Cookie from "./lib/cookies"



const Login:React.FC = () => {
    const [loginMode, setLoginMode] = useState<boolean>(true)
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [repassword, setRepassword] = useState<string>("")
    const [username, setUsername] = useState<string>("")

    const [showEmailReminder, setShowEmailReminder] = useState<boolean>(false)
    const [showPasswordReminder, setShowPasswordReminder] = useState<boolean>(false)
    const [showRepasswordReminder, setShowRepasswordReminder] = useState<boolean>(false)

    const { toast } = useToast()

    const navigate = useNavigate()

    const checkEmailFormat = (email: string) => {
        let reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
        return reg.test(email)
    }

    const checkPasswordFormat = (password: string) => {
        let reg = /^[A-Za-z0-9!@_]+$/
        return reg.test(password)
    }

    const onChangeEmail = (email: string) => {
        setShowEmailReminder(!checkEmailFormat(email))
        setEmail(email)
    }

    const onChangePassword = (password: string) => {
        setShowPasswordReminder(!checkPasswordFormat(password))
        setPassword(password)
    }

    const onChangeRepassword = (repassword: string) => {
        setShowRepasswordReminder(password !== repassword)
        setRepassword(repassword)
    }

    const doSignin = () => {
        if (!checkEmailFormat(email)) {
            return
        }
        if (!checkPasswordFormat(password)) {
            return
        }
        axios({
            method: 'POST',
            url: '/users/sign_in',
            data: {
                email: email,
                passwd: password
            }
        }).then((res) => {
            console.log(res.data)
            if (res.status === 200 && res.data.success === true) {
                toast({
                    title: "登陆成功"
                })
                Cookie().setCookie("current_user", `${res.data.user.user_code}:${res.data.user.token}`, {expires: 0.5})
                navigate("/main/dashboard")
            } else {
                toast({
                    title: "登陆失败"
                })
            }
        }).catch((err) => {
            console.log(err)
        })
    }

    const doSignup = () => {
        if (!checkEmailFormat(email)) {
            return
        }
        if (!checkPasswordFormat(password)) {
            return
        }
        if (password !== repassword) {
            return
        }
        if (username.trim() === "") {
            return
        }
        axios({
            method: 'POST',
            url: '/users/sign_up',
            data: {
                email: email,
                passwd: password,
                user_name: username,
            }
        }).then((res) => {
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
        }).catch((err) => {
            console.log(err)
        })
    }

    const autoLogin = () => {
        let cookie = Cookie().getCookie("current_user")
        if (cookie) {
            navigate("/main/dashboard")
        }
    }

    useEffect(() => {
        autoLogin()
    },[])
    
    return (
        <div className="grid grid-cols-[0%_2fr_1fr] h-screen w-full bg-zinc-100">
            <Toaster />
            <div className=" bg-zinc-950 dark:bg-white"></div>
            <div className='h-full grid place-items-center'>
                    {loginMode ? (
                        <Card className="w-[350px]">
                            <CardHeader>
                                <CardTitle>登录</CardTitle>
                            </CardHeader>
                            <CardContent>
                            <form>
                                <div className="grid w-full items-center gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="email">邮箱{showEmailReminder && <span className="text-red-500"> 请输入正确的邮箱</span>}</Label>
                                    <Input id="email" 
                                           value={email}
                                           onChange={(e) => onChangeEmail(e.target.value)}/>
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="password">密码{showPasswordReminder && <span className="text-red-500"> 密码必须由数字字母和@、_和!组成</span>}</Label>
                                    <PasswordInput
					                    id="password"
					                    value={password}
					                    onChange={(e) => onChangePassword(e.target.value)}
				                    />
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="link" onClick={() => {setLoginMode(false)}}>注册</Button>
                        <Button onClick={doSignin} variant="default">登录</Button>
                    </CardFooter>
                  </Card>
                ):(
                    <Card className="w-[350px]">
                            <CardHeader>
                                <CardTitle>注册</CardTitle>
                            </CardHeader>
                            <CardContent>
                            <form>
                                <div className="grid w-full items-center gap-1">
                                    <div className="flex flex-row space-x-1.5">
                                        <div className="flex flex-col space-y-1.5">
                                            <Label htmlFor="email">邮箱{showEmailReminder && <span className="text-red-500">请输入正确的邮箱</span>}</Label>
                                            <Input  id="email" 
                                                    value={email}
                                                    onChange={(e) => onChangeEmail(e.target.value)}/>
                                        </div>
                                        <div className="flex flex-col space-y-1.5">
                                            <Label htmlFor="username">用户名</Label>
                                            <Input  id="username"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}/>
                                        </div>
                                    </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="password">密码{showPasswordReminder && <span className="text-red-500"> 密码必须由数字字母和@、_和!组成</span>}</Label>
                                    <PasswordInput
					                    id="password"
					                    value={password}
					                    onChange={(e) => onChangePassword(e.target.value)}
				                    />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="repassword">重复密码{showRepasswordReminder && <span className="text-red-500"> 重复输入密码于原密码不一致</span>}</Label>
                                    <PasswordInput
					                    id="repassword"
					                    value={repassword}
					                    onChange={(e) => onChangeRepassword(e.target.value)}
				                    />
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="link" onClick={() => setLoginMode(true)}>已有账号，现在登录</Button>
                        <Button onClick={doSignup} variant="default">注册</Button>
                    </CardFooter>
                  </Card>
                )}
            </div>
        </div>
    )
}

export default Login