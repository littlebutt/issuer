import React, { useEffect, useState } from "react"

import { Button } from "./components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { PasswordInput } from "./components/ui/password"

import './login.css'


const Login:React.FC = () => {
    const [loginMode, setLoginMode] = useState<boolean>(true)
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [repassword, setRepassword] = useState<string>("")
    const [username, setUsername] = useState<string>("")

    const [showEmailReminder, setShowEmailReminder] = useState<boolean>(false)
    const [showPasswordReminder, setShowPasswordReminder] = useState<boolean>(false)
    const [showRepasswordReminder, setShowRepasswordReminder] = useState<boolean>(false)

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
    
    return (
        <div className='page'>
            <div className='left bg-zinc-950 dark:bg-white'></div>
            <div className='right'>
                <div className='top-right'></div>
                <div className='center-right'>
                    <div className='center-right-left'></div>
                    {loginMode ? (
                        <Card className="w-[350px]">
                            <CardHeader>
                                <CardTitle>登录</CardTitle>
                            </CardHeader>
                            <CardContent>
                            <form>
                                <div className="grid w-full items-center gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="email">邮箱{showEmailReminder && <span> 请输入正确的邮箱</span>}</Label>
                                    <Input id="email" 
                                           value={email}
                                           onChange={(e) => onChangeEmail(e.target.value)}/>
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="password">密码{showPasswordReminder && <span> 密码必须由数字字母和@、_和!组成</span>}</Label>
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
                        <Button>登录</Button>
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
                                            <Label htmlFor="email">邮箱{showEmailReminder && <span>请输入正确的邮箱</span>}</Label>
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
                                    <Label htmlFor="password">密码{showPasswordReminder && <span> 密码必须由数字字母和@、_和!组成</span>}</Label>
                                    <PasswordInput
					                    id="password"
					                    value={password}
					                    onChange={(e) => onChangePassword(e.target.value)}
				                    />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="repassword">重复密码{showRepasswordReminder && <span> 重复输入密码于原密码不一致</span>}</Label>
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
                        <Button>注册</Button>
                    </CardFooter>
                  </Card>
                )}
                <div className='center-right-right'></div>
                </div>
                
                <div className='bottom-right'></div>
            </div>
        </div>
    )
}

export default Login