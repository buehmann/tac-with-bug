import type { GeneralSocketC } from '@/services/socket'
import type { GamesSummary } from './useGamesSummary'
import { InjectionKey, inject } from 'vue'
import { FriendsState } from './useFriends'

export const SocketKey: InjectionKey<GeneralSocketC> = Symbol('socket')
export const GamesSummaryKey: InjectionKey<GamesSummary> = Symbol('gamesSummary')
export const FriendsStateKey: InjectionKey<FriendsState> = Symbol('friendsState')

export function injectStrict<T>(key: InjectionKey<T>, fallback?: T): T {
  const resolved = inject(key, fallback)
  if (!resolved) {
    throw new Error(`Could not resolve ${key.description}`)
  }
  return resolved
}
