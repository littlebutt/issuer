import React from "react"
import { User, UserGroup } from "./types"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./components/ui/card"
import { Label } from "./components/ui/label"
import { Button } from "./components/ui/button"
import GroupOperation from "./group-operation"
import { Pagination, PaginationContent, PaginationItem } from "./components/ui/pagination"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface IGroupCard {
    cardContent: UserGroup[]
    current: number
    total: number
    gotoPrevious: () => void
    gotoNext: () => void
    userOptions: { value: string; label: string }[]
    deleteGroup: (groupCode: string) => void
    updateGroup: (groupCode: string, groupName: string, owner: string, members: string) => void
}

const GroupCard: React.FC<IGroupCard> = (props) => {

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
            <div className="grid grid-cols-4 content-start justify-center gap-4 max-h-[645px] w-full h-[500px] overflow-y-auto">
            {props.cardContent.map(content => (
                <Card className="top-1">
                    <CardHeader>
                        <CardTitle className="text-sm">{content.group_name}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-rows-2 gap-4 space-y-1.5 px-6">
                        <div className="flex space-x-2 items-center text-lg">
                            <Label className="font-medium">所有者</Label>
                            <Label>{content.owner.user_name}</Label>
                        </div>
                        <div className="flex space-x-2 items-center text-lg">
                            <Label className="font-medium">成员</Label>
                            <Label>{formatMembers(content.members)}</Label>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <GroupOperation content={content}
                                        userOptions={props.userOptions}
                                        updateGroup={props.updateGroup}
                                        deleteGroup={props.deleteGroup}
                                        className="w-full h-[20px] flex justify-between"/>
                    </CardFooter>
                </Card>
            ))}
            </div>
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

export default GroupCard