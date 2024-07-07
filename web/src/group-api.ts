import axios from "axios"

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

const deleteGroupApi = (toast: any, refresh: () => void, groupCode: string) => {
	axios({
		method: "POST",
		url: "/user_group/delete",
		data: {
			group_code: groupCode
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

const values2labels = (
	values: string[],
	options: { value: string; label: string }[]
) => {
	let values_dc: string[] = JSON.parse(JSON.stringify(values))
	return values_dc.map(v => {
		for (let item of options) {
			if (item.value === v) {
				return item.label
			}
		}
		return v
	})
}

export { updateGroupApi, deleteGroupApi, addGroupApi, values2labels }
