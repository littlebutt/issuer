import { Avatar, AvatarImage } from "./components/ui/avatar"
import { AvatarCircles } from "./components/ui/avatar-circle"
import { Badge } from "./components/ui/badge"
import { Issue, Project, User } from "./types"

const formatMembers = (members: User[]) => {
	if (members === undefined) {
		return <AvatarCircles avatarUrls={[]} />
	}
	let end = Math.min(5, members.length)
	let res = []
	for (let i = 0; i < end; i++) {
		res.push(members[i]?.avatar ?? "/statics/avatar.png")
	}
	return <AvatarCircles avatarUrls={res} numPeople={members.length} />
}

const formatOwner = (owner: User) => {
	return (
		<a
			className="hover:underline items-end"
			href={`/#/main/user/${owner?.user_code}`}
		>
			<div className="flex flex-row">
				<Avatar className="h-6 w-6">
					<AvatarImage
						src={
							owner?.avatar ? owner.avatar : "/statics/avatar.png"
						}
					/>
				</Avatar>
				{owner?.user_name}
			</div>
		</a>
	)
}

const formatProject = (project?: Project) => {
	return (
		<a
			className="hover:underline"
			href={`/#/main/project/${project?.project_code}`}
		>
			{project?.project_name}
		</a>
	)
}

const formatIssue = (issue?: Issue) => {
	return (
		<a
			className="hover:underline"
			href={`/#/main/issue/${issue?.issue_code}`}
		>
			{issue?.title}
		</a>
	)
}

const statusValue2label = (
	value: string,
	projectStatuses: { label: string; value: string }[]
) => {
	if (value === "checked") {
		return <Badge variant="gray">完工</Badge>
	}

	for (let item of projectStatuses) {
		if (item.value === value) {
			return <Badge>{item.label}</Badge>
		}
	}
	return <Badge variant="destructive">unknown</Badge>
}

export {
	formatMembers,
	formatOwner,
	statusValue2label,
	formatProject,
	formatIssue
}
