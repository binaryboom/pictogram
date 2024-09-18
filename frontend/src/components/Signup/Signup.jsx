import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useForm } from "react-hook-form"
import '../Signup/Signup.css'
import Logo from '../Logo/Logo'
import { useApi } from '../../context/apiContext'
import { useAlert } from '../../context/AlertContext'
import { Link,Navigate,useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const Signup = () => {
  const navigate=useNavigate();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const apiUrl = useApi()
  console.log(apiUrl)
  const {user}=useSelector(store=>store.auth)
  useEffect(()=>{
    if(user){
      navigate('/')
    }
  },[])
  const {
    register,
    handleSubmit,
    watch,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm()

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
      let req = await fetch(`${apiUrl}/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      res = await req.json()
      console.log(res)

    } catch (error) {
      res = { success: false, message: 'Unable to connect with server' }
      console.log(error)
      showAlert(res)
    }
    finally {
      res.success ?( reset(),navigate('/login',{state:data.email}) ): null
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
              Sign up to see photos and videos <br /> from your friends.
            </div>
          </div>

          <div className="formGroup">
            <label htmlFor='email'>Enter Email :</label>
            <input id='email' placeholder="enter email" {...register("email", {
              required: { value: true, message: 'Required' }, pattern: {
                value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                message: 'Invalid email address',
              },
            })} />
            {errors.email && <div className='error'>{errors.email.message}</div>}
          </div>

          <div className="formGroup">
            <label htmlFor='username'>Enter Username :</label>
            <input id='username' placeholder="enter username" {...register("username", { required: { value: true, message: 'Required' }, minLength: { value: 5, message: 'Length should be more than 5' },
            maxLength: { value: 12, message: 'Maximum 12 characters allowed' } })} />
            {errors.username && <div className='error'>{errors.username.message}</div>}
          </div>

          <div className="formGroup">
            <label htmlFor='password'>Enter Password :</label>
            <input id='password' type='password' placeholder='enter password' {...register('password',
              {
                maxLength: { value: 12, message: 'Maximum 12 characters allowed' },
                required: { value: true, message: 'Required' }, pattern: {
                  value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
                  message:
                    'Password must be at least 6 characters long and include at least one letter, one number, and one special character',
                },
              })} />
            {errors.password && <div className='error'>{errors.password.message}</div>}
          </div>


          <button className='signupBtn'>Signup</button>
          <div className="redirect">
            Already have an account? <Link to='/login' style={{ color: '#0095F6' }}>Login</Link>
          </div>
        </form>

      </div>
    </>
  )
}

export default Signup
