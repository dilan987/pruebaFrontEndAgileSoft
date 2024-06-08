import React from 'react'
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import './login.css'

const Login = () => {

    return (
        < div className='container'>
            <div className='header'>
                <div className='text'> Login</div>
                <div className='underline'></div>
            </div>
            <div className='inputs'>
                <input type='text' placeholder='Name' required/>
                <FaUser className='icon'/> 
            </div>
            <div className='inputs'>
                <input type='text' placeholder='Password' required/>
                <RiLockPasswordFill className='icon'/>
            </div>

            <button type="submit">Login</button>
        </div>
    )
}
<></>
export default Login