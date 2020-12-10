import {configureStore, getDefaultMiddleware} from '@reduxjs/toolkit'
import thunk from 'redux-thunk'

import rootReducer from './reducer'

const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: getDefaultMiddleware().concat(thunk),
})

export type RootState = ReturnType<typeof store.getState>
export default store
