import { HoverCard } from "@radix-ui/react-hover-card"
import React, { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar"
import axios from "axios"
import { useCookie } from "./lib/cookies"
import { User } from "./types"
import { HoverCardContent, HoverCardTrigger } from "./components/ui/hover-card"
import { Button } from "./components/ui/button"
import { useNavigate } from "react-router-dom"
import { fetchSelf } from "./fetch"
import { useToast } from "./components/ui/use-toast"

const Header: React.FC = () => {
	const [userInfo, setUserInfo] = useState<User>({})

	const navigate = useNavigate()
	const { toast } = useToast()
	const cookie = useCookie()

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
			<div className="w-12 float-end my-1">
				<HoverCard>
					<HoverCardTrigger>
						<Avatar>
							<AvatarImage
								src={userInfo.avatar ?? "/statics/avatar.png"}
								alt="avatar"
							/>
							<AvatarFallback>
								{userInfo.user_name}
							</AvatarFallback>
						</Avatar>
					</HoverCardTrigger>
					<HoverCardContent className="w-30 h-30 my-1 p-0">
						<div className="flex flex-col items-center p-0">
							<span className="text-sm pb-1">
								{userInfo.user_name ?? "unknown"}
							</span>
							<Button
								variant="link"
								className="m-0"
								onClick={() => navigate("/main/settings")}
							>
								设置账户
							</Button>
							<Button
								variant="link"
								className="m-0"
								onClick={() => doSignout()}
							>
								退出登录
							</Button>
						</div>
					</HoverCardContent>
				</HoverCard>
			</div>
		</div>
	)
}

export default Header
