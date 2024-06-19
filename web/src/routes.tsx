import React from "react"

import { Navigate } from 'react-router-dom'
import Login from "./login"
import Layout from "./layout"
import Dashboard from "./dashboard"
import Settings from "./settings"
import MyGroup from "./my-group"


const router = [
    {
        path: "/",
        element: <Navigate to="/login"/>,
    },
    {
        path: "/login",
        element: <Login/>
    },
    {
        path: "/main/*",
        element: <Layout/>,
        children: [
            {
                path: "dashboard",
                element: <Dashboard/>
            },
            {
                path: "settings",
                element: <Settings/>
            },
            {
                path: "my-group",
                element: <MyGroup/>
            }
        ]
    }
  ]

export default router