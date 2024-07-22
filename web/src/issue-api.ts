import axios from "axios"

const newIssueApi = (
	toast: any,
	refresh: (issueCode: string) => void,
	projectCode: string,
	title: string,
	description: string,
	tags: string,
	assigned: string
) => {
	axios({
		method: "POST",
		url: "/issue/new",
		data: {
			project_code: projectCode,
			title,
			description,
			tags,
			assigned
		}
	})
		.then(res => {
			if (res.status === 200 && res.data.success === true) {
				toast({
					title: "新增成功",
					variant: "success"
				})
				refresh(res.data.data)
			} else {
				toast({
					title: "新增失败",
					variant: "destructive"
				})
			}
		})
		.catch(err => console.log(err))
}

const updateIssueApi = (
	toast: any,
	refresh: () => void,
	issueCode: string,
	status: string,
	tags: string,
	followers: string,
	assigned: string
) => {
	axios({
		method: "POST",
		url: "/issue/change",
		data: {
			issue_code: issueCode,
			status,
			tags,
			followers,
			assigned
		}
	})
		.then(res => {
			if (res.status === 200 && res.data.success === true) {
				toast({
					title: "新增成功",
					variant: "success"
				})
				refresh()
			} else {
				toast({
					title: "新增失败",
					variant: "destructive"
				})
			}
		})
		.catch(err => console.log(err))
}

const deleteIssueApi = (toast: any, refresh: () => void, issueCode: string) => {
	axios({
		method: "POST",
		url: "/issue/delete",
		data: {
			issue_code: issueCode
		}
	})
		.then(res => {
			if (res.status === 200 && res.data.success === true) {
				toast({
					title: "删除成功",
					variant: "success"
				})
				refresh()
			} else {
				toast({
					title: "删除失败",
					variant: "destructive"
				})
			}
		})
		.catch(err => console.log(err))
}

const followIssueApi = (
	toast: any,
	refresh: () => void,
	issueCode: string,
	action: number
) => {
	axios({
		method: "GET",
		url: `/issue/follow?issue_code=${issueCode}&action=${action}`
	})
		.then(res => {
			if (res.status === 200 && res.data.success === true) {
				toast({
					title: "关注成功",
					variant: "success"
				})
				refresh()
			} else {
				toast({
					title: "关注失败",
					variant: "destructive"
				})
			}
		})
		.catch(err => console.log(err))
}

export { newIssueApi, updateIssueApi, deleteIssueApi, followIssueApi }
