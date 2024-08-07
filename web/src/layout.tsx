import React from "react"
import { SideMenu } from "./components/ui/menu"

import { CircleAlert, Users, Settings, LayoutGrid, StickyNote } from "lucide-react"
import { Outlet } from "react-router-dom"
import Header from "./header"

const Layout: React.FC = () => {
	const menuList = [
		{
			groupLabel: "",
			menus: [
				{
					href: "/main/dashboard",
					label: "控制台",
					icon: LayoutGrid
				}
			]
		},
		{
			groupLabel: "我的",
			menus: [
				{
					href: "/main/my-project",
					label: "项目",
					icon: StickyNote
				},
				{
					href: "/main/my-issue",
					label: "议题",
					icon: CircleAlert
				}
			]
		},
		{
			groupLabel: "探索",
			menus: [
				{
					href: "/main/projects",
					label: "项目",
					icon: StickyNote
				},
				{
					href: "/main/groups",
					label: "组织",
					icon: Users
				}
			]
		},
		{
			groupLabel: "设置",
			menus: [
				{
					href: "/main/settings",
					label: "个人",
					icon: Users
				},
				{
					href: "",
					label: "管理员",
					icon: Settings
				}
			]
		}
	]
	return (
		<div className="grid grid-cols-[1fr_8fr] h-screen w-full">
			<SideMenu
				className="bg-zinc-950 text-white"
				menuList={menuList}
			></SideMenu>
			<div className="flex flex-col h-full">
				<Header />
				<Outlet />
			</div>
		</div>
	)
}

export default Layout
