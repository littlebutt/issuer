import React, { useState } from "react"
import { Toaster } from "./components/ui/toaster"
import { useToast } from "./components/ui/use-toast"
import { Button } from "./components/ui/button"
import { LayoutGrid, TableProperties } from "lucide-react"
import { User } from "./types"

const Groups: React.FC = () => {
    const [tableMode, setTableMode] = useState<boolean>(false)
    const [userInfo, setUserInfo] = useState<User>({})

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
            </div>
        </div>
    )
}

export default Groups