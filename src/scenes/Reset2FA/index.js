import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, compose } from 'redux'
import { formValueSelector } from 'redux-form'
import withWizard from 'components/providers/WizardForm'

import FirstStep from './FirstStep'
import SecondStep from './SecondStep'
import ThirdStep from './ThirdStep'
import { actions } from 'data'

class Reset2FAContainer extends React.Component {
  constructor () {
    super()
    this.state = { timestamp: new Date().getTime() }
    this.submit = this.submit.bind(this)
  }

  submit () {
    this.props.alertActions.showSuccess('Success !')
  }

  render () {
    const { step, next, previous } = this.props

    switch (step) {
      case 2: return <SecondStep handleClick={this.submit} handleGoBack={previous} />
      case 3: return <ThirdStep handleClick={next} handleGoBackStep3={previous} />
      default: return <FirstStep handleClick={next} />
    }
  }
}

function matchStateToProps (state) {
  const selector = formValueSelector('reset2FAForm')
  return {
    guid: selector(state, 'guid'),
    email: selector(state, 'email'),
    newEmail: selector(state, 'newEmail'),
    secretPhrase: selector(state, 'secretPhrase'),
    message: selector(state, 'message'),
    captcha: selector(state, 'captcha')
  }
}

function mapDispatchToProps (dispatch) {
  return {
    authActions: bindActionCreators(actions.auth, dispatch),
    alertActions: bindActionCreators(actions.alerts, dispatch),
    coreActions: bindActionCreators(actions.core.wallet, dispatch)
  }
}

const enhance = compose(
  withWizard({ totalSteps: 3, formName: 'reset2FAForm' }),
  connect(matchStateToProps, mapDispatchToProps)
)

export default enhance(Reset2FAContainer)
