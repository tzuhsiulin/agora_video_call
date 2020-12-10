import React, {useState, useCallback, useEffect} from 'react'
import {makeStyles, Theme, Box, Paper, Typography, TextField, Button} from '@material-ui/core'
import {useHistory} from 'react-router-dom'
import {useDispatch} from 'react-redux'

import {getRTCClient} from 'utils/rtc'
import {meetingAsyncActions} from 'redux/reducers/meeting'

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    [theme.breakpoints.down('md')]: {
      width: '90%',
    },
    [theme.breakpoints.up('lg')]: {
      width: '45%',
    },
    padding: theme.spacing(3),
    '& .MuiTextField-root': {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
  },
  title: {
    textAlign: 'center',
  },
  submitBtnContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  submitBtn: {
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
}))

const EntryPage = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const history = useHistory()
  const [formData, setFormData] = useState({
    appId: '',
    channelName: '',
    token: '',
  })
  const onChange = useCallback(
    e => {
      setFormData({
        ...formData,
        [e.target.getAttribute('name')]: e.target.value,
      })
    },
    [formData]
  )
  const onSubmit = useCallback(
    e => {
      e.preventDefault()
      dispatch(meetingAsyncActions.join(formData))
      history.push('/meeting')
    },
    [formData, history, dispatch]
  )

  useEffect(() => {
    getRTCClient(dispatch)
  }, [dispatch])

  return (
    <Box className={classes.container}>
      <Paper className={classes.formContainer}>
        <Typography className={classes.title} variant="h4">
          Join the Meeting
        </Typography>
        <form noValidate autoComplete="off" onSubmit={onSubmit}>
          <TextField
            id="app-id"
            fullWidth
            label="APP ID"
            variant="outlined"
            type="text"
            InputLabelProps={{
              shrink: true,
            }}
            name="appId"
            value={formData.appId}
            onChange={onChange}
          />
          <TextField
            id="channel-name"
            fullWidth
            label="Channel Name"
            variant="outlined"
            type="text"
            InputLabelProps={{
              shrink: true,
            }}
            name="channelName"
            value={formData.channelName}
            onChange={onChange}
          />
          <TextField
            id="token"
            fullWidth
            label="Token"
            variant="outlined"
            type="text"
            InputLabelProps={{
              shrink: true,
            }}
            name="token"
            value={formData.token}
            onChange={onChange}
          />
          <Box className={classes.submitBtnContainer}>
            <Button className={classes.submitBtn} type="submit" variant="contained" color="primary">
              Join
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  )
}
export default EntryPage
