import axios from "axios"

const newGroupApi = (toast: any, refresh: () => void, groupName: string) => {
	axios({
		method: "POST",
		url: "/user_group/new",
		data: {
			group_name: groupName
		}
	})
		.then(res => {
			if (res.status === 200 && res.data.success === true) {
				toast({
					title: "新建成功",
					variant: "success"
				})
			} else {
				toast({
					title: "新建失败",
					variant: "destructive"
				})
			}
			refresh()
		})
		.catch(err => console.log(err))
}

const updateGroupApi = (
	toast: any,
	refresh: () => void,
	groupCode: string,
	groupName: string,
	owner: string,
	members: string
) => {
	axios({
		method: "POST",
		url: "/user_group/change",
		data: {
			group_code: groupCode,
			group_name: groupName,
			owner,
			members
		}
	})
		.then(res => {
			if (res.status === 200 && res.data.success === true) {
				toast({
					title: "更新成功",
					variant: "success"
				})
				refresh()
			} else {
				toast({
					title: "更新失败",
					variant: "destructive"
				})
			}
		})
		.catch(err => console.log(err))
}

const addGroupApi = (
	toast: any,
	refresh: () => void,
	newMember: string,
	groupCode: string
) => {
	axios({
		method: "POST",
		url: "/user_group/add",
		data: {
			group_code: groupCode,
			new_member: newMember
		}
	})
		.then(res => {
			if (res.status === 200 && res.data.success === true) {
				toast({
					title: "加入成功",
					variant: "success"
				})
			} else {
				toast({
					title: "加入失败",
					variant: "destructive"
				})
			}
			refresh()
		})
		.catch(err => console.log(err))
}

export { updateGroupApi, addGroupApi, newGroupApi }
