<template>
  <div class="waitingGame p-card">
    <div :class="`waitingGameHeader ${active ? '' : 'noWrapHeader'}`">
      <Tag
        severity="success"
        class="status-badge"
      >
        {{ active ? $t('Waiting.Icons.players', { X: game.nPlayers }) : game.nPlayers }}
        <PlayersTwo
          v-if="game.nPlayers === 4"
          class="Symbol SymbolMargin"
        />
        <PlayersThree
          v-else
          class="Symbol SymbolMargin"
        />
      </Tag>
      <Tag
        severity="danger"
        class="status-badge"
      >
        {{ active ? $tc('Waiting.Icons.teams', game.nTeams, { X: game.nTeams }) : game.nTeams }}
        <Teams
          :nTeams="game.nTeams"
          class="Symbol SymbolMargin"
        />
      </Tag>
      <Tag
        severity="warning"
        class="status-badge"
      >
        {{ active ? $t(`Waiting.Icons.${game.meister ? 'meister' : 'normal'}`) : '' }}
        <Brain
          v-if="game.meister"
          :color="'primary'"
          :class="`Symbol ${active ? 'SymbolMargin' : ''}`"
        />
        <Heart
          v-else
          :color="'primary'"
          :class="`Symbol ${active ? 'SymbolMargin' : ''}`"
        />
      </Tag>
      <Tag class="status-badge">
        {{ active ? $t(`Waiting.Icons.${game.private ? 'private' : 'public'}`) : '' }}
        <i :class="`pi pi-lock${game.private ? '' : '-open'} Symbol ${active ? 'SymbolMargin' : ''}`" />
      </Tag>
    </div>
    <div
      v-for="(teamIndex1, teamIndex) in game.nTeams"
      :key="`team-${String(teamIndex)}`"
      class="teamContainer"
    >
      <div class="teamTag">TEAM {{ teamIndex1 }}</div>
      <div class="teamBody">
        <div
          v-for="index in [...Array(game.nPlayers / game.nTeams).keys()]"
          :key="`playerKey-${game.id}-${index}-${String(teamIndex)}`"
          class="playerSlot"
        >
          <div
            v-if="game.players[playerIndex(Number(teamIndex), index)] != null"
            class="playerContainer"
          >
            <div
              v-if="active && game.players.slice(0, game.nPlayers).every((p) => p != null)"
              class="readyIcon"
            >
              <i
                v-if="game.ready[playerIndex(Number(teamIndex), index)]"
                class="pi pi-check"
                style="color: green"
              />
              <i
                v-if="!game.ready[playerIndex(Number(teamIndex), index)]"
                class="pi pi-spin pi-spinner"
                style="color: red"
              />
            </div>
            <BallsImage
              v-if="activeAndNotNull(playerIndex(Number(teamIndex), index))"
              :class="['playerBall', game.players[playerIndex(Number(teamIndex), index)] === username ? 'clickable' : '']"
              :color="game.balls[playerIndex(Number(teamIndex), index)]"
              @click="toggle($event, playerIndex(Number(teamIndex), index))"
            />
            <PlayerWithPicture
              :username="game.players[playerIndex(Number(teamIndex), index)]"
              :hideIfEmpty="true"
              :nameFirst="false"
              :clickable="active"
            />
          </div>
          <div class="playerControls">
            <div
              v-if="activeAndSelfOrAdmin(playerIndex(Number(teamIndex), index))"
              class="buttonUpDownSet"
            >
              <Button
                icon="pi pi-angle-up"
                class="p-button-rounded p-button-secondary p-button-sm p-button-text buttonUpDown"
                :disabled="playerIndex(Number(teamIndex), index) <= 0"
                @click="movePlayer(game.id, game.players[playerIndex(Number(teamIndex), index)], -1)"
              />
              <Button
                icon="pi pi-angle-down"
                class="p-button-rounded p-button-secondary p-button-sm p-button-text buttonUpDown"
                :disabled="playerIndex(Number(teamIndex), index) >= game.nPlayers - 1"
                @click="movePlayer(game.id, game.players[playerIndex(Number(teamIndex), index)], 1)"
              />
            </div>
            <Button
              v-if="activeAndSelfOrAdmin(playerIndex(Number(teamIndex), index))"
              icon="pi pi-times"
              class="p-button-rounded p-button-danger p-button-text"
              @click="removePlayer(game.players[playerIndex(Number(teamIndex), index)])"
            />
          </div>
        </div>
      </div>
    </div>
    <OverlayPanel ref="opRef">
      <BallsImage
        v-for="color in colors"
        :key="`overlayBall-${color}`"
        class="playerBall clickable"
        :color="color"
        @click="switchColor(color)"
      />
    </OverlayPanel>
    <div
      v-if="active"
      class="footerWithButtons p-card-footer"
    >
      <Button
        label="Diesen Warteraum verlassen"
        icon="pi pi-sign-out"
        class="p-button-danger"
        @click="removePlayer(username ?? '')"
      />
      <Button
        label="Bereit zum Starten?"
        icon="pi pi-caret-right"
        class="p-button-success"
        :disabled="game.players.slice(0, game.nPlayers).some((p) => p === null) || game.ready.find((_, index) => game.players[index] === username)"
        @click="setPlayerReady()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import OverlayPanel from 'primevue/overlaypanel'
import PlayerWithPicture from './PlayerWithPicture.vue'
import Brain from '@/components/icons/BrainSymbol.vue'
import Heart from '@/components/icons/HeartSymbol.vue'
import PlayersTwo from '@/components/icons/PlayersTwo.vue'
import PlayersThree from '@/components/icons/PlayersThree.vue'
import Teams from '@/components/icons/TeamsSymbol.vue'
import Tag from 'primevue/tag'

import type { WaitingGame } from '@/../../server/src/sharedTypes/typesWaiting'
import { withDefaults, computed, ref } from 'vue'
import { username } from '@/services/useUser'

import BallsImage from './assets/BallsImage.vue'

const props = withDefaults(defineProps<{ game: WaitingGame; active?: boolean }>(), { active: false })

const emit = defineEmits<{
  (eventName: 'move-player', data: { gameID: number; username: string; steps: number }): void
  (eventName: 'remove-player', username: string): void
  (eventName: 'ready-player', gameID: number): void
  (eventName: 'color-player', username: string, gameID: number, color: string): void
}>()

const opRef = ref<OverlayPanel | null>(null)

const colors = computed(() => {
  return ['black', 'blackWhite', 'blue', 'green', 'orange', 'red', 'melone', 'white', 'turquoise', 'pink', 'yellow'].filter((c) => !props.game.balls.some((b) => b === c))
})

const playerIndex = (teamIndex: number, index: number) => {
  return index + teamIndex * (props.game.nPlayers / props.game.nTeams)
}

const activeAndNotNull = (index: number) => {
  return props.game.players[index] != null && props.active
}

const activeAndSelf = (index: number) => {
  return props.game.players[index] != null && props.active && props.game.players[index] === username.value
}

const activeAndSelfOrAdmin = (index: number) => {
  return props.game.players[index] != null && props.active && (props.game.players[index] === username.value || props.game.admin === username.value)
}

const movePlayer = (gameID: number, username: string, steps: number) => {
  emit('move-player', {
    gameID: gameID,
    username: username,
    steps: steps,
  })
}

const removePlayer = (username: string) => {
  emit('remove-player', username)
}

const setPlayerReady = () => {
  emit('ready-player', props.game.id)
}

const toggle = (event: Event, index: number) => {
  if (activeAndSelf(index)) {
    opRef.value?.toggle(event)
  }
}

const switchColor = (color: string) => {
  opRef.value?.hide()
  emit('color-player', username.value ?? '', props.game.id, color)
}
</script>

<style scoped>
.waitingGame {
  flex: 0 0 200px;
  margin: 15px;
  min-height: 200px;
  padding: 10px;
  background-color: var(--surface-b);
}

.waitingGameHeader {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
}

.noWrapHeader {
  flex-wrap: nowrap;
}

.status-badge {
  text-transform: uppercase;
  margin: 2px;
}

.SymbolMargin {
  margin-left: 5px;
}

.Symbol {
  height: 20px;
  width: auto;
  object-fit: contain;
}

.buttonUpDownSet {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.buttonUpDown {
  width: 15px !important;
  height: 15px !important;
}

.teamContainer {
  margin: 20px 0px 0px 0px;
}

.teamTag {
  font-weight: bold;
  text-align: left;
  font-size: 0.6rem;
}

.teamBody {
  background: var(--surface-d);
  border-radius: 5px;
  padding: 5px;
}

.playerSlot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
}

.playerContainer {
  display: flex;
  align-items: center;
  justify-content: center;
}

.playerControls {
  display: flex;
  align-items: center;
  justify-content: center;
}

.playerBall {
  object-fit: contain;
  height: 1.8rem;
  margin: 0 8px;
}

.footerWithButtons {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}
</style>
