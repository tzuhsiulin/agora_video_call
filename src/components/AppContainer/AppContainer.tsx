import React, {FunctionComponent, ReactElement} from 'react'
import {Theme, makeStyles, AppBar, Toolbar, Typography} from '@material-ui/core'

type AppContainerProps = {
  children: ReactElement
}

const useStyles = makeStyles((theme: Theme) => ({
  '@global': {
    body: {
      margin: 0,
      padding: 0,
      minHeight: '100vh',
      backgroundColor: theme.palette.secondary.main,
    },
    main: {
      height: 'calc(100vh - 64px)',
    },
  },
  appbar: {
    zIndex: theme.zIndex.appBar,
  },
}))

const AppContainer: FunctionComponent<AppContainerProps> = ({children}) => {
  const classes = useStyles()
  return (
    <>
      <AppBar className={classes.appbar} position="static">
        <Toolbar>
          <Typography variant="h6">Agora Video Call</Typography>
        </Toolbar>
      </AppBar>
      <main>{children}</main>
    </>
  )
}
export default AppContainer
