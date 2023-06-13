<template>
  <div class="settings">
    <div class="theme">
      <p class="option-title">Select theme:</p>
      <div v-for="option in themeColors" :key="option.id" class="radio-group">
        <input
          type="radio"
          name="theme"
          :id="option.name"
          :checked="option.id === settings.theme"
          @change="handleSelectTheme(option.id)"
        />
        <label :for="option.name">{{ option.name }}</label>
        <div class="colors">
          <span class="opt-clr" :style="`--clr-opt: ${option.dark};`"></span>
          <span class="opt-clr" :style="`--clr-opt: ${option.medium};`"></span>
          <span class="opt-clr" :style="`--clr-opt: ${option.light};`"></span>
          <span class="opt-clr" :style="`--clr-opt: ${option.white};`"></span>
          <span
            class="opt-clr"
            :style="`--clr-opt: ${option.accentLight};`"
          ></span>
          <span
            class="opt-clr"
            :style="`--clr-opt: ${option.accentDark};`"
          ></span>
        </div>
      </div>
    </div>
    <div class="Sound">
      <p class="option-title">Sounds:</p>
      <div class="input-group">
        <label for="music">Music</label>
        <input
          type="checkbox"
          name="music"
          id="music"
          v-model="settings.music"
          @change="handleMusicSettings"
        />
      </div>
      <div class="input-group">
        <label for="music">Efects</label>
        <input type="checkbox" name="fx" id="fx" v-model="settings.sounds" />
      </div>
    </div>
    <div class="level">
      <p class="option-title">Select Level:</p>
      <div class="input-group">
        <label for="levels">Level</label>
        <select
          id="levels"
          name="levels"
          v-model="slectedLevel"
          @change="handleSelectLevel"
        >
          <option :value="1">1</option>
          <option :value="2">2</option>
          <option :value="3">3</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { inject, nextTick, onMounted, ref } from 'vue'
  const slectedLevel = ref(1)
  const settings = inject('settings')
  const startOver = inject('start-over')
  const themeColors = inject('theme-colors')
  const handleSelectLevel = () => {
    settings.value.level = slectedLevel.value
    nextTick(() => {
      localStorage.setItem('user-settings', JSON.stringify(settings.value))
    })
    startOver()
  }
  const bgAudio = inject('bg-audio')
  const handleMusicSettings = () => {
    if (settings.value.music) {
      bgAudio.value.play()
    } else {
      bgAudio.value.pause()
      bgAudio.value.currentTime = 0
    }
  }
  const handleSelectTheme = (themeId) => {
    settings.value.theme = themeId

    nextTick(() => {
      localStorage.setItem('user-settings', JSON.stringify(settings.value))
    })
  }
  onMounted(() => {
    slectedLevel.value = settings.value.level
  })
</script>

<style lang="scss" scoped>
  .settings {
    position: absolute;
    inset: 0;
    background-color: var(--clr-light);
    padding: 1rem;
    color: #333;
    overflow-y: auto;
  }
  .radio-group,
  .colors {
    display: flex;
  }

  .colors {
    align-items: center;
    margin-left: auto;
  }
  .opt-clr {
    background-color: var(--clr-opt);
    width: 10px;
    display: block;
    aspect-ratio: 1;
    border-radius: 50%;
    margin-inline: 0.125rem;
    border: 1px solid rgb(125, 125, 125);
  }
</style>
