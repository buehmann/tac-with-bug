<template>
  <div>
    <Dropdown
      v-model="selectedLocale"
      :options="locales"
      optionLabel="name"
      @change="setLocale"
    >
      <template #value="slotProps">
        <div
          v-if="slotProps.value"
          class="country-item"
        >
          <LocaleIcons
            v-if="displayFlag"
            :countryCode="slotProps.value"
            class="flag"
          />
          <div
            v-if="displayText"
            class="text"
          >
            {{ $t(`Settings.Language.${slotProps.value}`) }}
          </div>
        </div>
      </template>
      <template #option="slotProps">
        <div class="country-item">
          <LocaleIcons
            v-if="displayFlag"
            :countryCode="slotProps.option"
            class="flag"
          />
          <div
            v-if="displayText"
            class="text"
          >
            {{ $t(`Settings.Language.${slotProps.option}`) }}
          </div>
        </div>
      </template>
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
import Dropdown from 'primevue/dropdown'

import { withDefaults, ref } from 'vue'
import { locales } from '@/../../server/src/sharedDefinitions/locales'
import { i18n, setLocaleAndLoadMessages } from '../services/i18n'
import { DefaultService as Service } from '@/generatedClient/index'
import router from '@/router/index'
import LocaleIcons from './assets/LocaleIcons.vue'

const props = withDefaults(
  defineProps<{
    displayText?: boolean
    displayFlag?: boolean
    uploadFlag?: boolean
  }>(),
  {
    displayText: true,
    displayFlag: true,
    uploadFlag: false,
  }
)

const selectedLocale = ref<string | undefined>()

selectedLocale.value = locales.find((l) => l === i18n.global.locale)

const setLocale = async () => {
  if (selectedLocale.value == null) {
    return
  }
  await setLocaleAndLoadMessages(i18n, selectedLocale.value)
  if (props.uploadFlag) {
    await Service.setSettingsLocale({ locale: selectedLocale.value })
  }

  router.push({ name: router.currentRoute.value.name != null ? router.currentRoute.value.name.toString() : 'Landing', params: { locale: selectedLocale.value } })
}
</script>

<style scoped>
.flag {
  width: 30px;
  height: 20px;
  object-fit: contain;
}

.text {
  margin-left: 5px;
}

.country-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>
