import React, { useEffect, useState } from "react"
import { Toaster } from "./components/ui/toaster"
import { Button } from "./components/ui/button"
import { TableProperties, LayoutGrid } from "lucide-react"
import GroupTable from "./group-table"
import { User, UserGroup } from "./types"
import axios from "axios"
import { useCookie } from "./lib/cookies"
import { useToast } from "./components/ui/use-toast"
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "./components/ui/drawer"
import { Input } from "./components/ui/input"
import { fetchUser, fetchUsers } from "./fetch"
import { useNavigate } from "react-router-dom"
import { Label } from "./components/ui/label"
import { MultiSelect } from "./components/ui/multi-select"
import { SelectValue } from "react-tailwindcss-select/dist/components/type"
import GroupCard from "./group-card"


const MyGroup: React.FC = () => {
    const [tableMode, setTableMode] = useState<boolean>(false)
    const [userInfo, setUserInfo] = useState<User>({})

    const [tableContent, setTableContent] = useState<UserGroup[]>([])
    const [pageNum, setPageNum] = useState<number>(1) 
    const [pageTotal, setPageTotal] = useState<number>(0)
    const [userOptions, setUserOptions] = useState<{ value: string; label: string }[]>([])
    const [selectedUsers, setSelectedUsers] = useState<any[]>([])
    const [groupName, setGroupName] = useState<string>("")

    const cookie = useCookie()
    const { toast } = useToast()
    const navigate = useNavigate()

    const [drawerOpen, setDrawerOpen] = useState<boolean>(false)

    const fetchUserGroups = (currentPageNum?: number) => {
        let user_code =  cookie.getCookie("current_user") as string
        user_code = user_code.split(':')[0]
        axios({
            url: `/user_group/query_group?user_code=${user_code}&page_num=${currentPageNum ?? pageNum}&page_size=10`,
            method: 'GET'
        }).then(res => {
            if (res.status === 200 && res.data?.success === true) {
                setTableContent(res.data?.data)
            } else {
                toast({
                    title: "获取我的组织失败",
                    variant: 'destructive'
                })
            }
        }).catch(err => console.log(err))
    }

    const fetchUserGroupCount = () => {
        let user_code =  cookie.getCookie("current_user") as string
        user_code = user_code.split(':')[0]
        axios({
            url: `/user_group/count_group?user_code=${user_code}`,
            method: 'GET'
        }).then(res => {
            if (res.status === 200 && res.data?.success === true) {
                setPageTotal(Math.ceil(res.data?.data / 10))
            } else {
                toast({
                    title: "获取我的组织失败",
                    variant: 'destructive'
                })
            }
        }).catch(err => console.log(err))
    }

    const fetchUserOptions = () => {
        // FIXME: 添加下拉菜单分页功能
        fetchUsers(1, 999).then(res => {
            if (res.status === 200 && res.data.success === true) {
                res.data.data.map((user: { user_code: any; user_name: any }) => {
                    userOptions.push({
                        value: user.user_code,
                        label: user.user_name
                    })
                    
                })
                setUserOptions([...userOptions])
            } else {
                toast({
                    title: "获取所有用户失败",
                    variant: 'destructive'
                })
            }
        })
        .catch(err => console.log(err))
    }

    const changeUserOptions: (value: SelectValue) => void = (value: SelectValue) => {
        setSelectedUsers(value as any)
    }

    const submitUserGroup = () => {
        let members = ""
        if (selectedUsers?.length !== 0) {
            members = selectedUsers?.map(u => u.value).join(',') ?? ""
        }
        if (groupName.trim() === "") {
            toast({
                title: "请填写组名"
            })
            return
        }
        axios({
            method: 'POST',
            url: "/user_group/new",
            data: {
                group_name: groupName,
                members: members
            }
        }).then(res => {
            if (res.status === 200 && res.data.success === true) {
                toast({
                    title: "新建成功"
                })
                fetchUserGroups()
                fetchUserGroupCount()
            } else {
                toast({
                    title: "新建失败",
                    variant: "destructive"
                })
            }
            setDrawerOpen(false)
        }).catch(err => console.log(err))
    }

    const deleteGroup = (groupCode: string) => {
        axios({
            method: 'POST',
            url: "/user_group/delete",
            data: {
                group_code: groupCode
            }
        }).then(res => {
            if (res.status === 200 && res.data.success === true) {
                toast({
                    title: "删除成功"
                })
                fetchUserGroups()
                fetchUserGroupCount()
            } else {
                toast({
                    title: "删除失败"
                })
            }
        }).catch(err => console.log(err))
    }

    const updateGroup = (groupCode: string, groupName: string, owner: string, members: string) => {
        axios({
            method: 'POST',
            url: '/user_group/change',
            data: {
                group_code: groupCode,
                group_name: groupName,
                owner: owner,
                members: members
            }
        }).then(res => {
            if (res.status === 200 && res.data.success === true) {
                toast({
                    title: "更新成功"
                })
                fetchUserGroups()
                fetchUserGroupCount()
            } else {
                toast({
                    title: "更新失败"
                })
            }
        }).catch(err => console.log(err))
    }

    const gotoNext = () => {
        setPageNum((pageNum) => Math.min(pageNum + 1, pageTotal))
        fetchUserGroups(Math.min(pageNum + 1, pageTotal))
    }

    const gotoPrevious = () => {
        setPageNum((pageNum) => Math.max(pageNum - 1, 1))
        fetchUserGroups(Math.max(pageNum - 1, 1))
    }

    useEffect(() => {
        fetchUser(cookie, navigate).then(res => setUserInfo(res.data.data)).catch(err => console.log(err))
        fetchUserGroups()
        fetchUserGroupCount()
        fetchUserOptions()
    }, [])

    return (
        <div>
            <Toaster/>
            <div className="grid grid-rows-[80px_555px] w-full px-5 py-0 gap-0 max-h-[618px]">
            <div className="flex justify-between space-x-1 space-y-1">
                <Button size="icon" onClick={() => setTableMode(!tableMode)}>
                    {tableMode ? (<TableProperties className="h-4 w-4"/>) : (<LayoutGrid className="h-4 w-4"/>)}   
                </Button>
                <Drawer direction="right" open={drawerOpen} onOpenChange={setDrawerOpen}>
                    <DrawerTrigger asChild>
                        <Button className="">新增</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <div className="my-auto h-full w-full">
                            <DrawerHeader>
                                <DrawerTitle>新增组织</DrawerTitle>
                            </DrawerHeader>
                            <div className="p-4 pb-0 w-full">
                                <div className="mt-3 h-[520px] flex flex-col space-y-2">
                                    <div className="flex flex-col space-y-1">
                                        <Label htmlFor="groupName">组名</Label>
                                        <Input id="groupname" onChange={e => setGroupName(e.target.value)}/>
                                    </div>
                                    <div className="flex flex-col space-y-1">
                                        <Label htmlFor="owner">所有者</Label>
                                        <Input disabled id="owner" value={userInfo.user_name} />
                                    </div>
                                    <div className="flex flex-col space-y-1">
                                        <Label htmlFor="members">组员</Label>
                                        <MultiSelect options={userOptions} value={selectedUsers} onChange={changeUserOptions}/>
                                    </div>
                                </div>
                            </div>
                            <DrawerFooter>
                                <Button onClick={submitUserGroup}>确定</Button>
                                <DrawerClose asChild>
                                    <Button variant="outline">取消</Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </div>
                    </DrawerContent>
                </Drawer>
            </div>
            {tableMode ? (
            <div className="flex justify-center">
                <GroupTable current={pageNum}
                            total={pageTotal}
                            gotoNext={gotoNext}
                            gotoPrevious={gotoPrevious}
                            tableContent={tableContent}
                            userOptions={userOptions}
                            deleteGroup={deleteGroup}
                            updateGroup={updateGroup}/>
            </div>) : (
            <div>
                <GroupCard cardContent={tableContent}
                           current={pageNum}
                           total={pageTotal}
                           gotoPrevious={gotoPrevious}
                           gotoNext={gotoNext}
                           userOptions={userOptions}
                           deleteGroup={deleteGroup}
                           updateGroup={updateGroup}/>
            </div>
            )}
            </div>
        </div>
    )
}

export default MyGroup