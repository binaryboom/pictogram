import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApiProvider } from './context/apiContext.jsx'
import { AlertProvider } from './context/AlertContext.jsx'
import { Provider } from 'react-redux'
import store from './redux/store.js'
import App from './App.jsx'
import './index.css'
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'

let persistor = persistStore(store)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AlertProvider>
          <ApiProvider>
            <App />
          </ApiProvider>
        </AlertProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
