import React, { useEffect, useState } from "react"
import { useToast } from "./components/ui/use-toast"
import { Button } from "./components/ui/button"
import { UserGroup } from "./types"
import GroupTable from "./group-table"
import { getUserGroupsCount, getUserGroups, fetchUserOptions } from "./fetch"
import { Label } from "./components/ui/label"
import { Input } from "./components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "./components/ui/select"
import { MultiSelect } from "./components/ui/multi-select"

const Groups: React.FC = () => {
	const [tableContent, setTableContent] = useState<UserGroup[]>([])
	const [pageNum, setPageNum] = useState<number>(1)
	const [pageTotal, setPageTotal] = useState<number>(0)

	const [owner, setOwner] = useState<string>("")
	const [userOptions, setUserOptions] = useState<
		{ value: string; label: string }[]
	>([])
	const [selectedUsers, setSelectedUsers] = useState<any[]>([])
	const [groupName, setGroupName] = useState<string>("")
	const [members, setMembers] = useState<string>("")

	const { toast } = useToast()

	const changeUserOptions: (
		options: { label: string; value: string }[]
	) => void = options => {
		setSelectedUsers(options)
		setMembers(options.map(option => option.value).join(","))
	}

	const fetchUserGroups = (
		groupName?: string,
		owner?: string,
		members?: string,
		currentPageNum?: number
	) => {
		getUserGroups(
			"",
			groupName ?? "",
			owner ?? "",
			members ?? "",
			12,
			currentPageNum ?? pageNum
		)
			.then(res => {
				if (res.status === 200 && res.data?.success === true) {
					setTableContent(res.data?.data)
				} else {
					toast({
						title: "获取我的组织失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
	}

	const fetchUserGroupCount = (
		groupName?: string,
		owner?: string,
		members?: string
	) => {
		getUserGroupsCount("", groupName ?? "", owner ?? "", members ?? "")
			.then(res => {
				if (res.status === 200 && res.data?.success === true) {
					setPageTotal(Math.ceil(res.data?.data / 12))
				} else {
					toast({
						title: "获取我的组织失败",
						variant: "destructive"
					})
				}
			})
			.catch(err => console.log(err))
	}

	const gotoNext = () => {
		setPageNum(pageNum => Math.min(pageNum + 1, pageTotal))
		fetchUserGroups(
			groupName,
			owner,
			members,
			Math.min(pageNum + 1, pageTotal)
		)
	}

	const gotoPrevious = () => {
		setPageNum(pageNum => Math.max(pageNum - 1, 1))
		fetchUserGroups(groupName, owner, members, Math.max(pageNum - 1, 1))
	}

	const search = () => {
		fetchUserGroups(groupName, owner, members, 1)
		fetchUserGroupCount(groupName, owner, members)
	}

	const clearInput = () => {
		setGroupName("")
		setOwner("")
		setSelectedUsers([])
		setMembers("")
	}

	const refresh = () => {
		fetchUserGroups()
		fetchUserGroupCount()
	}

	useEffect(() => {
		refresh()
		fetchUserOptions(userOptions, setUserOptions)
	}, [])

	return (
		<div>
			<div className="grid grid-rows-[45px_590px] w-full px-5 py-0 gap-0 max-h-[618px]">
				<div className="flex justify-start space-x-2 space-y-1">
					<div className="flex flex-row space-x-0">
						<Label
							htmlFor="group-name"
							className="w-[70px] pt-1 text-base font-semibold"
						>
							名称
						</Label>
						<Input
							className="h-8"
							id="group-name"
							onChange={e => setGroupName(e.target.value)}
							value={groupName}
						></Input>
					</div>
					<div className="flex flex-row space-x-0 px-3">
						<Label
							htmlFor="owner"
							className="w-[70px] pt-1 text-base font-semibold"
						>
							创建者
						</Label>
						<Select onValueChange={v => setOwner(v)} value={owner}>
							<SelectTrigger className="md:w-[187px] h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{userOptions.map(o => (
									<SelectItem value={o.value}>
										{o.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex flex-row space-x-0 px-3">
						<Label className="w-[70px] pt-1 text-base font-semibold">
							成员
						</Label>
						<MultiSelect
							className="md:w-[187px] h-8"
							options={userOptions}
							value={selectedUsers}
							onChange={changeUserOptions}
						/>
					</div>
					<Button onClick={search}>搜索</Button>
					<Button variant="outline" onClick={clearInput}>
						重置
					</Button>
				</div>
				<div className="flex justify-center">
					<GroupTable
						isMine={false}
						current={pageNum}
						total={pageTotal}
						gotoNext={gotoNext}
						gotoPrevious={gotoPrevious}
						tableContent={tableContent}
						userOptions={userOptions}
						refresh={refresh}
					/>
				</div>
			</div>
		</div>
	)
}

export default Groups
