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
export type { User, UserRole }