import React, { useEffect, useState } from "react"
import { Toaster } from "./components/ui/toaster"
import { useToast } from "./components/ui/use-toast"
import { Button } from "./components/ui/button"
import { LayoutGrid, TableProperties } from "lucide-react"
import { UserGroup } from "./types"
import GroupTable from "./group-table"
import GroupCard from "./group-card"
import { countGroups, fetchGroups, fetchUsers } from "./fetch"
import { Label } from "./components/ui/label"
import { Input } from "./components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import { MultiSelect } from "./components/ui/multi-select"
import axios from "axios"
import config from "./config"

const Groups: React.FC = () => {
    const [tableMode, setTableMode] = useState<boolean>(false)

    const [tableContent, setTableContent] = useState<UserGroup[]>([])
    const [pageNum, setPageNum] = useState<number>(1) 
    const [pageTotal, setPageTotal] = useState<number>(0)

    const [owner, setOwner] = useState<string>("")
    const [userOptions, setUserOptions] = useState<{ value: string; label: string }[]>([])
    const [selectedUsers, setSelectedUsers] = useState<any[]>([])
    const [groupName, setGroupName] = useState<string>("")
    const [members, setMembers] = useState<string>("")

    const { toast } = useToast()

    const changeUserOptions: (options: {label: string, value: string}[]) => void = (options) => {
        setSelectedUsers(options)
        setMembers(options.map((option) => option.value).join(','))
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

    const fetchUserGroups = (groupName?: string, owner?: string, members?: string, currentPageNum?: number) => {
        fetchGroups("", groupName ?? "", owner ?? "", members ?? "", config.pageSize, currentPageNum ?? pageNum)
        .then(res => {
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

    const fetchUserGroupCount = (groupName?: string, owner?: string, members?: string) => {
        countGroups("", groupName ?? "", owner ?? "", members ?? "")
        .then(res => {
            if (res.status === 200 && res.data?.success === true) {
                setPageTotal(Math.ceil(res.data?.data / config.pageSize))
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

    const gotoNext = () => {
        setPageNum((pageNum) => Math.min(pageNum + 1, pageTotal))
        fetchUserGroups(groupName, owner, members, Math.min(pageNum + 1, pageTotal))
    }

    const gotoPrevious = () => {
        setPageNum((pageNum) => Math.max(pageNum - 1, 1))
        fetchUserGroups(groupName, owner, members, Math.max(pageNum - 1, 1))
    }

    const search = () => {
        fetchUserGroups(groupName, owner, members, 1)
        fetchUserGroupCount(groupName, owner, members)
    }

    const clearInput = () => {
        setGroupName("")
        setOwner("")
        setSelectedUsers([])
        setMembers("")
    }

    useEffect(() => {
        fetchUserGroups()
        fetchUserGroupCount()
        fetchUserOptions()
    }, [])

    return (
        <div>
            <Toaster/>
            <div className="grid grid-rows-[80px_555px] w-full px-5 py-0 gap-0 max-h-[618px]">
                <div className="flex justify-start space-x-2 space-y-1">
                    <Button size="icon" onClick={() => setTableMode(!tableMode)}>
                        {tableMode ? (<TableProperties className="h-4 w-4"/>) : (<LayoutGrid className="h-4 w-4"/>)}   
                    </Button>
                    <div className="flex flex-row space-x-0 px-3">
                        <Label htmlFor="group-name" className="w-[70px] pt-2 text-base font-semibold">名称</Label>
                        <Input id="group-name" onChange={e => setGroupName(e.target.value)} value={groupName}></Input>
                    </div>
                    <div className="flex flex-row space-x-0 px-3">
                        <Label htmlFor="owner" className="w-[70px] pt-2 text-base font-semibold">创建者</Label>
                        <Select onValueChange={v => setOwner(v)} value={owner}>
                            <SelectTrigger className="md:w-[187px]">
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                            {userOptions.map(o => (
                                <SelectItem value={o.value}>{o.label}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-row space-x-0 px-3">
                        <Label className="w-[70px] pt-2 text-base font-semibold">成员</Label>
                        <MultiSelect className="md:w-[187px]" options={userOptions} value={selectedUsers} onChange={changeUserOptions}/>
                    </div>
                    <Button onClick={search}>搜索</Button>
                    <Button variant="outline" onClick={clearInput}>重置</Button>
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

export default Groups