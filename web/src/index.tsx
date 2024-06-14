import React from "react"

import ReactDOM from "react-dom/client"
import "./styles/globals.css"
import "./lib/utils"
import router from "./routes"
import {  RouterProvider, createBrowserRouter } from "react-router-dom"

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
)

root.render(
    <React.StrictMode>
        <RouterProvider router={createBrowserRouter(router)} />
    </React.StrictMode>
)