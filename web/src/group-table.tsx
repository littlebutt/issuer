import Reacr from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table"
import { User, UserGroup } from "./types"
import { Pagination, PaginationContent, PaginationItem } from "./components/ui/pagination"
import { Button } from "./components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Tooltip, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip"
import { TooltipContent } from "@radix-ui/react-tooltip"
import { Card, CardContent } from "./components/ui/card"
import GroupOperation from "./group-operation"

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
    
    return (
        <div className="w-full h-[555px]">
            <Table>
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
                        <TableCell className="font-semibold">#{idx + 1}</TableCell>
                        <TableCell>{content.group_name}</TableCell>
                        <TableCell>{content.owner?.user_name}</TableCell>
                        <TableCell>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        {formatMembers(content.members)}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <Card className="flex items-center bg-slate-900 text-slate-200 max-w-[300px] h-[30px] mb-[-10px]">
                                            <CardContent className="p-1">
                                                {content.members.map(u => u.user_name).join('/')}
                                            </CardContent>
                                        </Card>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </TableCell>
                        <TableCell className="space-x-1">
                            <GroupOperation content={content}
                                            userOptions={props.userOptions}
                                            updateGroup={props.updateGroup}
                                            deleteGroup={props.deleteGroup} />
                        </TableCell>
                    </TableRow>
            ))}
            </TableBody>
        </Table>
        <div className="flex justify-start bottom-0 absolute w-fit">
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
        </div>
    </div>
    )
}

export default GroupTable