import React, { useEffect, useState } from "react"
import { Toaster } from "./components/ui/toaster"
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "./components/ui/drawer"
import { Button } from "./components/ui/button"
import { Label } from "./components/ui/label"
import { Input } from "./components/ui/input"
import { User } from "./types"
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

const MyProject: React.FC = () => {

    const [userInfo, setUserInfo] = useState<User>({})
    
    const [projectName, setProjectName] = useState<string>("")
    const [startDate, setStartDate] = useState<Date>()
    const [endDate, setEndDate] = useState<Date>()
    const [status, setStatus] = useState<string>()
    const [privilege, setPrivilege] = useState<string>('Public')
    const [description, setDescription] = useState<string>("")

    const [projectStatuses, setProjectStatuses] = useState<any[]>([])
    const [projectPrivileges, setProjectPrivileges] = useState<any[]>([])

    const cookie = useCookie()
    const { toast } = useToast()
    const navigate = useNavigate()

    const [drawerOpen, setDrawerOpen] = useState<boolean>(false)

    useEffect(() => {
        fetchSelf(cookie, navigate).then(res => setUserInfo(res.data.data)).catch(err => console.log(err))
    })
    
    return (
        <div>
            <Toaster/>
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
                                                        {startDate ? format(startDate, "PPP") : <span>选择日期</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={startDate}
                                                    onSelect={setStartDate}
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
                                                        {endDate ? format(endDate, "PPP") : <span>选择日期</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={endDate}
                                                    onSelect={setEndDate}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="flex flex-col space-y-1">
                                        <Label htmlFor="status">状态</Label>
                                        <Select onValueChange={v => setStatus(v)}>
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
                                        <Input type="number" id="budget" className="after:content-['元']"/>
                                    </div>
                                    <div className="flex flex-col space-y-1">
                                        <Label htmlFor="privilege">公开性</Label>
                                        <Select onValueChange={v => setPrivilege(v)}>
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
                {/* <GroupTable current={pageNum}
                            total={pageTotal}
                            gotoNext={gotoNext}
                            gotoPrevious={gotoPrevious}
                            tableContent={tableContent}
                            userOptions={userOptions}
                            deleteGroup={deleteGroup}
                            updateGroup={updateGroup}/> */}
            </div>
            </div>
        </div>
    )
}

export default MyProject