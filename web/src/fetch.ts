import axios from "axios"
import { User } from "./types"


const fetchUser: (cookie: any, navigate: any) => User = (cookie, navigate) => {

    let user: User = {}

    let current_user = cookie.getCookie("current_user")
    if (!current_user) {
        cookie.setCookie("current_user", "", {expires: -1})
        navigate("/login")
    }
    let user_code = current_user?.split(":")[0]
    axios({
        method: 'GET',
        url: `/users/user?user_code=${user_code}`
    }).then(res => {
        try {
                user.user_code = res.data.user_code
                user.user_name = res.data.user_name
                user.email = res.data.email
                user.role = res.data.role
                user.description = res.data?.description
                user.phone = res.data?.phone
                user.avatar = res.data?.avatar
        }
        catch (err){
            cookie.setCookie("current_user", "", {expires: -1})
            navigate("/login")
        }    
    }).catch(err => {
        console.log(err)
    })
    return user
}

export default fetchUser
