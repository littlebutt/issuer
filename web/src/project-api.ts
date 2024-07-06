import { format } from "date-fns"
import axios from "axios"

const updateProjectApi = (
    toast:any,
    refresh: () => void,
    projectCode: string,
	projectName: string,
	owner: string,
	projectStatus: string,
	noBudget: boolean,
	privilege: string,
	endDate?: Date,
	budget?: number,
	description?: string
) => {
    let endDateParam = endDate ? format(endDate, "yyyy-MM-dd") : ""
		let budgetParam = noBudget ? "" : (budget as number).toString()
		axios({
			method: "POST",
			url: "/project/change",
			data: {
				project_code: projectCode,
				project_name: projectName,
				end_date: endDateParam,
				status: projectStatus,
				owner,
				description,
				budget: budgetParam,
				privilege
			}
		})
			.then(res => {
				if (res.status === 200 && res.data?.success === true) {
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

const deleteProjectApi = (
    toast:any,
    refresh: () => void,
    projectCode: string
) => {
    axios({
        method: "POST",
        url: "/project/delete",
        data: {
            project_code: projectCode
        }
    })
        .then(res => {
            if (res.status === 200 && res.data?.success === true) {
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

const addProjectApi = (toast: any, refresh: () => void, projectCode: string, newMember: string) => {
    axios({
        method: "POST",
        url: "/project/add",
        data: {
            project_code: projectCode,
            new_member: newMember
        }
    }).then(res => {
        if (res.status === 200 && res.data.success === true) {
            toast({
                title: "加入成功",
                variant: "success"
            })
            refresh()
        } else {
            toast({
                title: "加入失败",
                variant: "destructive"
            })
        }
    })
}

export { updateProjectApi, deleteProjectApi, addProjectApi }