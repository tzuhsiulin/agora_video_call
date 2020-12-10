import {combineReducers} from '@reduxjs/toolkit'

import {meetingSlice} from './reducers/meeting'

const rootReducer = combineReducers({
  meeting: meetingSlice.reducer,
})
export default rootReducer
