import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { Project as ProjectType, User } from "./types"
import { fetchProjectStatuses, getProjects } from "./fetch"
import { useToast } from "./components/ui/use-toast"
import { formatMembers, formatOwner, statusValue2label } from "./utils"
import { Badge } from "./components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./components/ui/collapsible"
import { Label } from "./components/ui/label"
import { Button } from "./components/ui/button"
import { ChevronsUpDown } from "lucide-react"
import IssuePanel from "./issue-panel"

const Project: React.FC = () => {
	const { projectCode } = useParams()

    const [project, setProject] = useState<ProjectType>()
    const [projectStatuses, setProjectStatuses] = useState<{label: string, value: string}[]>([])
    const [isSurveyOpen,setIsSurveyOpen] = useState<boolean>(true)
    const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false)

    const { toast } = useToast()

    useEffect(() => {
        getProjects(projectCode as string, "", "", "", "", "", "").then(res => {
            if (res.status === 200 && res.data.success === true) {
                setProject(res.data.data[0])
            } else {
                toast({
                    title: "获取项目失败",
                    variant: "destructive"
                })
            }
        }).catch(err => console.log(err))
        fetchProjectStatuses(projectStatuses, setProjectStatuses)
    }, [])
	return (
        <div>
            <div className="w-full flex flex-row space-x-2 h-full">
                <Card className="w-1/3 flex-1">
                    <CardHeader className="px-6 py-3">
                        <CardTitle className="flex flex-row space-x-3 items-end">
                            <span className="text-3xl font-semibold leading-none tracking-tight">{project?.project_name}</span>
                            <span className="text-base font-thin tracking-tight align-text-bottom">{project?.project_code}</span>
                            {project?.privilege === "Private" && (
										<Badge
											variant="outline"
											className="text-sm"
										>
											私有
										</Badge>
									)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col space-y-3 p-9">
                        <div className="flex flex-col space-y-2">
                            <div className="flex flex-row justify-between">
                                <Label className="text-base font-medium">状态</Label>
                                <div className="text-sm font-normal text-muted-foreground">{statusValue2label(project?.status as string, projectStatuses)}</div>
                            </div>
                            <div className="flex flex-row justify-between">
                                <Label className="text-base font-medium">创建者</Label>
                                <div className="text-sm font-normal text-muted-foreground">{formatOwner(project?.owner as User)}</div>
                            </div>
                            <div className="flex flex-row justify-between">
                                <Label className="text-base font-medium">成员</Label>
                                <div className="text-sm font-normal text-muted-foreground">{formatMembers(project?.participants as User[])}</div>
                            </div>
                            <div className="flex flex-row justify-between">
                                <Label className="text-base font-medium">开始日期</Label>
                                <div className="text-sm font-normal text-muted-foreground">{project?.start_date}</div>
                            </div>
                            <div className="flex flex-row justify-between">
                                <Label className="text-base font-medium">结束日期</Label>
                                <div className="text-sm font-normal text-muted-foreground">{project?.end_date??"未设定"}</div>
                            </div>
                            <div className="flex flex-row justify-between overflow-y-auto max-h-[200px]">
                                <Label className="text-base font-medium">项目描述</Label>
                                <div className="text-sm font-normal text-muted-foreground">{project?.description}</div>
                            </div>
                        </div>
                        <div>
                        <Collapsible
                            open={isSurveyOpen}
                            onOpenChange={setIsSurveyOpen}
                            className="w-full space-y-2"
                        >
      <div className="flex items-center justify-between space-x-4">
        <div className="text-base font-medium">统计</div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-4 py-3 font-mono text-sm">
          {/* TODO: 修改统计和高级 */}
          @radix-ui/colors
        </div>
        <div className="rounded-md border px-4 py-3 font-mono text-sm">
          @stitches/react
        </div>
      </CollapsibleContent>
    </Collapsible>
                        </div>
                        <div>
                        <Collapsible
                            open={isAdvancedOpen}
                            onOpenChange={setIsAdvancedOpen}
                            className="w-full space-y-2"
                        >
      <div className="flex items-center justify-between space-x-4">
        <div className="text-base font-medium">高级</div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-4 py-3 font-mono text-sm">
          @radix-ui/colors
        </div>
        <div className="rounded-md border px-4 py-3 font-mono text-sm">
          @stitches/react
        </div>
      </CollapsibleContent>
    </Collapsible>
                        </div>
                    </CardContent>
                </Card>
                <div className="w-2/3">
                  <IssuePanel projectCode={projectCode as string}/>
                </div>
            </div>
        </div>
    )
}

export default Project
