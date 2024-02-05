import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { auth } from '../_actions/user_action';

// option
// null => 아무나 출입이 가능한 페이지
// true => 로그인한 유저만 출입이 가능한 페이지 ('/')
// false => 로그인한 유저는 출입 불가능한 페이지 ('/login', '/register)
const Auth = (SpecificComponent, option, adminRoute = null) => {
    
    function AuthenticationCheck(props){
        const dispatch = useDispatch();
        const navigate = useNavigate();

        useEffect(() => {
            dispatch(auth()).then(response => {

                if(!response.payload.isAuth){
                    // 로그인 하지 않은 상태
                    if(option){
                        navigate("/login");
                    }
                } else{
                    if(adminRoute && !response.payload.isAdmin){
                        console.log("here1111")
                        navigate("/");
                    } else{
                        if(option === false){
                            navigate("/");
                        }
                    }
                }
            })
        }, []);

        return (
            <SpecificComponent />
        )
    }
    return AuthenticationCheck;
}

export default Auth;