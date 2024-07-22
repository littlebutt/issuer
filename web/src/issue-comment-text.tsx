import React, { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { Button } from "./components/ui/button"
import { Bold, Code, Heading, Italic, Paperclip, TextQuote } from "lucide-react"
import { Textarea } from "./components/ui/textarea"
import Markdown from "marked-react"
import { Label } from "./components/ui/label"
import { Input } from "./components/ui/input"

const IssueCommentText: React.FC = () => {
	const [commentContent, setCommentContent] = useState<string>("")

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
		console.log(target.files)
	}
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
					<Markdown>{commentContent}</Markdown>
				</TabsContent>
			</Tabs>
		</div>
	)
}

export default IssueCommentText
