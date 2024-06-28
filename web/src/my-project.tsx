import React, { useEffect, useState } from "react"
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "./components/ui/drawer"
import { Button } from "./components/ui/button"
import { Label } from "./components/ui/label"
import { Input } from "./components/ui/input"
import { Project, User } from "./types"
import { fetchSelf } from "./fetch"
import { useCookie } from "./lib/cookies"
import { useToast } from "./components/ui/use-toast"
import { useNavigate } from "react-router-dom"
import { Popover, PopoverContent, PopoverTrigger } from "./components/ui/popover"
import { cn } from "./lib/utils"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "./components/ui/calendar"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import { Textarea } from "./components/ui/textarea"
import axios from "axios"
import ProjectTable from "./project-table"

const MyProject: React.FC = () => {

    const [userInfo, setUserInfo] = useState<User>({})
    
    const [tableContent, setTableContent] = useState<Project[]>([])
    const [pageNum, setPageNum] = useState<number>(1)
    const [pageTotal, setPageTotal] = useState<number>(0)
    const [projectName, setProjectName] = useState<string>("")
    const [startDate, setStartDate] = useState<Date>()
    const [endDate, setEndDate] = useState<Date>()
    const [status, setStatus] = useState<string>()
    const [privilege, setPrivilege] = useState<string>('Public')
    const [budget, setBudget] = useState<number>(0)
    const [description, setDescription] = useState<string>("")

    const [projectStatuses, setProjectStatuses] = useState<{label: string, value: string}[]>([])
    const [projectPrivileges, setProjectPrivileges] = useState<any[]>([])

    const cookie = useCookie()
    const { toast } = useToast()
    const navigate = useNavigate()

    const [drawerOpen, setDrawerOpen] = useState<boolean>(false)

    const fetchProjectStatus = () => {
        axios({
            method: 'GET',
            url: '/project/query_status'
        }).then(res => {
            if (res.status === 200 && res.data?.success === true) {
                setProjectStatuses(res.data.data)
            } else {
                toast({
                    title: "项目状态获取失败",
                    variant: 'destructive'
                })
            }
        }).catch(err => console.log(err))
    }

    const fetchProjectPrivileges = () => {
        axios({
            method: 'GET',
            url: '/project/query_privileges'
        }).then(res => {
            if (res.status === 200 && res.data?.success === true) {
                setProjectPrivileges(res.data.data)
            } else {
                toast({
                    title: "项目状态获取失败",
                    variant: 'destructive'
                })
            }
        }).catch(err => console.log(err))
    }

    const gotoPrevious = () => {

    }

    const gotoNext = () => {

    }

    useEffect(() => {
        fetchSelf(cookie, navigate).then(res => setUserInfo(res.data.data)).catch(err => console.log(err))
        fetchProjectStatus()
        fetchProjectPrivileges()
    }, [])
    
    return (
        <div>
            <div className="grid grid-rows-[45px_590px] w-full px-5 py-0 gap-0 max-h-[618px]">
            <div className="flex justify-end">
            
                <Drawer direction="right" open={drawerOpen} onOpenChange={setDrawerOpen}>
                    <DrawerTrigger asChild>
                        <Button className="">新增</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <div className="my-auto h-full w-full">
                            <DrawerHeader>
                                <DrawerTitle>新增项目</DrawerTitle>
                            </DrawerHeader>
                            <div className="p-4 pb-0 w-full">
                                <div className="mt-3 h-[520px] flex flex-col space-y-2">
                                    <div className="flex flex-col space-y-1">
                                        <Label htmlFor="projectName">名称</Label>
                                        <Input id="projectName" onChange={e => setProjectName(e.target.value)}/>
                                    </div>
                                    <div className="flex flex-row space-x-1">
                                    <div className="flex flex-col space-y-1">
                                        <Label htmlFor="startDate">开始日期</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[280px] justify-start text-left font-normal",
                                                        !startDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {startDate ? format(startDate, "yyyy-MM-dd") : <span>选择日期</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    className="z-50"
                                                    mode="single"
                                                    selected={startDate}
                                                    onSelect={setStartDate}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="flex flex-col space-y-1">
                                        <Label htmlFor="startDate">结束日期</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[280px] justify-start text-left font-normal",
                                                        !endDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {endDate ? format(endDate, "yyyy-MM-dd") : <span>选择日期</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={endDate}
                                                    onSelect={setEndDate}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    </div>
                                    <div className="flex flex-col space-y-1">
                                        <Label htmlFor="status">状态</Label>
                                        <Select onValueChange={v => setStatus(v)} value={status}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                {projectStatuses.map(status =>  (
                                                    <SelectItem value={status?.value}>{status?.label}</SelectItem>
                                                ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col space-y-1">
                                        <Label htmlFor="budget">预算</Label>
                                        <div className="flex flex-row space-x-1">
                                        <span className="text-base font-semibold">￥</span>
                                        <Input type="number"
                                               id="budget"
                                               value={budget}
                                               onChange={e => setBudget(Number(e.target.value))}
                                        />
                                        </div>
                                    </div>
                                    <div className="flex flex-col space-y-1">
                                        <Label htmlFor="privilege">公开性</Label>
                                        <Select onValueChange={v => setPrivilege(v)} value={privilege}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                {projectPrivileges.map(p =>  (
                                                    <SelectItem value={p?.value}>{p?.label}</SelectItem>
                                                ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col space-y-1">
                                        <Label htmlFor="description">项目描述</Label>
                                        <Textarea className="h-150 min-h-[150px]" placeholder={description} onChange={(e) => setDescription(e.target.value)}/>
                                    </div>
                                </div>
                            </div>
                            <DrawerFooter>
                                <Button>确定</Button>
                                <DrawerClose asChild>
                                    <Button variant="outline">取消</Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </div>
                    </DrawerContent>
                </Drawer>
            </div>
            <div className="flex justify-center">
                <ProjectTable current={pageNum}
                    total={pageTotal}
                    gotoNext={gotoNext}
                    gotoPrevious={gotoPrevious}
                    tableContent={tableContent} 
                    projectStatuses={projectStatuses}/>
            </div>
            </div>
        </div>
    )
}

export default MyProject