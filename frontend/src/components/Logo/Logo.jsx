import React from 'react'
import './Logo.css'
const Logo = ({customStyle}) => {
  return (
    <div className={`logo ${customStyle}`}>
      Pictogram
    </div>
  )
}

export default Logo
