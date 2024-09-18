import React, { createContext, useContext, useState } from 'react'

const apiContext = createContext();
export const useApi = () => {
    return useContext(apiContext);
}
export const ApiProvider = ({ children }) => {
    // const [apiUrl] = useState('http://localhost:3000/api/v1')
    const [apiUrl] = useState(`${process.env.URL}/api/v1`)
    return (
        <apiContext.Provider value={apiUrl} >
            { children }
        </apiContext.Provider>
    )
}
