import React from "react"
import { useParams } from "react-router-dom"

const Project: React.FC = () => {
	const { projectCode } = useParams()
	return <>{projectCode}</>
}

export default Project
