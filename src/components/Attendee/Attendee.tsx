import React, {FunctionComponent, useEffect, useRef} from 'react'
import {useDispatch} from 'react-redux'
import {makeStyles, Paper, Avatar} from '@material-ui/core'

import {getRTCClient} from 'utils/rtc'

type AttendeeProps = {
  uid: string
  isAudioClosed: boolean
  isVideoClosed: boolean
}

const useStyles = makeStyles(() => ({
  root: {
    minHeight: '15rem',
    minWidth: '15rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  avatar: {
    minHeight: '13rem',
    minWidth: '13rem',
  },
  streamVideo: {
    height: '13rem',
    width: '13rem',
  },
}))

const Attendee: FunctionComponent<AttendeeProps> = ({uid, isAudioClosed, isVideoClosed}) => {
  const classes = useStyles()
  const videoEle = useRef(null)
  const dispatch = useDispatch()
  const rtcClient = getRTCClient(dispatch)
  const videoTrack = rtcClient.getVideoTrack(uid)

  useEffect(() => {
    const ele = videoEle.current
    if (ele && videoTrack) {
      videoTrack.play(ele)
    }
  }, [videoEle, videoTrack, isVideoClosed])

  return (
    <Paper className={classes.root} variant="outlined" square>
      {isVideoClosed ? (
        <Avatar className={classes.avatar}>{uid.toString()}</Avatar>
      ) : (
        <div className={classes.streamVideo} ref={videoEle} />
      )}
    </Paper>
  )
}
export default Attendee
