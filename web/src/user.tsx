import React from "react"
import { useParams } from "react-router-dom"

const User: React.FC = () => {
	const { userCode } = useParams()
	return <div className="flex flex-row"></div>
}

export default User
