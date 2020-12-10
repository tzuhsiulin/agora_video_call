import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit'
import _ from 'lodash'

import {getRTCClient, RtcMediaType} from 'utils/rtc'

const reducerName = 'meeting'

export enum MeetingStatus {
  CLOSED = 0,
  LOADING,
  FAILED,
  CONNECTED,
}

interface Attendee {
  uid: string
  hasSubscribedVideo: boolean
  hasSubscribedAudio: boolean
}

interface MeetingState {
  meetingStatus: MeetingStatus
  connectionErrMsg: string
  selfUid: string
  hasClosedVideo: boolean
  hasMutedAudio: boolean
  attendeeList: Array<Attendee>
}

interface JoiningMeetingPayload {
  appId: string
  channelName: string
  token: string
}

interface RemoteSourceChangedPayload {
  uid: string
  mediaType: string
}

const join = createAsyncThunk(`${reducerName}/join`, async (payload: JoiningMeetingPayload) => {
  const rtcClient = getRTCClient()
  const {appId, channelName, token} = payload
  const uid = await rtcClient.join(appId, channelName, token)
  return uid
})

const leave = createAsyncThunk(`${reducerName}/leave`, async () => {
  const rtcClient = getRTCClient()
  await rtcClient.leave()
})

const publish = createAsyncThunk(`${reducerName}/publish`, async (payload: RtcMediaType) => {
  const rtcClient = getRTCClient()
  await rtcClient.publishLocalSource(payload)
})

const unpublush = createAsyncThunk(`${reducerName}/unpublish`, async (payload: RtcMediaType) => {
  const rtcClient = getRTCClient()
  await rtcClient.unpublishLocalSource(payload)
})

const initialState: MeetingState = {
  meetingStatus: MeetingStatus.CLOSED,
  connectionErrMsg: '',
  selfUid: '',
  hasClosedVideo: false,
  hasMutedAudio: false,
  attendeeList: [],
}

export const meetingSlice = createSlice({
  name: reducerName,
  initialState,
  reducers: {
    subscribeRemoteSource: (state, action: PayloadAction<RemoteSourceChangedPayload>) => {
      const {uid, mediaType} = action.payload
      const attendee = state.attendeeList.find(attendee => attendee.uid === uid)
      if (attendee) {
        if (mediaType === 'audio') {
          attendee.hasSubscribedAudio = true
        } else {
          attendee.hasSubscribedVideo = true
        }
        state.attendeeList = [...state.attendeeList]
      } else {
        state.attendeeList.push({
          uid,
          hasSubscribedAudio: mediaType === 'audio',
          hasSubscribedVideo: mediaType === 'video',
        })
      }
    },
    unsubscribeRemoteSource: (state, action: PayloadAction<RemoteSourceChangedPayload>) => {
      const {uid, mediaType} = action.payload
      const attendee = state.attendeeList.find(attendee => attendee.uid === uid)
      if (attendee) {
        if (mediaType === 'audio') {
          attendee.hasSubscribedAudio = false
        } else {
          attendee.hasSubscribedVideo = false
        }
        state.attendeeList = [...state.attendeeList]
      }
    },
    removeAttendee: (state, action: PayloadAction<string>) => {
      const {payload: uid} = action
      state.attendeeList = state.attendeeList.filter(attendee => attendee.uid !== uid)
    },
  },
  extraReducers: builder => {
    builder
      .addCase(join.pending, state => {
        state.meetingStatus = MeetingStatus.LOADING
      })
      .addCase(join.fulfilled, (state, {payload: uid}) => {
        state.meetingStatus = MeetingStatus.CONNECTED
        state.selfUid = uid.toString()
        state.hasMutedAudio = false
        state.hasClosedVideo = false
      })
      .addCase(join.rejected, (state, action) => {
        state.meetingStatus = MeetingStatus.FAILED
        if (_.get(action, 'error.code', '') === 'CAN_NOT_GET_GATEWAY_SERVER') {
          state.connectionErrMsg = _.get(action, 'error.message', '').replace(
            'AgoraRTCError CAN_NOT_GET_GATEWAY_SERVER: ',
            ''
          )
        } else {
          state.connectionErrMsg = 'Unknown error'
        }
        console.error(_.get(action, 'error'))
      })

    builder.addCase(publish.fulfilled, (state, {meta}) => {
      if (meta.arg === 'video') {
        state.hasClosedVideo = false
      } else {
        state.hasMutedAudio = false
      }
    })

    builder.addCase(unpublush.fulfilled, (state, {meta}) => {
      if (meta.arg === 'video') {
        state.hasClosedVideo = true
      } else {
        state.hasMutedAudio = true
      }
    })

    builder.addCase(leave.fulfilled, state => {
      state = initialState
    })
  },
})
export const meetingAsyncActions = {join, leave, publish, unpublush}
