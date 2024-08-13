import axios from "axios"

const uploadAppendix = async (appendix: any, issueCode: string) => {
	let data = new FormData()
	data.append("file", appendix as Blob)
	data.append("issue_code", issueCode)
	return axios({
		method: "POST",
		url: "/comment/upload_appendix",
		headers: {
			"Content-Type": "multipart/form-data"
		},
		data
	})
}

const newIssueCommentApi = (
	toast: any,
	refresh: () => void,
	issueCode: string,
	content: string
) => {
	axios({
		method: "POST",
		url: "/comment/new",
		data: {
			issue_code: issueCode,
			appendices: "",
			content
		}
	})
		.then(res => {
			if (res.status === 200 && res.data.success === true) {
				toast({
					title: "评论成功",
					variant: "success"
				})
				refresh()
			} else {
				toast({
					title: "评论失败",
					variant: "desctructive"
				})
			}
		})
		.catch(err => console.log(err))
}

const foldIssueCommentApi = (
	toast: any,
	refresh: () => void,
	commentCode: string,
	issueCode: string
) => {
	axios({
		method: "POST",
		url: "/comment/fold",
		data: {
			comment_code: commentCode,
			issue_code: issueCode
		}
	})
		.then(res => {
			if (res.status === 200 && res.data.success === true) {
				toast({
					title: "折叠成功",
					variant: "success"
				})
				refresh()
			} else {
				toast({
					title: "折叠失败",
					variant: "desctructive"
				})
			}
		})
		.catch(err => console.log(err))
}

export { uploadAppendix, newIssueCommentApi, foldIssueCommentApi }
