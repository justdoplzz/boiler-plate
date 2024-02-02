import React, { useState } from "react";
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from "../../../_actions/user_action";

function LoginPage(){
    const dispatch = useDispatch();
    let navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onEmailHandler = (e) => {
        setEmail(e.target.value);
    }

    const onPasswordHandler = e => {
        setPassword(e.target.value);
    }

    const onSubmitHandler = (e) => {
        e.preventDefault();

        const body = {
            email: email,
            password, password,
        }

        dispatch(loginUser(body))
            .then(response => {
                if(response.payload.loginSuccess){
                    navigate('/');
                } else{
                    alert('Error');
                }
            })
    }


    return(
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100vh' }}>
            <form style={{ display: 'flex', flexDirection: 'column' }}
                    onSubmit={onSubmitHandler}
            >
                <label>Email</label>
                <input type="email" value={email} onChange={onEmailHandler}/>
                <label>Password</label>
                <input type="password" value={password} onChange={onPasswordHandler}/>
                <br />
                <button>
                    Login
                </button>
            </form>
        </div>
    )
}

export default LoginPage;