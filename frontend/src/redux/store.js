import { combineReducers, configureStore } from '@reduxjs/toolkit'
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import authSlice from './authSlice.js'
import postSlice from './postSlice.js'
import socketSlice from './socketSlice.js'
import chatSlice from './chatSlice.js'
import rtnSlice from './rtnSlice.js'
import rtnMsg from './rtnMsg.js'
import rtnFollow from './rtnFollow.js'
import offlineSlice from './offlineSlice.js'


const persistConfig = {
  key: 'root',
  version: 1,
  storage,
}

const rootReducer = combineReducers({
  auth: authSlice,
  post: postSlice,
  socketio:socketSlice,
  chat:chatSlice,
  rtn:rtnSlice,
  rtnMsg,
  rtnFollow,
  offlineSlice
})
const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = new configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})
export default store;