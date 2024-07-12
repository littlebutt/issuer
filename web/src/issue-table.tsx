import React from "react"
import { Label } from "./components/ui/label"

const IssueTable: React.FC = () => {
    return (
        <div className="w-full flex flex-row space-x-2">
                <div>
                    <Label>标题</Label>
                </div>
                <div>
                    <Label>状态</Label>
                </div>
                <div>
                    <Label>创建者</Label>
                </div>

            </div>
    )
}

export default IssueTable