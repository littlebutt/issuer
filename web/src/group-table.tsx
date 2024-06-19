import Reacr from "react"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./components/ui/table"
import { UserGroup } from "./types"
import { Pagination, PaginationContent, PaginationItem } from "./components/ui/pagination"
import { Button } from "./components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface IGroupTable {
    tableContent: UserGroup[]
    current: number
    total: number
    gotoPrevious: () => void
    gotoNext: () => void
}

const GroupTable: Reacr.FC<IGroupTable> = (props: IGroupTable) => {
    
    return (
        <Table className="h-full">
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
                <TableRow key={content.group_code}>
                    <TableCell className="font-medium">#{idx}</TableCell>
                    <TableCell>{content.group_name}</TableCell>
                    <TableCell>{content.owner?.user_name}</TableCell>
                    <TableCell>{content.members}</TableCell>
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