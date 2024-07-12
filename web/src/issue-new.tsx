import React, { useState } from "react"
import { Input } from "./components/ui/input"
import { Textarea } from "./components/ui/textarea"
import { Badge } from "./components/ui/badge"
import { Label } from "./components/ui/label"
import { Button } from "./components/ui/button"
import { newIssueApi } from "./issue-api"
import { useToast } from "./components/ui/use-toast"
import { useForm } from "react-hook-form"


interface IIssueNew {
    projectCode: string
}

const IssueNew: React.FC<IIssueNew> = (props) => {
    const [tags, setTags] = useState<string[]>([])
    const [cached, setCached] = useState<string>("")

    const [title, setTitle] = useState<string>("")
    const [description, setDescription] = useState<string>("")

    const { toast } = useToast()

    const { register, formState: { errors }, handleSubmit } = useForm()

    const addTags = (e: any) => {
        if (e.key === "Enter") {
            setTags([cached, ...tags])
            setCached(cached => "")
        }
    }

    const deleteTag = (tag: string) => {
        let _tags = tags.filter(t => t !== tag)
        setTags(_tags)
    }

    const newIssue = () => {
        // TODO: 更新议题
        newIssueApi(toast, ()=>{}, props.projectCode, title, description, tags.join(","), "")
    }
    return (
        <div className="w-full h-full flex flex-col space-y-2 rounded-lg border border-zinc-200 bg-white text-zinc-950 p-3 flex-1">
            <div className="w-full flex flex-col space-y-1">
                <Label htmlFor="title" className="w-[70px] text-base font-semibold leading-none tracking-tight">
                    标题 {errors.title && <span className="text-red-500">
													{" "}
													请输入合适的标题
												</span>}
                </Label>
                <Input id="title" placeholder="请填写标题" className="w-full h-8" {...register("title", { required: true, minLength:5, maxLength: 50})} onChange={e => setTitle(e.target.value)}/>
            </div>
            <div className="w-full flex flex-col space-y-1">
                <Label htmlFor="title" className="w-[70px] text-base font-semibold leading-none tracking-tight">描述</Label>
                <Textarea className="w-full h-150 min-h-[150px]" onChange={e => setDescription(
															e.target.value
														)}/>
            </div>
            <div className="w-full flex flex-col space-y-1">
                <Label htmlFor="title" className="w-[70px] text-base font-semibold leading-none tracking-tight">标签</Label>
                <div className="w-full flex flex-row flex-wrap space-x-1">
                    {tags.map(tag => <Badge>{tag}<span className="text-zinc-100 ml-1" onClick={() => deleteTag(tag)}>x</span></Badge>)}
                    <Input className="h-6 w-24" placeholder="回车新建" value={cached} onChange={e => setCached(e.target.value)} onKeyDown={addTags}/>
                </div>
            </div>
            <div className="w-full flex flex-row justify-start">
                <Button onClick={handleSubmit(newIssue)}>确定</Button>
            </div>
        </div>
    )
}

export default IssueNew