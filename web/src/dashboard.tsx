import React, { useState } from "react"
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger
} from "./components/ui/drawer"
import { Button } from "./components/ui/button"
import { Label } from "./components/ui/label"
import { Input } from "./components/ui/input"
import { useForm } from "react-hook-form"
import { newGroupApi } from "./group-api"
import { useToast } from "./components/ui/use-toast"

const Dashboard: React.FC = () => {
	// TODO: 后期清理
	const {
		register,
		formState: { errors },
		handleSubmit
	} = useForm()

	const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
	const [groupName, setGroupName] = useState<string>("")

	const { toast } = useToast()

	const newGroup = () => {
		newGroupApi(
			toast,
			() => {
				setDrawerOpen(false)
			},
			groupName
		)
	}

	return (
		<div>
			<Drawer
				direction="right"
				open={drawerOpen}
				onOpenChange={setDrawerOpen}
			>
				<DrawerTrigger asChild>
					<Button className="">新增</Button>
				</DrawerTrigger>
				<DrawerContent>
					<div className="my-auto h-full w-full">
						<DrawerHeader>
							<DrawerTitle>新增组织</DrawerTitle>
						</DrawerHeader>
						<div className="p-4 pb-0 w-full">
							<form>
								<div className="mt-3 h-[520px] flex flex-col space-y-2">
									<div className="flex flex-col space-y-1">
										<Label htmlFor="groupName">
											名称
											{errors.groupName && (
												<span className="text-red-500">
													{" "}
													请填写名称
												</span>
											)}
										</Label>
										<Input
											id="groupname"
											{...register("groupName", {
												required: true
											})}
											onChange={e =>
												setGroupName(e.target.value)
											}
										/>
									</div>
								</div>
							</form>
						</div>
						<DrawerFooter>
							<Button onClick={handleSubmit(newGroup)}>
								确定
							</Button>
							<DrawerClose asChild>
								<Button variant="outline">取消</Button>
							</DrawerClose>
						</DrawerFooter>
					</div>
				</DrawerContent>
			</Drawer>
		</div>
	)
}

export default Dashboard
