import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { connect, ConnectedProps, Provider } from 'react-redux'
import { Redirect, Route, Switch } from 'react-router-dom'
import { ThemeProvider as ConstellationTP } from '@blockchain-com/constellation'
import { ConnectedRouter } from 'connected-react-router'
import { Store } from 'redux'
import { PersistGate } from 'redux-persist/integration/react'
import Cookies from 'universal-cookie'
import { createClient, Provider as UrqlProvider } from 'urql'

import { WalletOptionsType } from '@core/types'
import { NabuErrorDeepLinkHandler } from 'components/NabuErrorDeepLinkHandler'
import SiftScience from 'components/SiftScience'
import { selectors } from 'data'
import { UserDataType } from 'data/types'
import { useDefer3rdPartyScript } from 'hooks'
import AuthLayout from 'layouts/Auth'
import AuthLoading from 'layouts/Auth/template.loading'
import DexLayout from 'layouts/Dex'
import NftsLayout from 'layouts/Nfts'
import WalletLayout from 'layouts/Wallet'
import WalletLoading from 'layouts/Wallet/template.loading'
import { UTM } from 'middleware/analyticsMiddleware/constants'
import { utmParser } from 'middleware/analyticsMiddleware/utils'
import { MediaContextProvider } from 'providers/MatchMediaProvider'
import { RemoteConfigProvider } from 'providers/RemoteConfigProvider'
import ThemeProvider from 'providers/ThemeProvider'
import TranslationsProvider from 'providers/TranslationsProvider'
import { languages } from 'services/locales'
import { getTracking } from 'services/tracking'

const queryClient = new QueryClient()

// PUBLIC
const AppError = React.lazy(() => import('./AppError'))
const AuthorizeLogin = React.lazy(() => import('./AuthorizeLogin'))
const Help = React.lazy(() => import('./Help'))
const HelpExchange = React.lazy(() => import('./HelpExchange'))
const Login = React.lazy(() => import('./Login'))
const Logout = React.lazy(() => import('./Logout'))
const MobileLogin = React.lazy(() => import('./MobileLogin'))
const ProductPicker = React.lazy(() => import('./Signup/ProductPicker'))
const RecoverWallet = React.lazy(() => import('./RecoverWallet'))
const Signup = React.lazy(() => import('./Signup'))
const ResetWallet2fa = React.lazy(() => import('./ResetWallet2fa'))
const ResetWallet2faToken = React.lazy(() => import('./ResetWallet2faToken'))
const SofiLanding = React.lazy(() => import('./SofiLanding'))
const SofiSignupSuccess = React.lazy(() => import('./Signup/SofiSignupSuccess'))
const SofiSignupFailure = React.lazy(() => import('./Signup/SofiSignupFailure'))
const SofiVerify = React.lazy(() => import('./Signup/components/SofiVerifySsn'))
const SofiReferral = React.lazy(() => import('./Refer/Sofi'))
const Prove = React.lazy(() => import('./Prove'))
// need to be authed to see this, but uses public layout
const ContinueOnPhone = React.lazy(() => import('./ContinueOnPhone'))
const TwoStepVerification = React.lazy(() => import('./TwoStepVerification'))
const UploadDocuments = React.lazy(() => import('./UploadDocuments'))
const UploadDocumentsForDebitCards = React.lazy(() => import('./UploadDocumentsForDebitCards'))
const UploadDocumentsSuccess = React.lazy(() => import('./UploadDocuments/Success'))
const VerifyAccountRecovery = React.lazy(() => import('./RecoverWallet/EmailAuthLanding'))
const VerifyEmailToken = React.lazy(() => import('./VerifyEmailToken'))
const VerifyEmail = React.lazy(() => import('./VerifyEmail'))

// TEST
const ContinueOnMobile = React.lazy(() => import('./Login/Sofi/ContinueOnMobile'))

// DEX
const Dex = React.lazy(() => import('./Dex'))

// NFTs
const NftsView = React.lazy(() => import('./Nfts/View'))
const NftsAsset = React.lazy(() => import('./Nfts/AssetViewOnly'))

// WALLET
const Addresses = React.lazy(() => import('./Settings/Addresses'))
const Airdrops = React.lazy(() => import('./Airdrops'))
const CoinPage = React.lazy(() => import('./CoinPage/components/CoinPage'))
const General = React.lazy(() => import('./Settings/General'))
const Home = React.lazy(() => import('./Home'))
const Earn = React.lazy(() => import('./Earn'))
const EarnHistory = React.lazy(() => import('./EarnHistory'))
const ActiveRewardsLearn = React.lazy(() => import('./ActiveRewardsLearn'))
const Preferences = React.lazy(() => import('./Settings/Preferences'))
const Prices = React.lazy(() => import('./Prices'))
const SecurityCenter = React.lazy(() => import('./SecurityCenter'))
const TaxCenter = React.lazy(() => import('./TaxCenter'))
const TheExchange = React.lazy(() => import('./TheExchange'))
const Transactions = React.lazy(() => import('./Transactions'))
const DebitCard = React.lazy(() => import('./DebitCard'))

const BLOCKCHAIN_TITLE = 'Blockchain.com'

const removeHash = (path: string) => {
  if (path.startsWith('/#')) return path.slice(2)
  if (path.endsWith('#/')) return path.slice(0, -2)
  if (path.includes('/#/')) return path.replace('/#/', '/')
  return path
}

const useStaging =
  window.location.host === 'login-staging.blockchain.com' ||
  window.location.host.includes('localhost')

const useFullPathForRedirect = [
  '/#/authorize-approve',
  '/deeplink',
  '/exchange',
  '/#/prove/instant-link/callback',
  '/refer',
  '/sofi',
  '/#/verify-email',
  '/#/login?product=exchange',
  '/wallet-options-v4.json',
  '/#/prove',
  '/#/reset-two-factor',
  '/reset-two-factor',
  '/#/open',
  '/forgot-password',
  '/import-wallet',
  '/auth',
  '/#/auth',
  '/#/sofi',
  '/#/login/',
  '/wallet/forgot-password',
  '/wallet/import-wallet',
  '/#/signup',
  '/#/help-exchange/',
  'help-exchange',
  '/#/reset-2fa',
  '/reset-2fa.'
]

const excludedProduction = [
  // '/#/authorize-approve',
  // '/deeplink',
  // '/exchange',
  // '/#/prove/instant-link/callback',
  // '/refer',
  // '/sofi',
  // '/#/verify-email',
  // '/#/login?product=exchange',
  '/wallet-options-v4.json',
  // '/#/prove',
  // '/#/reset-two-factor',
  // '/#/open',
  '/login?product=wallet&platform=ios',
  '/login?product=wallet&platform=android',
  '/signup/product=exchange&platform=ios',
  '/signup/product=exchange&platform=android',
  '/#/login?product=wallet&platform=ios',
  '/#/login?product=wallet&platform=android',
  '/#/signup?product=exchange&platform=ios',
  '/#/login/',
  '/#/signup?product=exchange&platform=android'
  // '/#/sofi'
]

const excludedStaging = ['/wallet-options-v4.json']

const App = ({
  apiUrl,
  history,
  isActiveRewardsEnabled,
  isAuthenticated,
  isCoinViewV2Enabled,
  isDebitCardEnabled,
  isDexEnabled,
  isMnemonicRecoveryEnabled,
  isNftExplorerEnabled,
  isProveEnabled,
  persistor,
  store,
  userDataId
}: Props) => {
  const Loading = isAuthenticated ? WalletLoading : AuthLoading
  const approvalDate = '4 March 2024'
  const [isDynamicRoutingInProgress, setDynamicRoutingState] = useState<boolean>(true)

  useEffect(() => {
    // Used to get cached values from old implementation, if they exist.
    const cookies = new Cookies()
    const optOut = localStorage.getItem('opt_out_wallet_v5_ui')
    const optOutDate = localStorage.getItem('opt_out_date')
    const optOutDataAsDateObject = optOutDate ? new Date(optOutDate) : new Date() // date user has for their opt out time
    const optOutDateThreshold = new Date('2024-11-25T00:00:00.000Z') // cutoff date any user with reversion date before this will go to v5 Nov 22nd 2024
    const isOptOutDateAfterDateThreshold = optOutDataAsDateObject > optOutDateThreshold // if user's reversion date is after cutoff this is true, they will stay on v4

    // if opted out and no opt out date add one
    if (optOut && optOutDate === null)
      localStorage.setItem('opt_out_date', new Date().toISOString())

    let fullPath: string
    if (window.location.hash && window.location.hash !== '#/') {
      // OBTAIN FULL PATH BY COMBINING PATHNAME AND HASH (CLIENT-ONLY ROUTING)
      fullPath = window.location.pathname + window.location.hash
    } else {
      // OBTAIN FULL PATH BY COMBINING PATHNAME AND SEARCH QUERY, TO DEAL WITH HASH ROUTING
      // ADDING HASH AT THE END OF THE PATH IF THERE ISN'T ONE
      fullPath = window.location.pathname + window.location.search
    }

    // SPLIT IT INTO PARTS TO HANDLE LANGUAGE DETECTION
    const pathSegments = fullPath.split('/').filter(Boolean)
    const firstSegment = pathSegments[0]?.toLowerCase()

    // IF LANGUAGE EXISTS, REMOVE IT FROM THE PATH, NOT NEEDED FOR DYNAMIC ROUTING.
    if (languages.some((lang) => lang.language.toLowerCase() === firstSegment)) {
      // HACK TO ENSURE CORRECT DOMAIN/PATH SET
      languages.forEach(({ language }) => {
        cookies.remove('clang', { domain: '.blockchain.com', path: `/${language}` })
      })

      // UPDATE LANGUAGE COOKIE SO THAT V5 LOADS THE CORRECT LANGUAGE
      cookies.set('clang', firstSegment, {
        domain: '.blockchain.com',
        path: '/'
      })
      // Remove the first segment and join the remaining segments
      pathSegments.shift()
      fullPath = `/${pathSegments.join('/')}`
    }

    // IF ANY PATHS MATCH THE EXCLUSIONS, RENDER THE APP.
    const exclusionPaths = useStaging ? excludedStaging : excludedProduction
    if (exclusionPaths.some((prefix) => fullPath.toLowerCase().startsWith(prefix))) {
      setDynamicRoutingState(false)
      return
    }

    // USER HAS SPECIFICALLY REQUESTED TO STAY ON V4.
    if (optOut && isOptOutDateAfterDateThreshold) {
      // eslint-disable-next-line
      console.log(
        '[ROUTING_DEBUG]: User has opted out of v5, and their opt out date is after the threshold, staying on v4'
      )
      setDynamicRoutingState(false)
      return
    } else {
      const redirectUrl = removeHash(fullPath)
      if (optOut) localStorage.removeItem('opt_out_wallet_v5_ui') // go ahead remove opt_out key
      if (optOutDate) localStorage.removeItem('opt_out_date') // remove user's old opt out date

      // eslint-disable-next-line
      console.log('xx', 'Redirecting to v5', redirectUrl)
      // Using **WALLET_V5_LINK** as a fallback for webpack builder.
      if (useFullPathForRedirect.some((prefix) => fullPath.toLowerCase().startsWith(prefix))) {
        // eslint-disable-next-line
        console.log('xx', `${window?.WALLET_V5_LINK + redirectUrl}`, 'using full path for redirect')
        window.location.href = window?.WALLET_V5_LINK + redirectUrl
      } else {
        // eslint-disable-next-line
        console.log('xx', window?.WALLET_V5_LINK, 'not using full path for redirect')
        window.location.href = window?.WALLET_V5_LINK
      }

      return
    }
  }, [])

  // parse and log UTMs
  useEffect(() => {
    const utm = utmParser()
    sessionStorage.setItem(UTM, JSON.stringify(utm))
    getTracking({ url: apiUrl })
  }, [apiUrl])

  // lazy load google tag manager
  useDefer3rdPartyScript('https://www.googletagmanager.com/gtag/js?id=UA-52108117-5', {
    attributes: {
      nonce: window.nonce
    }
  })

  // effect for handling partner referrals
  useEffect(() => {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const referral = urlParams.get('ref')
    if (referral) {
      const cookies = new Cookies()
      cookies.set('partnerReferralCode', referral, {
        domain: '.blockchain.com',
        path: '/'
      })
    }
  }, [])

  const client = createClient({
    url: `${apiUrl}/nft-market-api/graphql/`
  })

  const isSofi = window.location.pathname === '/sofi'
  const isReferral = window.location.pathname === '/refer/sofi'

  const sofiParams = isSofi && window.location.search
  const referralParams = isReferral && window.location.search

  const RoutingStack = useMemo(
    () => (
      <Switch>
        {/* Unauthenticated Wallet routes */}
        <Route path='/app-error' component={AppError} />
        <Route path='/refer/sofi' component={SofiReferral} exact />
        <AuthLayout
          path='/account-recovery'
          component={VerifyAccountRecovery}
          pageTitle={`${BLOCKCHAIN_TITLE} | Recovery`}
        />
        <AuthLayout
          path='/continue-on-phone'
          component={ContinueOnPhone}
          pageTitle={`${BLOCKCHAIN_TITLE} | Continue on your phone`}
        />
        <AuthLayout path='/authorize-approve' component={AuthorizeLogin} />
        <AuthLayout path='/help' component={Help} pageTitle={`${BLOCKCHAIN_TITLE} | Help`} />
        <AuthLayout
          path='/help-exchange'
          component={HelpExchange}
          pageTitle={`${BLOCKCHAIN_TITLE} | Help`}
        />
        <AuthLayout path='/login' component={Login} pageTitle={`${BLOCKCHAIN_TITLE} | Login`} />
        <AuthLayout path='/logout' component={Logout} />
        <AuthLayout
          path='/select-product'
          component={ProductPicker}
          pageTitle={`${BLOCKCHAIN_TITLE} | Product Select`}
        />
        <AuthLayout
          path='/mobile-login'
          component={MobileLogin}
          pageTitle={`${BLOCKCHAIN_TITLE} | Login`}
        />
        {isMnemonicRecoveryEnabled && (
          <AuthLayout
            path='/recover'
            component={RecoverWallet}
            pageTitle={`${BLOCKCHAIN_TITLE} | Recover`}
          />
        )}
        <AuthLayout
          path='/reset-2fa'
          component={ResetWallet2fa}
          pageTitle={`${BLOCKCHAIN_TITLE} | Reset 2FA`}
        />
        <AuthLayout
          path='/reset-two-factor'
          component={ResetWallet2faToken}
          pageTitle={`${BLOCKCHAIN_TITLE} | Reset 2FA`}
        />
        <AuthLayout
          path='/setup-two-factor'
          component={TwoStepVerification}
          pageTitle={`${BLOCKCHAIN_TITLE} | Setup 2FA`}
        />
        <AuthLayout
          path='/signup/sofi'
          component={Signup}
          pageTitle={`${BLOCKCHAIN_TITLE} | SoFi Signup`}
        />
        <AuthLayout
          path='/login/sofi'
          component={Login}
          pageTitle={`${BLOCKCHAIN_TITLE} | SoFi Login`}
        />
        <AuthLayout
          path='/sofi'
          component={SofiLanding}
          pageTitle={`${BLOCKCHAIN_TITLE} | SoFi Signup`}
        />
        <AuthLayout
          path='/sofi-success'
          component={SofiSignupSuccess}
          pageTitle={`${BLOCKCHAIN_TITLE} | SoFi Signup`}
        />
        <AuthLayout
          path='/sofi-error'
          component={SofiSignupFailure}
          pageTitle={`${BLOCKCHAIN_TITLE} | SoFi Signup`}
        />
        <AuthLayout
          path='/sofi-verify'
          component={SofiVerify}
          pageTitle={`${BLOCKCHAIN_TITLE} | SoFi Signup`}
        />
        <AuthLayout
          path='/sofi-mobile'
          component={ContinueOnMobile}
          pageTitle={`${BLOCKCHAIN_TITLE} | SoFi Signup`}
        />
        <AuthLayout path='/signup' component={Signup} pageTitle={`${BLOCKCHAIN_TITLE} | Sign up`} />
        <AuthLayout
          path='/verify-email'
          component={VerifyEmailToken}
          pageTitle={`${BLOCKCHAIN_TITLE} | Verify Email`}
        />
        <AuthLayout path='/upload-document/success' component={UploadDocumentsSuccess} exact />
        <AuthLayout path='/upload-document/:token' component={UploadDocuments} />
        <AuthLayout path='/upload-document-card/:token' component={UploadDocumentsForDebitCards} />
        <AuthLayout path='/wallet' component={Login} pageTitle={`${BLOCKCHAIN_TITLE} | Login`} />
        <AuthLayout
          path='/verify-email-step'
          component={VerifyEmail}
          pageTitle={`${BLOCKCHAIN_TITLE} | Verify Email`}
        />
        {isProveEnabled && (
          <AuthLayout
            path='/prove/instant-link/callback'
            component={Prove}
            pageTitle={`${BLOCKCHAIN_TITLE} | Verify Device`}
          />
        )}
        {/* DEX routes */}
        {isDexEnabled && (
          <DexLayout path='/dex' exact component={Dex} pageTitle={`${BLOCKCHAIN_TITLE} | DEX`} />
        )}
        {/* NFT Explorer routes */}
        {isNftExplorerEnabled && (
          <NftsLayout path='/nfts/assets/:contract/:id' exact component={NftsAsset} />
        )}
        <Route exact path='/nfts'>
          <Redirect to='/nfts/view' />
        </Route>
        {isNftExplorerEnabled && (
          <NftsLayout
            path='/nfts/view'
            exact
            component={NftsView}
            pageTitle={`${BLOCKCHAIN_TITLE} | NFT Explorer`}
          />
        )}
        {/* Authenticated Wallet routes */}
        {isDebitCardEnabled && <WalletLayout path='/debit-card' component={DebitCard} />}
        <WalletLayout
          path='/airdrops'
          component={Airdrops}
          hasUkBanner
          approvalDate={approvalDate}
        />
        <WalletLayout path='/exchange' component={TheExchange} />
        <WalletLayout path='/home' component={Home} hasUkBanner approvalDate={approvalDate} />
        <WalletLayout path='/earn' component={Earn} exact hasUkBanner approvalDate={approvalDate} />
        <WalletLayout path='/earn/history' component={EarnHistory} />
        {isActiveRewardsEnabled && (
          <WalletLayout path='/earn/active-rewards-learn' component={ActiveRewardsLearn} />
        )}
        <WalletLayout path='/security-center' component={SecurityCenter} />
        <WalletLayout path='/settings/addresses' component={Addresses} />
        <WalletLayout path='/settings/general' component={General} />
        <WalletLayout path='/settings/preferences' component={Preferences} />
        <WalletLayout path='/prices' component={Prices} hasUkBanner approvalDate={approvalDate} />
        <WalletLayout path='/tax-center' component={TaxCenter} />
        <WalletLayout
          path='/coins/:coin'
          component={isCoinViewV2Enabled ? CoinPage : Transactions}
          hideMenu={isCoinViewV2Enabled}
          center={isCoinViewV2Enabled}
          removeContentPadding
          hasUkBanner
        />
        {isSofi && window.location.replace(`/#/sofi${sofiParams}`)}
        {isReferral && window.location.replace(`/#/refer/sofi${referralParams}`)}
        {isAuthenticated ? <Redirect to='/home' /> : <Redirect to='/login' />}
      </Switch>
    ),
    [
      isActiveRewardsEnabled,
      isAuthenticated,
      isCoinViewV2Enabled,
      isDebitCardEnabled,
      isDexEnabled,
      isMnemonicRecoveryEnabled,
      isNftExplorerEnabled,
      isProveEnabled,
      isReferral,
      isSofi,
      referralParams,
      sofiParams
    ]
  )

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <NabuErrorDeepLinkHandler>
          <RemoteConfigProvider>
            <ConstellationTP colorMode='light'>
              <ThemeProvider>
                <TranslationsProvider>
                  <PersistGate loading={<Loading />} persistor={persistor}>
                    <MediaContextProvider>
                      <UrqlProvider value={client}>
                        <ConnectedRouter history={history}>
                          <Suspense fallback={<Loading />}>
                            {isDynamicRoutingInProgress ? <Loading /> : RoutingStack}
                          </Suspense>
                        </ConnectedRouter>
                        <SiftScience userId={userDataId} />
                      </UrqlProvider>
                    </MediaContextProvider>
                  </PersistGate>
                </TranslationsProvider>
              </ThemeProvider>
            </ConstellationTP>
          </RemoteConfigProvider>
        </NabuErrorDeepLinkHandler>
      </Provider>
    </QueryClientProvider>
  )
}

const mapStateToProps = (state) => ({
  apiUrl: selectors.core.walletOptions.getDomains(state).getOrElse({
    api: 'https://api.blockchain.info'
  } as WalletOptionsType['domains']).api,
  isActiveRewardsEnabled: selectors.core.walletOptions
    .getActiveRewardsEnabled(state)
    .getOrElse(false) as boolean,
  isAuthenticated: selectors.auth.isAuthenticated(state),
  isCoinViewV2Enabled: selectors.core.walletOptions
    .getCoinViewV2(state)
    .getOrElse(false) as boolean,
  isDebitCardEnabled: selectors.core.walletOptions
    .getWalletDebitCardEnabled(state)
    .getOrElse(false),
  isDexEnabled: selectors.core.walletOptions
    .getDexProductEnabled(state)
    .getOrElse(false) as boolean,
  isMnemonicRecoveryEnabled: selectors.core.walletOptions
    .getMnemonicRecoveryEnabled(state)
    .getOrElse(false) as boolean,
  isNftExplorerEnabled: selectors.core.walletOptions
    .getNftExplorer(state)
    .getOrElse(false) as boolean,
  isProveEnabled: selectors.core.walletOptions.getProveEnabled(state).getOrElse(false) as boolean,
  userDataId: selectors.modules.profile.getUserData(state).getOrElse({} as UserDataType).id
})

type Props = {
  history: History
  persistor
  store: Store
} & ConnectedProps<typeof connector>
const connector = connect(mapStateToProps)
export default connector(App)
