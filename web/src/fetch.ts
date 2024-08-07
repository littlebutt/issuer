import axios, { AxiosResponse } from "axios"
import { NavigateFunction } from "react-router-dom"
import { Cookie } from "./lib/cookies"

const fetchSelf: (
	cookie: Cookie,
	navigate: NavigateFunction
) => Promise<AxiosResponse> = async (cookie, navigate) => {
	let current_user = cookie.getCookie("current_user")
	if (!current_user) {
		cookie.setCookie("current_user", "", { expires: -1 })
		navigate("/login")
	}
	if (typeof current_user !== "string") {
		throw Error("Bad Cookie")
	}
	let user_code = current_user?.split(":")[0]
	return axios({
		method: "GET",
		url: `/users/user?user_code=${user_code}`
	})
}

const getUser = (userCode: string) => {
	return axios({
		method: "GET",
		url: `/users/user?user_code=${userCode}`
	})
}

const fetchUsers: (
	pageNum: number,
	pageSize: number
) => Promise<AxiosResponse> = async (pageNum, pageSize) => {
	return axios({
		method: "GET",
		url: `/users/users?page_num=${pageNum}&page_size=${pageSize}`
	})
}

const fetchUserOptions: (
	getter: { value: string; label: string }[],
	setter: React.Dispatch<
		React.SetStateAction<{ value: string; label: string }[]>
	>
) => void = (getter, setter) => {
	// FIXME: 添加下拉菜单分页功能
	fetchUsers(1, 999)
		.then(res => {
			if (res.status === 200 && res.data.success === true) {
				res.data.data.map(
					(user: { user_code: any; user_name: any }) => {
						getter.push({
							value: user.user_code,
							label: user.user_name
						})
					}
				)
				setter([...getter])
			} else {
				console.log(res)
			}
		})
		.catch(err => console.log(err))
}

const fetchProjectStatuses: (
	getter: { value: string; label: string }[],
	setter: React.Dispatch<
		React.SetStateAction<{ value: string; label: string }[]>
	>
) => void = (getter, setter) => {
	axios({
		method: "GET",
		url: "/project/query_status"
	})
		.then(res => {
			if (res.status === 200 && res.data?.success === true) {
				setter(res.data.data)
			} else {
				console.log(res)
			}
		})
		.catch(err => console.log(err))
}

const fetchProjectPrivileges: (
	getter: { value: string; label: string }[],
	setter: React.Dispatch<
		React.SetStateAction<{ value: string; label: string }[]>
	>
) => void = (getter, setter) => {
	axios({
		method: "GET",
		url: "/project/query_privileges"
	})
		.then(res => {
			if (res.status === 200 && res.data?.success === true) {
				setter(res.data.data)
			} else {
				console.log(res)
			}
		})
		.catch(err => console.log(err))
}

const fetchUserRoles = (
	getter: { value: string; label: string }[],
	setter: React.Dispatch<
		React.SetStateAction<{ value: string; label: string }[]>
	>
) => {
	axios({
		method: "GET",
		url: "/users/roles"
	})
		.then(res => {
			if (res.status === 200 && res.data.success === true) {
				setter(res.data.data)
			} else {
				console.log(res)
			}
		})
		.catch(err => console.log(err))
}

const fetchIssueStatuses = (
	getter: { value: string; label: string }[],
	setter: React.Dispatch<
		React.SetStateAction<{ value: string; label: string }[]>
	>
) => {
	axios({
		method: "GET",
		url: "/issue/query_status"
	})
		.then(res => {
			if (res.status === 200 && res.data.success === true) {
				setter(res.data.data)
			} else {
				console.log(res)
			}
		})
		.catch(err => console.log(err))
}

const getUserGroups = async (
	groupCode: string,
	groupName: string,
	owner: string,
	members: string,
	pageSize: number = 12,
	pageNum: number = 1
) => {
	return axios({
		method: "GET",
		url: `/user_group/list_groups?group_code=${groupCode}&group_name=${groupName}&owner=${owner}&members=${members}&page_size=${pageSize}&page_num=${pageNum}`
	})
}

const getUserGroupsCount = async (
	groupCode: string,
	groupName: string,
	owner: string,
	members: string
) => {
	return axios({
		method: "GET",
		url: `/user_group/count_groups?group_code=${groupCode}&group_name=${groupName}&owner=${owner}&members=${members}`
	})
}

const getProjects = async (
	projectCode: string,
	projectName: string,
	afterDate: string,
	beforeDate: string,
	owner: string,
	status: string,
	participants: string,
	pageNum: number = 1,
	pageSize: number = 10
) => {
	return axios({
		method: "GET",
		url:
			`/project/list_projects?project_code=${projectCode}&project_name=${projectName}` +
			`&after_date=${afterDate}&before_date=${beforeDate}&owner=${owner}&status=${status}&participants=${participants}&page_num=${pageNum}&page_size=${pageSize}`
	})
}

const getProjectsCount = async (
	projectCode: string,
	projectName: string,
	afterDate: string,
	beforeDate: string,
	owner: string,
	status: string,
	participants: string
) => {
	return axios({
		method: "GET",
		url:
			`/project/count_projects?project_code=${projectCode}&project_name=${projectName}` +
			`&after_date=${afterDate}&before_date=${beforeDate}&owner=${owner}&status=${status}&participants=${participants}`
	})
}

const getProjectDailyStat = async (
	projectCode: string,
	afterDate: string,
	beforeDate: string
) => {
	return axios({
		method: "GET",
		url: `/project/stat_date?project_code=${projectCode}&before_date=${beforeDate}&after_date=${afterDate}`
	})
}

const getProjectStatusStat = async (
	projectCode: string,
	afterDate: string,
	beforeDate: string
) => {
	return axios({
		method: "GET",
		url: `/project/stat_status?project_code=${projectCode}&before_date=${beforeDate}&after_date=${afterDate}`
	})
}

const getIssues = async (
	issue_code: string,
	project_code: string,
	issue_id: string,
	title: string,
	description: string,
	owner: string,
	propose_date: string,
	status: string,
	tags: string,
	followers: string,
	assigned: string,
	pageNum: number = 1,
	pageSize: number = 10
) => {
	return axios({
		method: "GET",
		url: `/issue/list_issues?issue_code=${issue_code}&project_code=${project_code}&issue_id=${issue_id}&title=${title}&description=${description}&owner=${owner}&propose_date=${propose_date}&status=${status}&tags=${tags}&followers=${followers}&assigned=${assigned}&page_num=${pageNum}&page_size=${pageSize}`
	})
}

const getIssuesCount = async (
	issue_code: string,
	project_code: string,
	issue_id: string,
	title: string,
	description: string,
	owner: string,
	propose_date: string,
	status: string,
	tags: string,
	followers: string,
	assigned: string
) => {
	return axios({
		method: "GET",
		url: `/issue/count_issues?issue_code=${issue_code}&project_code=${project_code}&issue_id=${issue_id}&title=${title}&description=${description}&owner=${owner}&propose_date=${propose_date}&status=${status}&tags=${tags}&followers=${followers}&assigned=${assigned}`
	})
}

const getCommentsByCode = async (issueCode: string) => {
	return axios({
		method: "GET",
		url: `/comment/list_comments_by_code?issue_code=${issueCode}`
	})
}

const getCommentsByCommenter = async (userCode: string) => {
	return axios({
		method: "GET",
		url: `/comment/list_comments_by_commenter?user_code=${userCode}`
	})
}

export {
	fetchSelf,
	fetchUserOptions,
	fetchProjectStatuses,
	fetchProjectPrivileges,
	fetchUserRoles,
	fetchIssueStatuses,
	getUser,
	getUserGroups,
	getUserGroupsCount,
	getProjects,
	getProjectsCount,
	getProjectDailyStat,
	getProjectStatusStat,
	getIssues,
	getIssuesCount,
	getCommentsByCode,
	getCommentsByCommenter
}
