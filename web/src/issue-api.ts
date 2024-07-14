import axios from "axios"

const newIssueApi = (
	toast: any,
	refresh: () => void,
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
	}).then(res => {
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
}

export { newIssueApi }
