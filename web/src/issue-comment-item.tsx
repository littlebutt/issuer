import React from "react"
import { Comment } from "./types"
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar"
import useMarked from "./lib/marked"
import { Ellipsis } from "lucide-react"
import { Button } from "./components/ui/button"
import { useToast } from "./components/ui/use-toast"
import { foldIssueCommentApi } from "./issue-comment-api"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from "./components/ui/dropdown-menu"

interface IIssueCommentItem {
	comment: Comment
	refresh: () => void
	foldable: boolean
}

const IssueCommentItem: React.FC<IIssueCommentItem> = props => {
	const marked = useMarked()
	const { toast } = useToast()

	const foldComment = () => {
		foldIssueCommentApi(
			toast,
			props.refresh,
			props.comment.comment_code,
			props.comment.issue_code
		)
	}

	return (
		<div className="grid grid-cols-[1fr,11fr] align-top">
			<Avatar className="mt-1 left-5">
				<AvatarImage
					src={
						props.comment.commenter?.avatar ?? "/statics/avatar.png"
					}
				/>
				<AvatarFallback>
					{props.comment.commenter?.user_name}
				</AvatarFallback>
			</Avatar>
			<div className="mt-1 relative">
				<div className="rounded-t-lg border-x border-t border-zinc-200 bg-zinc-100 mx-1 px-4 align-middle h-12 flex flex-row justify-between items-center before:content-['_'] before:absolute before:bg-zinc-200 before:block before:[clip-path:polygon(0_50%,100%_0,100%_100%)] before:-left-[0.20rem] before:top-4 before:w-2 before:h-4 before:right-full after:content-['_'] after:absolute after:bg-zinc-100 after:block after:[clip-path:polygon(0_50%,100%_0,100%_100%)] after:w-2 after:h-4 after:right-full after:-left-[0.15rem]">
					<div className="flex flex-row space-x-2">
						<div className="text-base font-semibold">
							{props.comment.commenter?.user_name}
						</div>
						<div className="text-sm text-muted-foreground">
							{props.comment.comment_time}
						</div>
					</div>
					{!props.comment.fold && props.foldable && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button size="icon" variant="ghost">
									<Ellipsis className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="end"
								className="min-w-[50px]"
							>
								<DropdownMenuItem onClick={foldComment}>
									<span>折叠</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
				{!props.comment.fold ? (
					<div className="rounded-b-lg border border-zinc-200 mx-1 mb-1 p-4 min-h-16">
						{marked.parse(props.comment.content)}
					</div>
				) : (
					<div className="rounded-b-lg border border-zinc-200 mx-1 mb-1 p-4 min-h-16">
						{marked.parse("_该评论已被折叠_")}
					</div>
				)}
			</div>
		</div>
	)
}

export default IssueCommentItem
