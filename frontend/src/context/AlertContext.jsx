import React, { createContext, useState, useContext } from 'react';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  const showAlert = (res, duration = 3000) => {
    const backgroundColor = res.success ? 'green' : 'red';
    
    const iconClass = res.success 
    ? 'fa-regular fa-lg fa-circle-check' 
    : 'fa-regular fa-lg fa-circle-xmark';
    
    setAlert({ message: res.message, backgroundColor ,iconClass});
    setTimeout(() => {
      setAlert(null);
    }, duration);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert && (
        <div className="alert" style={{ backgroundColor: alert.backgroundColor }}>
          <i className={alert.iconClass} style={{marginRight:'0.3rem'}} ></i>
          {alert.message}
        </div>
      )}
    </AlertContext.Provider>
  );
};
