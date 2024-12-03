import { merge } from 'ramda'

import Remote from '@core/remote'

import * as AT from './actionTypes'
import { INITIAL_TIERS } from './model'
import { ProfileActionTypes, ProfileState } from './types'

const INITIAL_STATE: ProfileState = {
  apiToken: Remote.NotAsked,
  campaign: {},
  exchangeOnboarding: {
    linkFromExchangeAccountStatus: Remote.NotAsked,
    linkToExchangeAccountDeeplink: null,
    linkToExchangeAccountStatus: Remote.NotAsked,
    shareWalletAddressesWithExchange: Remote.NotAsked
  },
  sofiAssociateNabuUser: Remote.NotAsked,
  sofiData: Remote.NotAsked,
  sofiLinkData: {},
  sofiMigrationStatus: Remote.NotAsked,
  sofiMigrationStatusFromPolling: Remote.NotAsked,
  sofiMigrationTransferedBalances: Remote.NotAsked,
  sofiUserMigrationStatus: null,
  userCampaigns: Remote.NotAsked,
  userData: Remote.NotAsked,
  userRiskSettings: Remote.NotAsked,
  userTiers: Remote.Success(INITIAL_TIERS)
}

export function profileReducer(state = INITIAL_STATE, action: ProfileActionTypes): ProfileState {
  switch (action.type) {
    case AT.CLEAR_PROFILE_STATE:
      return {
        ...state,
        userData: Remote.NotAsked
      }
    case AT.FETCH_USER_CAMPAIGNS_FAILURE:
      return {
        ...state,
        userCampaigns: Remote.Failure(action.payload.error)
      }
    case AT.FETCH_USER_CAMPAIGNS_LOADING:
      return {
        ...state,
        userCampaigns: Remote.Loading
      }
    case AT.FETCH_USER_CAMPAIGNS_SUCCESS:
      return {
        ...state,
        userCampaigns: Remote.Success(action.payload.userCampaigns)
      }
    case AT.FETCH_USER_RISK_SETTINGS_FAILURE:
      return {
        ...state,
        userRiskSettings: Remote.Failure(action.payload.error)
      }
    case AT.FETCH_USER_RISK_SETTINGS_LOADING:
      return {
        ...state,
        userRiskSettings: Remote.Loading
      }
    case AT.FETCH_USER_RISK_SETTINGS_SUCCESS:
      return {
        ...state,
        userRiskSettings: Remote.Success(action.payload.userRiskSettings)
      }
    case AT.FETCH_USER_DATA_FAILURE:
      return {
        ...state,
        userData: Remote.Failure(action.payload.error)
      }
    case AT.FETCH_USER_DATA_LOADING:
      return {
        ...state,
        userData: Remote.Loading
      }
    case AT.FETCH_USER_DATA_SUCCESS:
      // @ts-ignore
      // FIXME: TypeScript getOrElse
      const oldValues = state.userData.getOrElse({})
      return {
        ...state,
        userData: Remote.Success(merge(oldValues, action.payload.userData))
      }
    case AT.FETCH_TIERS_FAILURE:
      return {
        ...state,
        userTiers: Remote.Failure(action.payload.error)
      }
    case AT.FETCH_TIERS_LOADING:
      return {
        ...state,
        userTiers: Remote.Loading
      }
    case AT.FETCH_TIERS_SUCCESS:
      return {
        ...state,
        userTiers: Remote.Success(action.payload.userTiers)
      }
    case AT.LINK_FROM_EXCHANGE_ACCOUNT_FAILURE:
      return {
        ...state,
        exchangeOnboarding: {
          ...state.exchangeOnboarding,
          linkFromExchangeAccountStatus: Remote.Failure(action.payload.error)
        }
      }
    case AT.LINK_FROM_EXCHANGE_ACCOUNT_LOADING:
      return {
        ...state,
        exchangeOnboarding: {
          ...state.exchangeOnboarding,
          linkFromExchangeAccountStatus: Remote.Loading
        }
      }
    case AT.LINK_FROM_EXCHANGE_ACCOUNT_SUCCESS:
      return {
        ...state,
        exchangeOnboarding: {
          ...state.exchangeOnboarding,
          linkFromExchangeAccountStatus: Remote.Success(action.payload.data)
        }
      }
    case AT.LINK_TO_EXCHANGE_ACCOUNT_FAILURE:
      return {
        ...state,
        exchangeOnboarding: {
          ...state.exchangeOnboarding,
          linkToExchangeAccountStatus: Remote.Failure(action.payload.error)
        }
      }
    case AT.LINK_TO_EXCHANGE_ACCOUNT_LOADING:
      return {
        ...state,
        exchangeOnboarding: {
          ...state.exchangeOnboarding,
          linkToExchangeAccountStatus: Remote.Loading
        }
      }
    case AT.LINK_TO_EXCHANGE_ACCOUNT_RESET:
      return {
        ...state,
        exchangeOnboarding: {
          ...state.exchangeOnboarding,
          linkFromExchangeAccountStatus: Remote.NotAsked,
          linkToExchangeAccountDeeplink: null
        }
      }
    case AT.LINK_TO_EXCHANGE_ACCOUNT_SUCCESS:
      return {
        ...state,
        exchangeOnboarding: {
          ...state.exchangeOnboarding,
          linkToExchangeAccountStatus: Remote.Success('true')
        }
      }
    case AT.SET_API_TOKEN_FAILURE:
      return {
        ...state,
        apiToken: Remote.Failure(action.payload.error)
      }
    case AT.SET_API_TOKEN_LOADING:
      return {
        ...state,
        apiToken: Remote.Loading
      }
    case AT.SET_API_TOKEN_NOT_ASKED:
      return {
        ...state,
        apiToken: Remote.NotAsked
      }
    case AT.SET_API_TOKEN_SUCCESS:
      return {
        ...state,
        apiToken: Remote.Success(action.payload.token)
      }
    case AT.SET_CAMPAIGN:
      return {
        ...state,
        campaign: action.payload.campaign
      }
    case AT.SET_LINK_TO_EXCHANGE_ACCOUNT_DEEPLINK:
      return {
        ...state,
        exchangeOnboarding: {
          ...state.exchangeOnboarding,
          linkToExchangeAccountDeeplink: action.payload.deeplink
        }
      }
    case AT.SHARE_WALLET_ADDRESSES_WITH_EXCHANGE_FAILURE:
      return {
        ...state,
        exchangeOnboarding: {
          ...state.exchangeOnboarding,
          shareWalletAddressesWithExchange: Remote.Failure(action.payload.error)
        }
      }
    case AT.SHARE_WALLET_ADDRESSES_WITH_EXCHANGE_LOADING:
      return {
        ...state,
        exchangeOnboarding: {
          ...state.exchangeOnboarding,
          shareWalletAddressesWithExchange: Remote.Loading
        }
      }
    case AT.SHARE_WALLET_ADDRESSES_WITH_EXCHANGE_SUCCESS:
      return {
        ...state,
        exchangeOnboarding: {
          ...state.exchangeOnboarding,
          shareWalletAddressesWithExchange: Remote.Success(action.payload.data)
        }
      }
    case AT.FETCH_SOFI_MIGRATION_STATUS_FAILURE:
      return {
        ...state,
        sofiData: Remote.Failure(action.payload.error)
      }
    case AT.FETCH_SOFI_MIGRATION_STATUS_LOADING:
      return {
        ...state,
        sofiData: Remote.Loading
      }
    case AT.FETCH_SOFI_MIGRATION_STATUS_SUCCESS: {
      return {
        ...state,
        sofiData: Remote.Success(action.payload)
      }
    }
    case AT.MIGRATE_SOFI_USER_FAILURE:
      return {
        ...state,
        sofiMigrationStatus: Remote.Failure(action.payload.error)
      }
    case AT.MIGRATE_SOFI_USER_LOADING: {
      return {
        ...state,
        sofiMigrationStatus: Remote.Loading
      }
    }

    case AT.MIGRATE_SOFI_USER_SUCCESS: {
      return {
        ...state,
        sofiMigrationStatus: Remote.Success(action.payload)
      }
    }
    case AT.SET_SOFI_LINK_DATA: {
      return {
        ...state,
        sofiLinkData: action.payload.linkData
      }
    }
    case AT.ASSOCIATE_SOFI_USER_FAILURE: {
      return {
        ...state,
        sofiAssociateNabuUser: Remote.Failure(action.payload.error)
      }
    }
    case AT.ASSOCIATE_SOFI_USER_LOADING: {
      return {
        ...state,
        sofiAssociateNabuUser: Remote.Loading
      }
    }
    case AT.ASSOCIATE_SOFI_USER_SUCCESS: {
      return {
        ...state,
        sofiAssociateNabuUser: Remote.Success(action.payload.boolean)
      }
    }

    case AT.SET_SOFI_USER_STATUS_FROM_POLLING: {
      return {
        ...state,
        sofiMigrationStatusFromPolling: Remote.Success(action.payload.sofiUserStatus)
      }
    }

    case AT.SET_SOFI_MIGRATED_BALANCES: {
      return {
        ...state,
        sofiMigrationTransferedBalances: Remote.Success(action.payload.balances)
      }
    }

    case AT.SET_SOFI_USER_STATUS: {
      return {
        ...state,
        sofiUserMigrationStatus: action.payload.sofiUserStatus
      }
    }

    default:
      return state
  }
}

export default profileReducer
