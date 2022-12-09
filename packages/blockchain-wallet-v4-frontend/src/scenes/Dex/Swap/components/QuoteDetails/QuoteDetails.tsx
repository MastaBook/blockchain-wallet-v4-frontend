import React from 'react'
import { FormattedMessage } from 'react-intl'
import { Flex } from '@blockchain-com/constellation'
import BigNumber from 'bignumber.js'

import { Exchange } from '@core'
import FiatDisplay from 'components/Display/FiatDisplay'
import { selectors } from 'data'
import { useRemote } from 'hooks'

import {
  EditSlippageText,
  LoadingBox,
  QuoteWrapper,
  RowDetails,
  RowTitle,
  ValueSubText,
  ValueText
} from './styles'

type Props = {
  handleSettingsClick: () => void
  slippage: number
  swapDetailsOpen: boolean
  walletCurrency: string
}

// TODO: ETH is hardcoded in some spots, should be from current chain data
// TODO: hardcoded for only single-leg swaps
export const QuoteDetails = ({
  handleSettingsClick,
  slippage,
  swapDetailsOpen,
  walletCurrency
}: Props) => {
  const { data: swapQuote, isLoading: isQuoteLoading } = useRemote(
    selectors.components.dex.getSwapQuote
  )
  return (
    <QuoteWrapper animate={swapDetailsOpen}>
      <RowDetails>
        <RowTitle>
          <FormattedMessage id='copy.allowed_slippage' defaultMessage='Allowed Slippage' />
        </RowTitle>
        <Flex flexDirection='column' alignItems='flex-end' justifyContent='space-between'>
          <ValueText>{slippage * 100}%</ValueText>
          <EditSlippageText onClick={handleSettingsClick}>
            <FormattedMessage id='buttons.edit' defaultMessage='Edit' />
          </EditSlippageText>
        </Flex>
      </RowDetails>
      <RowDetails>
        <RowTitle>
          <FormattedMessage id='copy.minimum_received' defaultMessage='Minimum Received' />
        </RowTitle>
        <Flex flexDirection='column' alignItems='flex-end' justifyContent='space-between'>
          {isQuoteLoading || !swapQuote ? (
            <LoadingBox bgColor='white' />
          ) : (
            <>
              <ValueText>
                <FiatDisplay
                  coin={swapQuote.quote.buyAmount.symbol}
                  currency={walletCurrency}
                  color='textBlack'
                  lineHeight='150%'
                  loadingHeight='14px'
                  size='14px'
                  weight={600}
                >
                  {Exchange.convertCoinToCoin({
                    baseToStandard: false,
                    coin: swapQuote.quote.buyAmount.symbol,
                    value: Exchange.convertCoinToCoin({
                      coin: swapQuote.quote.buyAmount.symbol,
                      value: swapQuote.quote.buyAmount.minAmount
                    })
                  })}
                </FiatDisplay>
              </ValueText>
              <ValueSubText>
                {Exchange.convertCoinToCoin({
                  coin: swapQuote.quote.buyAmount.symbol,
                  value: swapQuote.quote.buyAmount.minAmount
                })}{' '}
                {swapQuote.quote.buyAmount.symbol}
              </ValueSubText>
            </>
          )}
        </Flex>
      </RowDetails>
      <RowDetails>
        <RowTitle>
          <FormattedMessage id='copy.send_amount' defaultMessage='Send Amount' />
        </RowTitle>
        <Flex flexDirection='column' alignItems='flex-end' justifyContent='space-between'>
          {isQuoteLoading || !swapQuote ? (
            <LoadingBox bgColor='white' />
          ) : (
            <>
              <FiatDisplay
                coin={swapQuote.quote.sellAmount.symbol}
                currency={walletCurrency}
                color='textBlack'
                lineHeight='150%'
                loadingHeight='14px'
                size='14px'
                weight={600}
              >
                {Exchange.convertCoinToCoin({
                  baseToStandard: false,
                  coin: swapQuote.quote.sellAmount.symbol,
                  value: Exchange.convertCoinToCoin({
                    coin: swapQuote.quote.sellAmount.symbol,
                    value: swapQuote.quote.sellAmount.amount
                  })
                })}
              </FiatDisplay>
              <ValueSubText>
                {Exchange.convertCoinToCoin({
                  coin: swapQuote.quote.sellAmount.symbol,
                  value: swapQuote.quote.sellAmount.amount
                })}{' '}
                {swapQuote.quote.sellAmount.symbol}
              </ValueSubText>
            </>
          )}
        </Flex>
      </RowDetails>
      <RowDetails>
        <RowTitle>
          <FormattedMessage id='copy.network_fee' defaultMessage='Network Fee' />
        </RowTitle>
        <Flex flexDirection='column' alignItems='flex-end' justifyContent='space-between'>
          {isQuoteLoading || !swapQuote ? (
            <LoadingBox bgColor='white' />
          ) : (
            <>
              <FiatDisplay
                coin={swapQuote.quote.sellAmount.symbol}
                currency={walletCurrency}
                color='textBlack'
                lineHeight='150%'
                loadingHeight='14px'
                size='14px'
                weight={600}
              >
                {new BigNumber(swapQuote.transaction.gasPrice)
                  .multipliedBy(swapQuote.transaction.gasLimit)
                  .toString()}
              </FiatDisplay>
              <ValueSubText>
                {Exchange.convertCoinToCoin({
                  coin: 'ETH',
                  value: swapQuote.transaction.gasPrice * swapQuote.transaction.gasLimit
                })}
                {' ETH'}
              </ValueSubText>
            </>
          )}
        </Flex>
      </RowDetails>
      <RowDetails>
        <RowTitle>
          <FormattedMessage id='copy.blockchain_fee' defaultMessage='Blockchain.com Fee' />
        </RowTitle>
        <Flex flexDirection='column' alignItems='flex-end' justifyContent='space-between'>
          {isQuoteLoading || !swapQuote ? (
            <LoadingBox bgColor='white' />
          ) : (
            <>
              <FiatDisplay
                coin={swapQuote.quote.sellAmount.symbol}
                currency={walletCurrency}
                color='textBlack'
                lineHeight='150%'
                loadingHeight='14px'
                size='14px'
                weight={600}
              >
                {Exchange.convertCoinToCoin({
                  baseToStandard: false,
                  coin: swapQuote.quote.sellAmount.symbol,
                  value: Exchange.convertCoinToCoin({
                    coin: swapQuote.quote.sellAmount.symbol,
                    value: (swapQuote.quote.sellAmount.amount / 100) * 0.9
                  })
                })}
              </FiatDisplay>
              <ValueSubText>
                {Exchange.convertCoinToCoin({
                  coin: swapQuote.quote.sellAmount.symbol,
                  value: (swapQuote.quote.sellAmount.amount / 100) * 0.9
                })}{' '}
                {swapQuote.quote.sellAmount.symbol}
              </ValueSubText>
            </>
          )}
        </Flex>
      </RowDetails>
    </QuoteWrapper>
  )
}
