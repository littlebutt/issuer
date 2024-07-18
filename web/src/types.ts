type User = {
	user_code?: string
	user_name?: string
	passwd?: string
	email?: string
	role?: string
	description?: string
	phone?: string
	avatar?: string
}

type UserRole = {
	value: string
	label: string
}

type UserGroup = {
	group_code: string
	group_name: string
	owner: User
	members: User[]
}

type Project = {
	project_code: string
	project_name: string
	start_date: string
	end_date?: string
	owner: User
	status: string
	budget?: string
	privilege: string
	description?: string
	participants: User[]
}

type Issue = {
	issue_code: string
	project: Project
	issue_id: number
	title: string
	description?: string
	owner: User
	propose_date: string
	status: string
	tags?: string
	followers: User[]
	assigned?: User[]
}

export type { User, UserRole, UserGroup, Project, Issue }
