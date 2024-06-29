import axios, { AxiosResponse } from "axios"
import { NavigateFunction } from "react-router-dom"
import { Cookie } from "./lib/cookies"
import config from "./config"


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

const getUserGroups = async (groupCode: string,
                           groupName: string,
                           owner: string,
                           members: string,
                           pageSize: number = config.pageSize,
                           pageNum: number = 1) => {
    return axios({
        method: 'GET',
        url: `/user_group/list_groups?group_code=${groupCode}&group_name=${groupName}&owner=${owner}&members=${members}&page_size=${pageSize}&page_num=${pageNum}`
    })
}

const getUserGroupsCount = async (groupCode: string,
                           groupName: string,
                           owner: string,
                           members: string) => {
    return axios({
        method: 'GET',
        url: `/user_group/count_groups?group_code=${groupCode}&group_name=${groupName}&owner=${owner}&members=${members}`
    })
}


const getProjects = async (projectCode: string,
                             projectName: string,
                             afterDate: string,
                             beforeDate: string,
                             owner: string,
                             status: string,
                             participants: string,
                             pageNum: number = 1,
                             pageSize: number = 10) => {
    return axios({
        method: 'GET',
        url: `/project/list_projects?project_code=${projectCode}&project_name=${projectName}`
            + `&after_date=${afterDate}&before_date=${beforeDate}&owner=${owner}&status=${status}&participants=${participants}&page_num=${pageNum}&page_size=${pageSize}`
    })
}

const getProjectsCount = async (projectCode: string,
                             projectName: string,
                             afterDate: string,
                             beforeDate: string,
                             owner: string,
                             status: string,
                             participants: string,) => {
    return axios({
        method: 'GET',
        url: `/project/count_projects?project_code=${projectCode}&project_name=${projectName}`
            + `&after_date=${afterDate}&before_date=${beforeDate}&owner=${owner}&status=${status}&participants=${participants}`
    })
                             }

export { fetchSelf, fetchUsers, fetchUserByCode, getUserGroups, getUserGroupsCount, getProjects, getProjectsCount }
