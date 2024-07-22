import React from "react"
import { Comment, Issue } from "./types"
import IssueCommentItem from "./issue-comment-item"
import IssueCommentText from "./issue-comment-text"

interface IIssueCommentList {
	issue: Issue
	comments: Comment[]
}

const IssueCommentList: React.FC<IIssueCommentList> = props => {
	return (
		<div className="flex flex-col space-y-2">
			<IssueCommentItem
				comment={{
					comment_code: "",
					issue_code: "",
					comment_time: props.issue.propose_date,
					commenter: props.issue.owner,
					fold: false,
					content: props.issue.description ?? "",
					appendices: []
				}}
			/>
			{props.comments.map(comment => (
				<IssueCommentItem comment={comment} />
			))}
			<IssueCommentText />
		</div>
	)
}

export default IssueCommentList
