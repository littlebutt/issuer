"use client"

import { cn } from "../../lib/utils"
import { Button } from "./button"
import { ScrollArea } from "./scroll-area"
import {
  Tooltip,
  TooltipTrigger,
  TooltipProvider
} from "./tooltip"
  
type Menu = {
    href: string
    label: string
    icon: any
}

type Group = {
    groupLabel: string
    menus: Menu[]
}

interface MenuProps {
    menuList: Group[]
    className: string | undefined
}

export function SideMenu({ menuList, className }: MenuProps) {

  return (
    <ScrollArea className={cn("[&>div>div[style]]:!block", className)}>
      <nav className="mt-8 h-full w-full">
        <ul className="flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-2">
          {menuList.map(({ groupLabel, menus }, index) => (
            <li className={cn("w-full", groupLabel ? "pt-5" : "")} key={index}>
              {groupLabel ? (
                <p className="text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate">
                  {groupLabel}
                </p>
              ) : (
                <p className="pb-2"></p>
              )}
              {menus.map(
                ({ href, label, icon: Icon }, index) =>
                  (
                    <div className="w-full" key={index}>
                      <TooltipProvider disableHoverableContent>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Button
                              className="w-full justify-start h-10 mb-1 hover:bg-zinc-500"
                              asChild
                            >
                              <a href={href}>
                                <span
                                  className="mr-4 text-sky-500"
                                >
                                  <Icon size={18} />
                                </span>
                                <p
                                  className="max-w-[200px] truncate translate-x-0 opacity-100"
                                >
                                  {label}
                                </p>
                              </a>
                            </Button>
                          </TooltipTrigger>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )
              )}
            </li>
          ))}
        </ul>
      </nav>
    </ScrollArea>
  );
}