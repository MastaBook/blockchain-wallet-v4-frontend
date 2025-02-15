import { lift } from 'ramda'

import { ExtractSuccess } from '@core/types'
import { selectors } from 'data'
import { RootState } from 'data/rootReducer'

export const getData = (state: RootState) => {
  const cardsR = selectors.components.buySell.getBSCards(state)
  const userDataR = selectors.modules.profile.getUserData(state)
  const withdrawLockCheckR = selectors.components.send.getWithdrawLockCheckRule(state)
  const afterTransactionR = selectors.components.interest.getAfterTransaction(state)
  const recurringBuyListR = selectors.components.recurringBuy.getRegisteredList(state)

  return lift(
    (
      cards: ExtractSuccess<typeof cardsR>,
      userData: ExtractSuccess<typeof userDataR>,
      withdrawLockCheck: ExtractSuccess<typeof withdrawLockCheckR>,
      afterTransaction: ExtractSuccess<typeof afterTransactionR>,
      recurringBuyList: ExtractSuccess<typeof recurringBuyListR>
    ) => {
      return {
        afterTransaction,
        cards,
        lockTime: withdrawLockCheck?.lockTime || 0,
        recurringBuyList,
        userData
      }
    }
  )(cardsR, userDataR, withdrawLockCheckR, afterTransactionR, recurringBuyListR)
}
