import axios, { AxiosResponse } from "axios"
import { NavigateFunction } from "react-router-dom"
import { Cookie } from "./lib/cookies"


const fetchUser: (cookie: Cookie, navigate: NavigateFunction) => Promise<AxiosResponse> = async (cookie, navigate) => {
    let current_user = cookie.getCookie("current_user")
    if (!current_user) {
        cookie.setCookie("current_user", "", {expires: -1})
        navigate("/login")
    }
    if (typeof current_user !== 'string') {
        throw Error("Bad Cookie")
    }
    let user_code = current_user?.split(":")[0]
    return axios({
        method: 'GET',
        url: `/users/user?user_code=${user_code}`
    })
}

const fetchUsers: (pageNum: number, pageSize: number) => Promise<AxiosResponse> = async (pageNum, pageSize) => {
    return axios({
        method: 'GET',
        url: `/users/users?page_num=${pageNum}&page_size=${pageSize}`
    })
}

export { fetchUser, fetchUsers }
