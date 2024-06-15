import { HoverCard } from "@radix-ui/react-hover-card"
import React, { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar"
import axios from "axios"
import Cookie from "./lib/cookies"
import { User } from "./types"
import { HoverCardContent, HoverCardTrigger } from "./components/ui/hover-card"
import { Button } from "./components/ui/button"
import { useNavigate } from "react-router-dom"

const Header: React.FC = () => {
    const [userInfo, setUserInfo] = useState<User>({})

    const navigate = useNavigate()

    const fetchUser = () => {
        let cookie = Cookie().getCookie("current_user")
        if (!cookie) {
            Cookie().setCookie("current_user", "", {expires: -1})
            navigate("/login")
        }
        let user_code = cookie?.split(":")[0]
        axios({
            method: 'GET',
            url: `/users/user?user_code=${user_code}`
        }).then(res => {
            try {
                setUserInfo({
                    user_code: res.data.user_code,
                    user_name: res.data.user_name,
                    email: res.data.email,
                    role: res.data.role,
                    description: res.data?.description,
                    phone: res.data?.phone,
                    avatar: res.data?.avatar
                })
            }
            catch (err){
                Cookie().setCookie("current_user", "", {expires: -1})
                navigate("/login")
            }    
    }
        ).catch(err => {
            console.log(err)
        })
    }

    const doSignout = () => {
        Cookie().setCookie("current_user", "", {expires: -1})
        axios({
            method: 'POST',
            url: '/users/sign_out',
            data: {
                user_code: userInfo.user_code
            }
        }).catch((err) => {
            console.log(err)
        })
        navigate("/login")

    }

    useEffect(() => {
        fetchUser()
    }, [])

    return (
        <div className="w-full h-[50px] bg-zinc-950">
            <div className="w-12 float-end my-1">
                <HoverCard>
                    <HoverCardTrigger>
                        <Avatar>
                            <AvatarImage src={userInfo.avatar ? userInfo.avatar : "/statics/avatar.png"} alt="avatar"/>
                            <AvatarFallback>{userInfo.user_name}</AvatarFallback>
                        </Avatar>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-30 h-30 my-1 p-0">
                        <div className="flex flex-col items-center p-0">
                            <span className="text-sm pb-1">{userInfo.user_name ? userInfo.user_name : "unknown"}</span>
                            <Button variant="link" className="m-0">设置账户</Button>
                            <Button variant="link" className="m-0" onClick={() => doSignout()}>退出登录</Button>
                        </div>
                    </HoverCardContent>
            </HoverCard>
            </div>
        </div>
    )
}

export default Header