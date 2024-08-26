import React from 'react'
import { useForm } from "react-hook-form"
import '../Signup/Signup.css'
const Signup = () => {
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
}

  return (
    <div className='signupContainer'>
        <form className='signupForm' onSubmit={handleSubmit(onSubmit)}>
        
         <div className="formGroup">
          <label htmlFor='username'>Enter Username :</label>  
          <input id='username' placeholder="enter username" {...register("username", { required: { value: true, message: 'Required' }, minLength: { value: 5, message: 'Length should be more than 5' } })} />  
          {errors.username && <span style={{ color: 'red' }}>{errors.username.message}</span>} 
         </div>

         <div className="formGroup">
          <label htmlFor='password'>Enter Password :</label>  
          <input id='password' type='password' placeholder='enter password' {...register('password',
          { required: { value: true, message: 'Required' }, })} /> 
          {errors.password && <span style={{ color: 'red' }}>{errors.password.message}</span>} 
          </div>
        
             


        
        

          <button className='signupBtn'>Signup</button>
        </form>
      
    </div>
  )
}

export default Signup
