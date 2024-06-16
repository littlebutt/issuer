import React, { useEffect, useState } from "react"
import { Label } from "./components/ui/label"
import { Input } from "./components/ui/input"
import useCookie from "./lib/cookies"
import { User } from "./types"
import fetchUser from "./fetch"
import { useNavigate } from "react-router-dom"
import { PasswordInput } from "./components/ui/password"
import { Button } from "./components/ui/button"
import { Textarea } from "./components/ui/textarea"
import { Avatar, AvatarImage } from "./components/ui/avatar"

const Settings: React.FC = () => {

    const [userInfo, setUserInfo] = useState<User>({})
    const [repassword, setRepassword] = useState<string>("")

    const [showEmailReminder, setShowEmailReminder] = useState<boolean>(false)
    const [showPasswordReminder, setShowPasswordReminder] = useState<boolean>(false)
    const [showRepasswordReminder, setShowRepasswordReminder] = useState<boolean>(false)

    const cookie = useCookie()
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
        setUserInfo({...userInfo, email: email})
    }

    const onChangePassword = (password: string) => {
        setShowPasswordReminder(!checkPasswordFormat(password))
        setUserInfo({...userInfo, passwd: password})
    }

    const onChangeRepassword = (repassword: string) => {
        setShowRepasswordReminder(userInfo.passwd !== repassword)
        setRepassword(repassword)
    }

    useEffect(() => {
        setUserInfo(fetchUser(cookie, navigate))
    }, [])
    
    return (
        <div>
            <div className="grid grid-rows-[repeat(6,80px)] grid-cols-2 grid-flow-col w-full px-5 py-0 gap-0">
            <div className="row-span-5 flex justify-center">
                <Avatar className="size-96 hover:[mask:url(pen.png)_0_0/350px_350px] hover:[mask-mode:luminance]">
                    <AvatarImage className="object-fill" src={userInfo.avatar ? userInfo.avatar : "/statics/avatar.png"}/>
                </Avatar>
            </div>
            <div className="col-span-2 space-y-1">
                <Label htmlFor="description">签名</Label>
                <Textarea className="h-150 min-h-[150px]" placeholder={userInfo.description} onChange={(e) => setUserInfo({...userInfo, description: e.target.value})}/>
                <div className="w-full flex justify-end">
                    <Button className="w-1/2">更新</Button>
                </div>
            </div>
            <div className="col-span-1 space-y-1">
                <Label htmlFor="username">用户名</Label>
                <Input id="username" value={userInfo.user_name} onChange={(e) => setUserInfo({...userInfo, user_name: e.target.value})}/>
            </div>
            <div className="col-span-1 space-y-1">
                <Label htmlFor="email">邮箱{showEmailReminder && <span className="text-red-500"> 请输入正确的邮箱</span>}</Label>
                <Input id="email" value={userInfo.email} onChange={(e) => onChangeEmail(e.target.value)}/>
            </div>
            <div className="col-span-1 space-y-1">
                <Label htmlFor="password">密码{showPasswordReminder && <span className="text-red-500"> 密码必须由数字字母和@、_和!组成</span>}</Label>
                <PasswordInput id="password" value={userInfo.passwd} onChange={(e) => onChangePassword(e.target.value)}/>
            </div>
            <div className="col-span-1 space-y-1">
                <Label htmlFor="repassword">重复密码{showRepasswordReminder && <span className="text-red-500"> 重复输入密码于原密码不一致</span>}</Label>
                <PasswordInput id="repassword" value={repassword} onChange={(e) => onChangeRepassword(e.target.value)}/>
            </div>
            <div className="col-span-1 space-y-1">
                <Label htmlFor="phone">联系方式</Label>
                <Input id="phone" value={userInfo.phone} onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}/>
            </div>
            </div>
        </div>
    )

}

export default Settings