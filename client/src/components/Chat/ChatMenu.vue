<template>
  <div class="chatMenu">
    <div class="chatMenuHeader">
      <i
        style="font-size: 20px"
        class="pi pi-comments"
        aria-hidden="true"
      />
      <div class="positionsSettings">
        <ChatPositions
          :selected="chatStore.chatPosition === 'bottom'"
          :position="'bottom'"
          class="clickable positionsItem"
          @click="chatStore.switchPosition('bottom')"
        />
        <ChatPositions
          :selected="chatStore.chatPosition === 'right'"
          :position="'right'"
          class="clickable positionsItem"
          @click="chatStore.switchPosition('right')"
        />
        <ChatPositions
          :selected="chatStore.chatPosition === 'overlay'"
          :position="'overlay'"
          class="clickable positionsItem"
          @click="chatStore.switchPosition('overlay')"
        />
        <Button
          v-if="chatStore.responsiveMode"
          aria-label="close chat"
          icon="pi pi-arrow-left"
          class="p-button-rounded p-button-text positionsItem"
          @click="chatStore.toggleChatMenu"
        />
      </div>
    </div>
    <div class="chatMenuBody">
      <div style="width: 100%">
        <div class="chatMenuBodyCategory">
          <i
            style="font-size: 20px; margin-left: 7px; margin-right: 5px"
            :class="messageStore.getRecentChats.icon"
          />
          <div>{{ $t(`Chat.MenuOptions.${messageStore.getRecentChats.label}`) }}</div>
        </div>
        <div class="chatMenuBodyElements">
          <div
            v-for="(chat, chatIterator) in messageStore.getRecentChats.children"
            :key="`menu-recent-${chatIterator}`"
            class="clickable chatItem"
            @click="messageStore.selectChat(false, chat.id.toString())"
          >
            {{ chat.label }}
            <Badge
              v-if="chat.numberOfUnread !== 0"
              :value="chat.numberOfUnread.toString()"
              :severity="'danger'"
            />
          </div>
        </div>
      </div>
      <Button
        v-if="isLoggedIn"
        :label="$t('Chat.startNewChatButton')"
        icon="pi pi-plus"
        style="margin: 15px auto"
        @click="toggle"
      />
      <div
        v-for="(menuItem, menuItemIterator) in messageStore.getChatMenu"
        :key="`menu-${menuItemIterator}`"
        style="width: 100%"
      >
        <div
          class="chatMenuBodyCategory clickable"
          @click="messageStore.expandChatGroup(menuItemIterator)"
        >
          <i :class="`pi pi-angle-right expandedIcon ${menuItem.expanded ? 'rotate90' : ''}`" />
          <i
            style="font-size: 20px; margin-left: 7px; margin-right: 5px"
            :class="menuItem.icon"
          />
          <div>{{ $t(`Chat.MenuOptions.${menuItem.label}`) }}</div>
        </div>
        <div class="chatMenuBodyElements">
          <div
            v-for="(chat, chatIterator) in menuItem.children"
            :key="`menu-${menuItemIterator}-${chatIterator}`"
            class="clickable chatItem"
            :class="{ chatItemHidden: !menuItem.expanded }"
            @click="messageStore.selectChat(menuItemIterator === 2, chat.id.toString())"
          >
            {{ formatChannelName(chat.label, menuItemIterator === 2) }}
            <Badge
              v-if="chat.numberOfUnread !== 0"
              :value="chat.numberOfUnread.toString()"
              :severity="menuItemIterator < 2 ? 'danger' : 'warning'"
            />
          </div>
        </div>
      </div>
    </div>

    <OverlayPanel
      ref="overlayPanelRef"
      :showCloseIcon="true"
      :dismissable="true"
      appendTo="body"
      :baseZIndex="1000"
    >
      <ChatCreatorOverlay @close="closeOverlay" />
    </OverlayPanel>
  </div>
</template>

<script setup lang="ts">
import ChatPositions from '../icons/ChatPositions.vue'
import Badge from 'primevue/badge'
import Button from 'primevue/button'
import OverlayPanel from 'primevue/overlaypanel'
import ChatCreatorOverlay from './ChatCreatorOverlay.vue'

import { useChatStore } from '@/store/chat'
import { useMessagesStore, formatChannelName } from '@/store/messages'
import { ref } from 'vue'
import { isLoggedIn } from '@/services/useUser'

const chatStore = useChatStore()
const messageStore = useMessagesStore()

const overlayPanelRef = ref<OverlayPanel | null>()
function toggle(event: any) {
  overlayPanelRef.value?.toggle(event)
}
function closeOverlay() {
  overlayPanelRef.value?.hide()
}
</script>

<style scoped>
.chatMenu {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.positionsSettings {
  display: flex;
  align-items: center;
}

.positionsItem {
  height: 20px;
  padding: 2px;
}

.chatMenuHeader {
  flex: 0 0 48px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 5px;
  align-items: center;
  box-shadow: 0px 3px 3px -3px var(--gray-600);
}

.chatMenuBody {
  width: 100%;
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.chatMenuBodyCategory {
  display: flex;
  align-items: center;
  font-weight: bold;
  margin: 5px;
}

.expandedIcon {
  font-size: 20px;
  transition: transform 0.5s ease-in-out;
}

.rotate90 {
  transform: rotate(90deg);
}

.chatMenuBodyElements {
  width: 100%;
  padding-left: 40px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.chatItem {
  transition: max-height 0.3s ease-in-out;
  max-height: 40px;
  overflow: hidden;
}

.chatItemHidden {
  max-height: 0;
}
</style>
