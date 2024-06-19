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
              href: "/main/my-group",
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
        <div className="grid grid-cols-[1fr_5fr] h-screen w-full bg-zinc-100">
            <SideMenu className="bg-zinc-950 text-white" menuList={menuList}></SideMenu>
            <div className="grid grid-rows-[1fr_9fr]">
              <Header/>
              <Outlet/>
            </div>
        </div>
    )

}

export default Layout