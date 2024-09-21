import React from 'react'
import './Logo.css'
import { useNavigate } from 'react-router-dom'
const Logo = ({customStyle}) => {
  const navigate=useNavigate()
  return (
    <div onClick={()=>{navigate('/')}} className={`logo ${customStyle}`}>
      Pictogram
    </div>
  )
}

export default Logo
