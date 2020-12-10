import React, {useCallback} from 'react'
import {Redirect, Link} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {
  makeStyles,
  Theme,
  Box,
  CircularProgress,
  Paper,
  Typography,
  Button,
  Grid,
  IconButton,
} from '@material-ui/core'
import VolumeUpIcon from '@material-ui/icons/VolumeUp'
import VolumeOffIcon from '@material-ui/icons/VolumeOff'
import VideocamIcon from '@material-ui/icons/Videocam'
import VideocamOffIcon from '@material-ui/icons/VideocamOff'
import CallEndIcon from '@material-ui/icons/CallEnd'

import Attendee from 'components/Attendee'
import {RootState} from 'redux/store'
import {getRTCClient} from 'utils/rtc'
import {meetingAsyncActions, MeetingStatus} from 'redux/reducers'

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    margin: 0,
  },
  errMsgContainer: {
    minHeight: '10rem',
    minWidth: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  errMsg: {
    padding: theme.spacing(2),
  },
  actionBar: {
    position: 'fixed',
    bottom: 0,
    width: '100%',
    textAlign: 'center',
  },
  actionBtnIcon: {
    width: '3rem',
    height: '3rem',
  },
  userList: {
    height: '100%',
    maxWidth: '100vw',
  },
}))

const Meeting = () => {
  const classes = useStyles()
  const history = useHistory()
  const dispatch = useDispatch()
  const rtcClient = getRTCClient(dispatch)
  const meetingState = useSelector((state: RootState) => state.meeting)
  const {
    meetingStatus,
    connectionErrMsg,
    selfUid,
    hasClosedVideo,
    hasMutedAudio,
    attendeeList,
  } = meetingState

  const toggleAudio = useCallback(() => {
    if (hasMutedAudio) {
      dispatch(meetingAsyncActions.publish('audio'))
    } else {
      dispatch(meetingAsyncActions.unpublush('audio'))
    }
  }, [hasMutedAudio, dispatch])
  const toggoleVideo = useCallback(() => {
    if (hasClosedVideo) {
      dispatch(meetingAsyncActions.publish('video'))
    } else {
      dispatch(meetingAsyncActions.unpublush('video'))
    }
  }, [hasClosedVideo, dispatch])

  const onLeave = useCallback(() => {
    dispatch(meetingAsyncActions.leave())
    history.push('/')
  }, [history, dispatch])

  if (meetingStatus === MeetingStatus.LOADING) {
    return (
      <Box className={classes.container}>
        <CircularProgress />
      </Box>
    )
  } else if (connectionErrMsg) {
    return (
      <Box className={classes.container}>
        <Paper className={classes.errMsgContainer}>
          <Typography className={classes.errMsg} variant="subtitle1" component="p" color="error">
            {connectionErrMsg}
          </Typography>
          <Button component={Link} to="/">
            Back
          </Button>
        </Paper>
      </Box>
    )
  } else if (!selfUid && !hasMutedAudio && !hasClosedVideo) {
    return <Redirect to="/" />
  }

  return (
    <>
      <Grid
        className={classes.userList}
        container
        direction="row"
        justify="center"
        alignItems="center"
        spacing={attendeeList.length > 0 ? 3 : 0}
      >
        <Grid item>
          {rtcClient.isMeetingStarted() ? (
            <Attendee uid={selfUid} isAudioClosed={hasMutedAudio} isVideoClosed={hasClosedVideo} />
          ) : null}
        </Grid>
        {attendeeList.map(attendee => (
          <Grid item>
            <Attendee
              key={attendee.uid}
              uid={attendee.uid}
              isAudioClosed={!attendee.hasSubscribedAudio}
              isVideoClosed={!attendee.hasSubscribedVideo}
            />
          </Grid>
        ))}
      </Grid>
      <Box className={classes.actionBar}>
        <IconButton onClick={toggleAudio}>
          {hasMutedAudio ? (
            <VolumeOffIcon className={classes.actionBtnIcon} />
          ) : (
            <VolumeUpIcon className={classes.actionBtnIcon} />
          )}
        </IconButton>

        <IconButton onClick={toggoleVideo}>
          {hasClosedVideo ? (
            <VideocamOffIcon className={classes.actionBtnIcon} />
          ) : (
            <VideocamIcon className={classes.actionBtnIcon} />
          )}
        </IconButton>

        <IconButton onClick={onLeave}>
          <CallEndIcon className={classes.actionBtnIcon} />
        </IconButton>
      </Box>
    </>
  )
}
export default Meeting
