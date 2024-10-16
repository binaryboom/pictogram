import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useForm } from "react-hook-form"
import '../Signup/Signup.css'
import Logo from '../Logo/Logo'
import { useApi } from '../../context/apiContext'
import { useAlert } from '../../context/AlertContext'
import { Link ,Navigate, useLocation, useNavigate} from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthUser } from '../../redux/authSlice.js'

const Login = () => {
  const location = useLocation();
  const data = location.state; 
  console.log(data)
  const dispatch=useDispatch()
  const navigate=useNavigate()
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const apiUrl = useApi()
  console.log(apiUrl)
  const {user}=useSelector(store=>store.auth)
  const {
    register,
    handleSubmit,
    watch,
    reset,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm()
 
  useEffect(()=>{
    if(user){
      navigate('/')
    }
    if (data) {
      setValue('usernameEmail', data.email);
      setValue('password', data.password);
    }
  },[])
  
  const onSubmit = async (data) => {
    console.log(data)
    let res;
    try {
      setLoading(true)
      const headers = {
        'Content-Type': 'application/json'
      }

      // res = await axios.post(`${apiUrl}/user/register`, data,
      //   { headers: headers, withCredentials: true }
      // )
      let req=await fetch(`${apiUrl}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      res=await req.json()
      console.log(res)

    } catch (error) {
      res={success:false,message:'Unable to connect with server'}
      console.log(error)
      showAlert(res)
    }
    finally {
      res.success? (reset(),navigate('/'),dispatch(setAuthUser(res.user)) ):null
      showAlert(res)
      setLoading(false)
    }
  }

  return (
    <>
      {loading && (
        <div className="loader-container">
          <span className="loader"></span>
        </div>
      )}

      <div className='signupContainer'>
        <form className='signupForm' onSubmit={handleSubmit(onSubmit)}>

          <div className="formGroup">
            <Logo />
            <div className="signupText">
              Login to see photos and videos <br /> from your friends.
            </div>
          </div>


          <div className="formGroup">
            <label htmlFor='usernameEmail'>Enter Username / Email :</label>
            <input id='usernameEmail' placeholder="enter username / email" {...register("usernameEmail", { required: { value: true, message: 'Required' }, minLength: { value: 5, message: 'Length should be more than 5' } })}
            onInput={(e) => e.target.value = e.target.value.toLowerCase().replace(/\s/g, '')} />
            {errors.usernameEmail && <div className='error'>{errors.usernameEmail.message}</div>}
          </div>

          <div className="formGroup">
            <label htmlFor='password'>Enter Password :</label>
            <input id='password' type='password' placeholder='enter password' {...register('password',
              {
                required: { value: true, message: 'Required' }, 
                maxLength: { value: 12, message: 'Maximum 12 characters allowed' }
                // pattern: {
                //   value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
                //   message:
                //     'Password must be at least 6 characters long and include at least one letter, one number, and one special character',
                // },
              })} />
            {errors.password && <div className='error'>{errors.password.message}</div>}
          </div>

          <button className='signupBtn'>Login</button>
          <div className="redirect">
        Don't have an account? <Link to='/signup' style={{color:'#0095F6'}}>Signup</Link>
          </div>
        </form>

      </div>
    </>
  )
}

export default Login
