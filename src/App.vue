<template>
  <div
    :class="['container', `${currentTheme.name}`]"
    :style="`
          --grid-cols: ${settings.gridSize.cols}; 
          --grid-rows: ${settings.gridSize.rows};
          --cell-size: ${settings.cellSize};
          --clr-dark: ${currentTheme.dark};
          --clr-medium: ${currentTheme.medium};
          --clr-light: ${currentTheme.light};
          --clr-white: ${currentTheme.white};
          --clr-accent-light: ${currentTheme.accentLight};
          --clr-accent-dark: ${currentTheme.accentDark};
        `"
  >
    <header>
      <h1 class="title">N-MineSweeper</h1>
    </header>
    <div class="head" :style="`--max-width: `">
      <div class="head-level">
        <i class="fa-solid fa-bullseye"></i>
        <span>{{ currentLevel.id }}</span>
      </div>

      <div class="head-settings">
        <button @click="showSettings = !showSettings">
          <i class="fa-solid fa-gear"></i>
        </button>
        <button @click="handleAudio">
          <i class="fa-solid fa-music"></i>
        </button>
      </div>
    </div>
    <div class="game-grid">
      <cell-comp
        v-for="(cell, index) in grid"
        :key="index"
        :style="`--cell-size: ${settings.cellSize}px`"
        :cells="cell"
        :i="index"
      ></cell-comp>
      <transition name="boom">
        <div v-if="boom" class="boom" @click="setInit">
          <boom></boom>
        </div>
      </transition>
      <transition name="boom">
        <div v-if="win" class="win">
          <win></win>
        </div>
      </transition>
      <transition name="settings">
        <settings v-if="showSettings"></settings>
      </transition>
    </div>
    <div class="controls">
      <button class="start-over-btn" @click="setInit">Start Over</button>
      <div class="bombs">
        <i class="fa-solid fa-bomb"></i>
        <span>{{ mineCounter }}</span>
      </div>
      <div class="flags">
        <i class="fa-solid fa-flag"></i>
        <span>{{ flagCount }}</span>
      </div>
      <button class="submit-btn" @click="submit">Submit</button>
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted, ref, provide, onBeforeMount } from 'vue'
import CellComp from './components/CellComp.vue'
import Cell from './components/cell'
import Boom from './components/Boom.vue'
import Settings from './components/Settings.vue'
import Win from './components/Win.vue'
import bgAudioUrl from './assets/music-bg.mp3'
import gameOverFxUrl from './assets/game-over.wav'

const themeColors = ref([
  {
    id: 1,
    name: 'Default',
    dark: '#292f36',
    medium: '#4ecdc4',
    light: '#ffffff',
    white: '#fff',
    accentLight: '#ff6b6b',
    accentDark: '#292f36',
  },
  {
    id: 2,
    name: 'Purple',
    dark: '#9381ff',
    medium: '#b8b8ff',
    light: '#f8f7ff',
    white: '#fff',
    accentLight: '#ffeedd',
    accentDark: '#ffd8be',
  },
  {
    id: 3,
    name: 'Baby-blue',
    dark: '#001011',
    medium: '#6ccff6',
    light: '#757780',
    white: '#fffffc',
    accentLight: '#98ce00',
    accentDark: '#98ce00',
  },
  {
    id: 4,
    name: 'Screem',
    dark: '#e53d00',
    medium: '#ffe900',
    light: '#fcfff7',
    white: '#fff',
    accentLight: '#21a0a0',
    accentDark: '#046865',
  },
  {
    id: 5,
    name: 'Soft-orange',
    dark: '#564256',
    medium: '#fc814a',
    light: '#e8e8e8',
    white: '#fff',
    accentLight: '#bfbfbf',
    accentDark: '#96939b',
  },
  {
    id: 6,
    name: 'Pink',
    dark: '#7d387d',
    medium: '#c45baa',
    light: '#F1C5E6',
    white: '#fff',
    accentLight: '#e1d89f',
    accentDark: '#cd8b76',
  },
])

provide('theme-colors', themeColors)

const levels = ref([
  { id: 1, mines: 10 },
  { id: 2, mines: 20 },
  { id: 3, mines: 30 },
])
const settings = ref({
  level: 1,
  theme: 1,
  gridSize: {
    cols: 10,
    rows: 10,
  },
  cellSize: 35,
  music: true,
  sounds: true,
  lang: 'en',
})

provide('settings', settings)

const showSettings = ref(false)
const currentLevel = computed(() => {
  return levels.value[settings.value.level - 1]
})
const currentTheme = computed(() => {
  return themeColors.value.filter((t) => t.id === settings.value.theme)[0]
})

const win = ref(false)
const boom = ref(false)
const grid = ref([])
provide('grid', grid)
const flagCount = computed(() => {
  let counter = 0
  if (grid.value.length > 0) {
    const cols = settings.value.gridSize.cols
    const rows = settings.value.gridSize.rows
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (grid.value[i][j].flaged) {
          counter++
        }
      }
    }
  }
  return counter
})

const mineCounter = computed(() => {
  let counter = 0
  if (grid.value.length > 0) {
    const cols = settings.value.gridSize.cols
    const rows = settings.value.gridSize.rows
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (grid.value[i][j].boom) {
          counter++
        }
      }
    }
  }
  return counter
})

const submit = () => {
  const cols = settings.value.gridSize.cols
  const rows = settings.value.gridSize.rows
  let hits = 0
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid.value[i][j].flaged && grid.value[i][j].flaged) {
        hits++
      }
    }
  }

  const isGameOver = mineCounter.value === hits
  gameOver(isGameOver)
}

const gameOver = async (youwin) => {
  const cols = settings.value.gridSize.cols
  const rows = settings.value.gridSize.rows
  let options = []
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      options.push([i, j])
    }
  }
  shuffleArray(options)
  revealTiles(options)

  setTimeout(() => {
    if (youwin) {
      win.value = youwin
    } else {
      boom.value = true
      if (settings.value.sounds) {
        gameOverFx.value.play()
      }
    }
  }, 200)
}
provide('gameOver', gameOver)

const revealTiles = (options) => {
  let counter = 0
  for (let opt of options) {
    let i = opt[0]
    let j = opt[1]
    setTimeout(() => {
      grid.value[i][j].flaged = false
      grid.value[i][j].notAnimation = true

      grid.value[i][j].revealed = true

      counter++
    }, 150 * counter)
  }
}

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}

const setInit = () => {
  showSettings.value = false

  boom.value = false
  win.value = false

  const cols = settings.value.gridSize.cols
  const rows = settings.value.gridSize.rows

  const cells = new Array(cols)

  for (let i = 0; i < cells.length; i++) {
    cells[i] = new Array(rows)
  }

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const _cell = new Cell(i, j)
      cells[i][j] = _cell
    }
  }
  const options = []
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      options.push([i, j])
    }
  }

  for (let i = 0; i < currentLevel.value.mines; i++) {
    let index = Math.floor(Math.random() * options.length)
    let choice = options[index]
    let i = choice[0]
    let j = choice[1]
    options.splice(index, 1)
    cells[i][j].boom = true
  }
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      cells[i][j].countbooms(cells, cols, rows)
    }
  }
  grid.value = cells
}
provide('start-over', setInit)
const bgAudio = ref(null)
provide('bg-audio', bgAudio)
const gameOverFx = ref(null)

const handleAudio = () => {
  if (bgAudio.value.paused) {
    bgAudio.value.play()
  } else {
    bgAudio.value.pause()
    bgAudio.value.currentTime = 0
  }
}

onMounted(() => {
  setInit()
  bgAudio.value = new Audio(bgAudioUrl)
  bgAudio.value.loop = true
  bgAudio.value.volume = 0.2

  gameOverFx.value = new Audio(gameOverFxUrl)
})
onBeforeMount(async () => {
  const userSettings = await JSON.parse(localStorage.getItem('user-settings'))

  if (!userSettings) {
    localStorage.setItem('user-settings', JSON.stringify(settings.value))
  } else {
    settings.value = userSettings
  }
})
</script>

<style lang="scss">
:root {
  --max-width: 900px;
}
*,
*::after,
*::before {
  box-sizing: border-box;
}
body {
  background-color: #1d1d1d;
  color: #fff;
  font-family: 'Luckiest Guy', cursive;
}
.container {
  max-width: var(--max-width);
  background-color: #1d1d1d;
  margin: 0 auto;
  display: grid;
  place-items: center;
}
.title {
  background-image: linear-gradient(
    90deg,
    var(--clr-accent-light),
    var(--clr-medium)
  );
  background-clip: text;
  color: transparent;
}
.head {
  max-width: calc(var(--grid-cols) * var(--cell-size) * 1px);
  width: 100%;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .head-level {
    span {
      padding-left: 1rem;
    }
  }

  button {
    font-family: inherit;
    color: inherit;
    background-color: transparent;
    border: none;
    cursor: pointer;
  }
}
.game-grid {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: repeat(var(--grid-cols), max-content);
  grid-template-rows: repeat (var(--grid-rows), max-content);
  width: min-content;
  user-select: none;
}
.boom,
.win {
  position: absolute;
  inset: 0;
  svg {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.controls {
  margin-block: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: calc(var(--grid-cols) * var(--cell-size) * 1px);
  .start-over-btn,
  .submit-btn {
    cursor: pointer;
    font-family: inherit;
    color: inherit;
    background-color: var(--clr-dark);
    border: none;
    padding: 0.5rem 1rem;
  }
  .submit-btn {
    background-color: var(--clr-medium);
    color: var(--clr-dark);
  }

  .bombs,
  .flags {
    span {
      margin-left: 0.5rem;
    }
  }
}
.Default .controls .submit-btn,
.Pink .controls .submit-btn {
  color: var(--clr-accent-light);
}

// Transition animations

.boom-enter-active,
.boom-leave-active {
  transition: all 200ms ease-in-out;
}

.boom-enter-from {
  transform: scale(0);
}
.settings-enter-active:not(.boom, .vacia),
.settings-leave-active:not(.boom, .vacia) {
  transition: all 200ms ease-in-out;
}

.settings-enter-from,
.settings-leave-to {
  transform: translate(-100%);
}
</style>
