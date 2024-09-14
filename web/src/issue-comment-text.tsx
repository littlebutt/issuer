import React, { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { Button } from "./components/ui/button"
import { Bold, Code, Heading, Italic, Paperclip, TextQuote } from "lucide-react"
import { Textarea } from "./components/ui/textarea"
import { Label } from "./components/ui/label"
import { Input } from "./components/ui/input"
import { newIssueCommentApi, uploadAppendix } from "./issue-comment-api"
import { useToast } from "./components/ui/use-toast"
import useMarked from "./lib/marked"

interface IIssueCommentText {
	issueCode: string
	refresh: () => void
}

const IssueCommentText: React.FC<IIssueCommentText> = props => {
	const [commentContent, setCommentContent] = useState<string>("")

	const [appendixUrl, setAppendixUrl] = useState<string>("")

	const { toast } = useToast()
	const marked = useMarked()

	const addHeading = () => {
		let newContent = commentContent + "\n###\n"
		setCommentContent(newContent)
	}

	const addBold = () => {
		let newContent = commentContent + "****"
		setCommentContent(newContent)
	}

	const addItalic = () => {
		let newContent = commentContent + "__"
		setCommentContent(newContent)
	}

	const addQuote = () => {
		let newContent = commentContent + "\n> "
		setCommentContent(newContent)
	}

	const addCode = () => {
		let newContent = commentContent + "\n```\n```"
		setCommentContent(newContent)
	}

	const uploadFile = (e: any) => {
		let target = document.querySelector("#fileUpload") as any
		let newContent = commentContent + "\n![图片上传中](url)\n"
		setCommentContent(newContent)
		uploadAppendix(target.files[0], props.issueCode)
			.then(res => {
				if (res.status === 200 && res.data.success === true) {
					setAppendixUrl(
						`${window.location.protocol}//${window.location.host}${res.data.filename}`
					)
				} else {
					toast({
						title: "上传失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
	}

	const newComment = () => {
		newIssueCommentApi(
			toast,
			props.refresh,
			props.issueCode,
			commentContent
		)
		setCommentContent("")
	}

	useEffect(() => {
		let newContent = commentContent.replace(
			"![图片上传中](url)",
			`![图片](${appendixUrl})`
		)
		setCommentContent(newContent)
	}, [appendixUrl])

	return (
		<div>
			<Tabs defaultValue="write">
				<div className="flex justify-between mx-2 mt-2 bg-zinc-100 rounded-t-sm border-x border-t border-zinc-200">
					<TabsList className="flex flex-row justify-start bg-zinc-100">
						<TabsTrigger value="write">评论</TabsTrigger>
						<TabsTrigger value="preview">预览</TabsTrigger>
					</TabsList>
					<div className="flex flex-row space-x-1">
						<Button
							size="icon"
							variant="ghost"
							onClick={addHeading}
						>
							<Heading className="h-4 w-4" />
						</Button>
						<Button size="icon" variant="ghost" onClick={addBold}>
							<Bold className="h-4 w-4" />
						</Button>
						<Button size="icon" variant="ghost" onClick={addItalic}>
							<Italic className="h-4 w-4" />
						</Button>
						<Button size="icon" variant="ghost" onClick={addQuote}>
							<TextQuote className="h-4 w-4" />
						</Button>
						<Button size="icon" variant="ghost" onClick={addCode}>
							<Code className="h-4 w-4" />
						</Button>
						<Button size="icon" variant="ghost">
							<Label
								htmlFor="fileUpload"
								onClick={e => e.stopPropagation()}
							>
								<Paperclip className="h-4 w-4" />
							</Label>
						</Button>
						<Input
							id="fileUpload"
							type="file"
							className="hidden"
							onChange={uploadFile}
							accept="image/*"
						/>
					</div>
				</div>
				<TabsContent
					value="write"
					className="m-2 mt-0 border border-zinc-200 rounded-b-sm p-2 border-x border-b"
				>
					<Textarea
						value={commentContent}
						onChange={e => setCommentContent(e.target.value)}
					/>
				</TabsContent>
				<TabsContent
					value="preview"
					className="m-2 mt-0 border border-zinc-200 rounded-b-sm p-2 border-x border-b"
				>
					{marked.parse(commentContent)}
				</TabsContent>
				<div className="w-full flex justify-end">
					<Button className="w-[100px] px-2" onClick={newComment}>
						评论
					</Button>
				</div>
			</Tabs>
		</div>
	)
}

export default IssueCommentText
