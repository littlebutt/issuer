import axios, { AxiosResponse } from "axios"
import { NavigateFunction } from "react-router-dom"
import { Cookie } from "./lib/cookies"


const fetchSelf: (cookie: Cookie, navigate: NavigateFunction) => Promise<AxiosResponse> = async (cookie, navigate) => {
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

const fetchUserByCode: (userCode: string) => Promise<AxiosResponse> = async (userCode) => {
    return axios({
        method: 'GET',
        url: `/users/user?user_code=${userCode}`
    })
}

const fetchGroups = async (groupCode: string,
                           groupName: string,
                           owner: string,
                           members: string,
                           pageSize: number = 10,
                           pageNum: number = 1) => {
    return axios({
        method: 'GET',
        url: `/user_group/list_groups?group_code=${groupCode}&group_name=${groupName}&owner=${owner}&members=${members}&page_size=${pageSize}&page_num=${pageNum}`
    })
}

const countGroups = async (groupCode: string,
                           groupName: string,
                           owner: string,
                           members: string) => {
    return axios({
        method: 'GET',
        url: `/user_group/count_groups?group_code=${groupCode}&group_name=${groupName}&owner=${owner}&members=${members}`
    })
}

export { fetchSelf, fetchUsers, fetchUserByCode, fetchGroups, countGroups }
