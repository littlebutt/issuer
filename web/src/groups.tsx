import React, { useState } from "react"
import { Toaster } from "./components/ui/toaster"
import { useToast } from "./components/ui/use-toast"
import { Button } from "./components/ui/button"
import { LayoutGrid, TableProperties } from "lucide-react"
import { User, UserGroup } from "./types"
import GroupTable from "./group-table"
import GroupCard from "./group-card"

const Groups: React.FC = () => {
    const [tableMode, setTableMode] = useState<boolean>(false)
    const [userInfo, setUserInfo] = useState<User>({})

    const [tableContent, setTableContent] = useState<UserGroup[]>([])
    const [pageNum, setPageNum] = useState<number>(1) 
    const [pageTotal, setPageTotal] = useState<number>(0)

    const { toast } = useToast()

    return (
        <div>
            <Toaster/>
            <div className="grid grid-rows-[80px_555px] w-full px-5 py-0 gap-0 max-h-[618px]">
                <div className="flex justify-start space-x-1 space-y-1">
                    <Button size="icon" onClick={() => setTableMode(!tableMode)}>
                        {tableMode ? (<TableProperties className="h-4 w-4"/>) : (<LayoutGrid className="h-4 w-4"/>)}   
                    </Button>
                </div>
                {/* {tableMode ? (
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
            )} */}
            </div>
        </div>
    )
}

export default Groups