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
    members: string
}

export type { User, UserRole, UserGroup }