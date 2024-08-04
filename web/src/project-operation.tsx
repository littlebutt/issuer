import React from "react"
import { Project } from "./types"
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from "./components/ui/popover"
import { Button } from "./components/ui/button"
import { cn } from "./lib/utils"
import { useCookie } from "./lib/cookies"
import { Plus } from "lucide-react"

import { useToast } from "./components/ui/use-toast"
import { addProjectApi } from "./project-api"
import ProjectEdit from "./project-edit"

interface IProjectOperation {
	isMine: boolean
	content: Project
	userOptions: { value: string; label: string }[]
	projectStatuses: { value: string; label: string }[]
	projectPrivileges: { value: string; label: string }[]
	refresh: () => void
	className?: string
}

const ProjectOperation: React.FC<IProjectOperation> = props => {
	const cookie = useCookie()

	const { toast } = useToast()

	const isProjectParticipant = (content: Project) => {
		let user_code = cookie.getCookie("current_user")?.split(":")[0]
		let res = false
		content.participants.forEach(participant => {
			if (participant.user_code === user_code) {
				res = true
			}
		})
		return res
	}

	const addProject = (newMember: string, projectCode: string) => {
		addProjectApi(toast, props.refresh, projectCode, newMember)
	}

	return (
		<div className={cn("w-full h-full space-x-1", props.className)}>
			{!props.isMine && (
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							disabled={isProjectParticipant(props.content)}
						>
							<Plus className="h-4 w-4" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[140px] h-[40px] flex flex-row justify-center items-center text-xs space-x-1 p-0 my-0">
						<p>确认加入？</p>
						<Button
							size="sm"
							variant="link"
							className="p-1.5 [line-height:10px] text-xs"
							onClick={() => {
								addProject(
									cookie
										.getCookie("current_user")
										?.split(":")[0] as string,
									props.content.project_code
								)
							}}
						>
							确认
						</Button>
					</PopoverContent>
				</Popover>
			)}
			<ProjectEdit
				project={props.content}
				userOptions={props.userOptions}
				projectStatuses={props.projectStatuses}
				projectPrivileges={props.projectPrivileges}
				refresh={props.refresh}
			/>
		</div>
	)
}

export default ProjectOperation
