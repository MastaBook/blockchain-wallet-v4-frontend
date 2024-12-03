import React, { useEffect, useState } from 'react'

import Flyout, { duration, FlyoutChild } from 'components/Flyout'
import { selectors } from 'data'
import { ModalName, SofiMigrationErrorIds } from 'data/types'
import { useRemote } from 'hooks'
import modalEnhancer from 'providers/ModalEnhancer'

import { ModalPropsType } from '../../types'
import Error from './template.error'
import SofiVerifyID from './template.form'
import Loading from './template.loading'
import SofiMigrationPending from './template.pending'

const SofiVerifyId = ({ close, position, total, userClickedOutside }: ModalPropsType) => {
  const { data, error, isLoading, isNotAsked } = useRemote(
    selectors.modules.profile.getSofiMigrationStatus
  )
  const [show, setShow] = useState<boolean>(false)
  const isSsnError = error?.id === SofiMigrationErrorIds.SSN_ERROR

  useEffect(() => {
    setShow(true)
  }, [])

  const handleClose = () => {
    setShow(false)
    setTimeout(() => {
      close(ModalName.SOFI_VERIFY_ID)
    }, duration)
  }
  return (
    <Flyout
      position={position}
      isOpen={show}
      userClickedOutside={userClickedOutside}
      onClose={handleClose}
      data-e2e='sofiVerifyIdModal'
      total={total}
    >
      {(isNotAsked || isSsnError) && (
        <FlyoutChild>
          <SofiVerifyID />
        </FlyoutChild>
      )}
      {isLoading && (
        <FlyoutChild>
          <Loading />
        </FlyoutChild>
      )}
      {data && (
        <FlyoutChild>
          <SofiMigrationPending />
        </FlyoutChild>
      )}
      {!isSsnError && error && (
        <FlyoutChild>
          <Error />
        </FlyoutChild>
      )}
    </Flyout>
  )
}

const enhance = modalEnhancer(ModalName.SOFI_VERIFY_ID, { fixed: true, transition: duration })

export default enhance(SofiVerifyId)
