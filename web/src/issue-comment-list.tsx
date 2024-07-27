import React, { useEffect, useState } from "react"
import { Comment, Issue } from "./types"
import IssueCommentItem from "./issue-comment-item"
import IssueCommentText from "./issue-comment-text"
import { getComments } from "./fetch"
import { useToast } from "./components/ui/use-toast"
import { useParams } from "react-router-dom"

interface IIssueCommentList {
	issue: Issue
}

const IssueCommentList: React.FC<IIssueCommentList> = props => {
	const [issueComments, setIssueComments] = useState<Comment[]>([])

	const { issueCode } = useParams()

	const { toast } = useToast()

	const refresh = () => {
		getComments(issueCode as string)
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					setIssueComments(res.data.data)
				} else {
					toast({
						title: "获取评论失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
	}

	useEffect(() => {
		refresh()
	}, [])

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
			{issueComments
				.filter(comment => !comment.fold)
				.map(comment => (
					<IssueCommentItem comment={comment} />
				))}
			<IssueCommentText
				issueCode={props.issue.issue_code}
				refresh={refresh}
			/>
		</div>
	)
}

export default IssueCommentList
