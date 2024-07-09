import React from "react"

import { Navigate } from "react-router-dom"
import Login from "./login"
import Layout from "./layout"
import Dashboard from "./dashboard"
import Settings from "./settings"
import MyGroup from "./my-group"
import Groups from "./groups"
import MyProject from "./my-project"
import Projects from "./projects"
import User from "./user"
import Project from "./project"

const router = [
	{
		path: "/",
		element: <Navigate to="/login" />
	},
	{
		path: "/login",
		element: <Login />
	},
	{
		path: "/main/*",
		element: <Layout />,
		children: [
			{
				path: "dashboard",
				element: <Dashboard />
			},
			{
				path: "settings",
				element: <Settings />
			},
			{
				path: "my-group",
				element: <MyGroup />
			},
			{
				path: "groups",
				element: <Groups />
			},
			{
				path: "my-project",
				element: <MyProject />
			},
			{
				path: "projects",
				element: <Projects />
			},
			{
				path: "user/:userCode",
				element: <User />
			},
			{
				path: "project/:projectCode",
				element: <Project />
			}
		]
	}
]

export default router
