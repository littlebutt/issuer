import React from "react"
import { SideMenu } from "./components/ui/menu"

import {
    Tag,
    Users,
    Settings,
    Bookmark,
    SquarePen,
    LayoutGrid
  } from "lucide-react"
import { Toaster } from "./components/ui/toaster"
import { Outlet } from "react-router-dom"


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
              href: "",
              label: "组织",
              icon: SquarePen,
            },
            {
              href: "",
              label: "项目",
              icon: Bookmark
            },
            {
              href: "",
              label: "议题",
              icon: Tag
            }
          ]
        },
        {
          groupLabel: "探索",
          menus: [
            {
              href: "",
              label: "组织",
              icon: Users
            },
            {
              href: "",
              label: "项目",
              icon: Settings
            }
          ]
        },
        {
          groupLabel: "设置",
          menus: [
            {
              href: "",
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
        <div className="grid grid-cols-[0%_1fr_5fr] h-screen w-full bg-zinc-100">
            <Toaster/>
            <SideMenu className="bg-zinc-950 text-white" menuList={menuList}></SideMenu>
            <div className="grid grid-rows-1=[1fr 9fr]">
              <div></div>
              <Outlet/>
            </div>
        </div>
    )

}

export default Layout