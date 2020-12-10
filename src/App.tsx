import React from 'react'
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'
import {ThemeProvider, createMuiTheme, responsiveFontSizes} from '@material-ui/core'

import AppContainer from 'components/AppContainer'
import {EntryPage, MeetingPage} from 'pages'
import 'fonts/Roboto-Regular.ttf'

const theme = responsiveFontSizes(
  createMuiTheme({
    palette: {
      primary: {
        main: '#180F31',
      },
      secondary: {
        main: '#4A4453',
      },
    },
  })
)

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <Router>
          <Switch>
            <Route path="/meeting" exact component={MeetingPage} />
            <Route>
              <EntryPage />
            </Route>
          </Switch>
        </Router>
      </AppContainer>
    </ThemeProvider>
  )
}
export default App
