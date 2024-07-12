import React, { useEffect, useState } from "react"
import { Issue } from "./types"
import { getIssues } from "./fetch"
import { useToast } from "./components/ui/use-toast"
import { Button } from "./components/ui/button"
import IssueTable from "./issue-table"
import IssueNew from "./issue-new"

interface IIssuePanel {
    projectCode: string
}

const IssuePanel: React.FC<IIssuePanel> = (props) => {
    const [isNormalMode, setIsNormalMode] = useState<boolean>(true)

    const [issues, setIssues] = useState<Issue[]>([])

    const { toast } = useToast()

    useEffect(() => {
        getIssues("", props.projectCode, "", "", "", "", "", "", "", "", "")
        .then(res => {
            if (res.status === 200 && res.data.success === true) {
                setIssues(res.data.data)
            } else {
                toast({
                    title: "获取议题列表失败",
                    variant: "destructive"
                })
            }
        }).catch(err => console.log(err))
    }, [])

    return (
        <div className="w-full flex flex-col space-y-1 p-6">
            <div className="w-full flex flex-row justify-between items-start">
                <div className="text-2xl font-semibold leading-none tracking-tight">议题</div>
                <Button onClick={() => setIsNormalMode(!isNormalMode)}> { isNormalMode ? "新增" : "取消"}</Button>
            </div>
            {isNormalMode ? <IssueTable /> : <IssueNew projectCode={props.projectCode} />}

        </div>
        
    )
}

export default IssuePanel