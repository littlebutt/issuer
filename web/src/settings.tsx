import React, { ChangeEvent, useEffect, useState } from "react"
import { Label } from "./components/ui/label"
import { Input } from "./components/ui/input"
import { useCookie } from "./lib/cookies"
import { User, UserRole } from "./types"
import { fetchSelf } from "./fetch"
import { useNavigate } from "react-router-dom"
import { PasswordInput } from "./components/ui/password"
import { Button } from "./components/ui/button"
import { Textarea } from "./components/ui/textarea"
import { Avatar, AvatarImage } from "./components/ui/avatar"
import axios from "axios"
import { useToast } from "./components/ui/use-toast"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"

const Settings: React.FC = () => {

    const [userInfo, setUserInfo] = useState<User>({})
    const [repassword, setRepassword] = useState<string>("")
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [roles, setRoles] = useState<UserRole[]>([])

    const [showEmailReminder, setShowEmailReminder] = useState<boolean>(false)
    const [showPasswordReminder, setShowPasswordReminder] = useState<boolean>(false)
    const [showRepasswordReminder, setShowRepasswordReminder] = useState<boolean>(false)

    const cookie = useCookie()
    const navigate = useNavigate()
    const { toast } = useToast()

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
            method: 'POST',
            url: "/users/upload_avatar",
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            data
        }).then(res => {
            if (res.status === 200 && res.data?.success === true) {
                setUserInfo({...userInfo, avatar: res.data.filename})
                toast({
                    title: "上传成功"
                })
            } else {
                toast({
                    title: "上传失败",
                    variant: "destructive"
                })
            }
        }).catch(err => console.log(err))

    }

    const changeProfile = () => {
        axios({
            method: 'POST',
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
        }).catch(err => console.log(err))
    }

    const fetchRoles = () => {
        axios({
            method: 'GET',
            url: "/users/roles"
        }).then(res => {
            if (res.status === 200 && res.data.success === true) {
                setRoles(res.data.data)
            } else {
                toast({
                    title: "获取角色失败",
                    variant: "destructive"
                })
            }
        }).catch(err => console.log(err))
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
                setUserInfo(res.data.data)
            }
        }).catch(err => console.log(err))
        fetchRoles()
    }, [])
    
    return (
        <div>
            <div className="grid grid-rows-[repeat(6,80px)] grid-cols-2 grid-flow-col w-full px-5 py-0 gap-0">
            <div className="row-span-5 flex justify-center min-w-[400px]">
                <Avatar className="size-96">
                    <AvatarImage id="avatar" className="object-fill" src={userInfo.avatar ? userInfo.avatar : "/statics/avatar.png"}/>
                </Avatar>
            </div>
            <div className="row-span-1 flex justify-center space-x-2">
                <Input className="w-1/2" type="file" accept="image/png, image/jpeg" onChange={e => previewAvatar(e)}/>
                <Button className="w-1/4 hover:bg-zinc-200" variant="outline" onClick={uploadAvatar}>上传</Button>
            </div>
            <div className="col-span-1 space-y-1 flex justify-center space-x-1">
                <div className="w-1/2">
                    <Label htmlFor="username">用户名</Label>
                    <Input id="username" value={userInfo.user_name} onChange={(e) => setUserInfo({...userInfo, user_name: e.target.value})}/>
                </div>
                <div className="w-1/2">
                    <Label htmlFor="role">角色</Label>
                    <Select onValueChange={(v) => setUserInfo({...userInfo, role: v})}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={value2label(userInfo.role)}/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {roles.map(role => role.value !== 'admin' && (
                                    <SelectItem value={role?.value}>{role?.label}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
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
            <div className="col-span-2 space-y-1">
                <Label htmlFor="description">签名</Label>
                <Textarea className="h-150 min-h-[150px]" placeholder={userInfo.description} onChange={(e) => setUserInfo({...userInfo, description: e.target.value})}/>
                <div className="w-full flex justify-end py-2">
                    <Button className="w-1/2 mx-1 hover:bg-zinc-200" variant="outline" onClick={resetProfile}>重置</Button><Button className="w-1/2" onClick={changeProfile}>更新</Button>
                </div>
            </div>
            </div>
        </div>
    )

}

export default Settings