<template>
  <div style="display: flex; flex-direction: column; align-items: center">
    <div class="p-inputgroup">
      <InputText v-model="groupTitle" />
      <Button
        icon="pi pi-check"
        class="p-button-success"
        :disabled="groupTitle === messagesStore.getCurrentChat?.groupTitle || groupTitle.length < 3 || groupTitle.length >= 25"
        @click="changeTitle"
      />
    </div>
    <Divider />
    <PlayerWithPicture
      v-for="username in messagesStore.getCurrentChat?.players"
      :key="username"
      :username="username"
    />
    <Divider />
    <PlayersAutoComplete
      v-model:username="userToAdd"
      v-model:userid="userIdToAdd"
    />
    <Button
      :label="$t('Chat.GroupChatEditor.addPlayer')"
      style="margin-top: 10px"
      :disabled="userIdToAdd < 0 || userToAdd == ''"
      @click="addUser"
    />
    <Divider />
    <Button
      :label="$t('Chat.GroupChatEditor.leaveButton')"
      class="p-button-danger"
      @click="leaveChat"
    />
  </div>
</template>

<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import PlayerWithPicture from '../PlayerWithPicture.vue'
import PlayersAutoComplete from '../PlayersAutoComplete.vue'

import { ref } from 'vue'
import { useMessagesStore } from '@/store/messages'
import { injectStrict, SocketKey } from '@/services/injections'

const emits = defineEmits(['close'])

const socket = injectStrict(SocketKey)
const messagesStore = useMessagesStore()

const groupTitle = ref(messagesStore.getCurrentChat?.groupTitle ?? '')

async function changeTitle() {
  if (messagesStore.getCurrentChat?.chatid == null) {
    return
  }
  await socket.emitWithAck(5000, 'chat:changeTitle', { chatid: messagesStore.getCurrentChat?.chatid, title: groupTitle.value })
}

const userToAdd = ref('')
const userIdToAdd = ref(-1)

async function addUser() {
  if (messagesStore.getCurrentChat?.chatid == null) {
    return
  }
  const data = await socket.emitWithAck(5000, 'chat:addUser', { userid: userIdToAdd.value, chatid: messagesStore.getCurrentChat?.chatid })
  console.log(data)
  userToAdd.value = ''
  userIdToAdd.value = -1
}

async function leaveChat() {
  if (messagesStore.getCurrentChat?.chatid == null) {
    return
  }
  const data = await socket.emitWithAck(5000, 'chat:leaveChat', { chatid: messagesStore.getCurrentChat?.chatid })
  console.log(data)
  messagesStore.selectChat(true, 'general')
  emits('close')
}
</script>

<script scoped></script>
