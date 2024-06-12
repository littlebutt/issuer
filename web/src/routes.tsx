import React from "react"

import { Route, Routes, Navigate } from 'react-router-dom'
import Login from "./login"


const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login"/>}></Route>
            <Route path="/login" element={<Login/>}></Route>
            <Route path="/dashboard"></Route>
        </Routes>
    )
}

export default AppRoutes