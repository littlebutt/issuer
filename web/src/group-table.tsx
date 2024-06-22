import Reacr, { useState } from "react"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./components/ui/table"
import { User, UserGroup } from "./types"
import { Pagination, PaginationContent, PaginationItem } from "./components/ui/pagination"
import { Button } from "./components/ui/button"
import { ChevronLeft, ChevronRight, CircleX, PenLine } from "lucide-react"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog"
import { Label } from "./components/ui/label"
import { Input } from "./components/ui/input"
import { MultiSelect } from "./components/ui/multi-select"
import { useCookie } from "./lib/cookies"
import { SelectValue as Selected } from "react-tailwindcss-select/dist/components/type"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import { Tooltip, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip"
import { TooltipContent } from "@radix-ui/react-tooltip"
import { Card, CardContent } from "./components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "./components/ui/popover"

interface IGroupTable {
    tableContent: UserGroup[]
    current: number
    total: number
    gotoPrevious: () => void
    gotoNext: () => void
    userOptions: { value: string; label: string }[]
    deleteGroup: (groupCode: string) => void
    updateGroup: (groupCode: string, groupName: string, owner: string, members: string) => void
}

const GroupTable: Reacr.FC<IGroupTable> = (props: IGroupTable) => {
    
    const cookie = useCookie()
    const [groupName, setGroupName] = useState<string>("")
    const [owner, setOwner] = useState<string>("")
    const [selectedUsers, setSelectedUsers] = useState<any[]>([])

    const [dialogOpen, setDialogOpen] = useState<boolean>(false)

    const changeUserOptions: (value: Selected) => void = (value: Selected) => {
        setSelectedUsers(value as any)
    }

    const formatMembers = (members: User[]): string => {
        let end = Math.min(5, members.length)
        let res = ""
        for (let i = 0; i < end; i ++) {
            res += members[i].user_name
            res += "/"
        }
        res = res.substring(0, res.lastIndexOf('/'))
        res += members.length > end ? `+${members.length - end}` : ""
        return res
    }

    const users2str = (users: any[]) => {
        return users.map(u => u.value).join(",")
    }

    const clearInput = () => {
        setGroupName("")
        setOwner("")
        setSelectedUsers([])
    }

    
    return (
        <Table className="max-h-[645px]">
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">编号</TableHead>
                    <TableHead>名称</TableHead>
                    <TableHead>创建者</TableHead>
                    <TableHead>成员</TableHead>
                    <TableHead>操作</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
            {props.tableContent.map((content, idx) => (
                <TableRow key={content.group_code} className="h-[10px]">
                    <TableCell className="font-medium">#{idx + 1}</TableCell>
                    <TableCell>{content.group_name}</TableCell>
                    <TableCell>{content.owner?.user_name}</TableCell>
                    <TableCell>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    {formatMembers(content.members)}
                                </TooltipTrigger>
                                <TooltipContent>
                                    <Card className="flex items-center bg-slate-900 text-slate-200 max-w-[300px]">
                                        <CardContent className="p-1">
                                            {content.members.map(u => u.user_name).join('/')}
                                        </CardContent>
                                    </Card>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </TableCell>
                    <TableCell className="space-x-1">
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" 
                                        size="icon" 
                                        disabled={cookie.getCookie('current_user')?.split(":")[0] !== content.owner.user_code}
                                        onClick={clearInput}>
                                            <PenLine className="h-4 w-4"/>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>修改组织</DialogTitle>
                                </DialogHeader>
                                <div className="p-4 pb-0 w-full">
                                    <div className="mt-3 h-[520px] flex flex-col space-y-2">
                                        <div className="flex flex-col space-y-1">
                                            <Label htmlFor="groupName">组名</Label>
                                            <Input id="groupname" onChange={e => setGroupName(e.target.value)} placeholder={content.group_name}/>
                                        </div>
                                        <div className="flex flex-col space-y-1">
                                            <Label htmlFor="owner">所有者</Label>
                                            <Select onValueChange={v => setOwner(v)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={content.owner.user_name}/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {props.userOptions.map(o => (
                                                        <SelectItem value={o.value}>{o.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex flex-col space-y-1">
                                            <Label htmlFor="members">组员</Label>
                                            <MultiSelect options={props.userOptions} placeholder={content.members.map(m => m.user_name).join(",")} value={selectedUsers} onChange={changeUserOptions}/>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter className="sm:justify-end">
                                    <DialogClose asChild className="flex justify-end space-x-1">
                                        <Button type="button" variant="secondary">取消</Button>
                                    </DialogClose>
                                    <Button onClick={() => {props.updateGroup(content.group_code, groupName, owner, users2str(selectedUsers)); setDialogOpen(false)}}>确认</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" 
                                            size="icon"
                                            disabled={cookie.getCookie('current_user')?.split(":")[0] !== content.owner.user_code}>
                                    <CircleX className="h-4 w-4"/>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[160px] h-[50px] flex flex-row justify-center items-center text-xs space-x-1 p-1 my-1">
                                <p>确认删除？</p><Button size="sm" className="p-1.5 [line-height:10px]" onClick={() => props.deleteGroup(content.group_code)}>确认</Button>
                            </PopoverContent>
                        </Popover>
                    </TableCell>
                </TableRow>
        ))}
        </TableBody>
        <TableFooter className="flex justify-end pt-4">
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <Button onClick={props.gotoPrevious} size="icon">
                            <ChevronLeft />
                        </Button>
                    </PaginationItem>
                    <PaginationItem className="w-[100px] flex justify-center mx-0">
                            第{props.current}页/共{props.total}页
                    </PaginationItem>
                    <PaginationItem>
                        <Button onClick={props.gotoNext} size="icon">
                            <ChevronRight />
                        </Button>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </TableFooter>
    </Table>
    )
}

export default GroupTable