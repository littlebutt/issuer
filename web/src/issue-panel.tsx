import React, { useState } from "react"
import { Button } from "./components/ui/button"
import IssueTable from "./issue-table"
import IssueNew from "./issue-new"

interface IIssuePanel {
	projectCode: string
}

const IssuePanel: React.FC<IIssuePanel> = props => {
	const [isNormalMode, setIsNormalMode] = useState<boolean>(true)

	return (
		<div className="w-full flex flex-col space-y-1 p-6">
			<div className="w-full flex flex-row justify-between items-start">
				<div className="text-2xl font-semibold leading-none tracking-tight">
					议题
				</div>
				<Button onClick={() => setIsNormalMode(!isNormalMode)}>
					{" "}
					{isNormalMode ? "新增" : "取消"}
				</Button>
			</div>
			{isNormalMode ? (
				<IssueTable projectCode={props.projectCode} />
			) : (
				<IssueNew projectCode={props.projectCode} />
			)}
		</div>
	)
}

export default IssuePanel
