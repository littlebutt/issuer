import axios, { AxiosResponse } from "axios"
import { NavigateFunction } from "react-router-dom"


const fetchUser: (cookie: any, navigate: NavigateFunction) => Promise<AxiosResponse> = async (cookie, navigate) => {

    let current_user = cookie.getCookie("current_user")
    if (!current_user) {
        cookie.setCookie("current_user", "", {expires: -1})
        navigate("/login")
    }
    let user_code = current_user?.split(":")[0]
    return axios({
        method: 'GET',
        url: `/users/user?user_code=${user_code}`
    })
}

export default fetchUser
