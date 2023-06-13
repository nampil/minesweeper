<template>
  <div class="cols">
    <div
      v-for="(cell, j) in props.cells"
      :key="j"
      :class="['cell', { 'no-revealed': !cell.revealed, flaged: cell.flaged }]"
      @click.stop="handleCellClick($event, j, cell)"
    >
      <transition name="flaged">
        <div v-if="cell.flaged" class="cell-in flaged">
          <i class="fa-solid fa-flag"></i>
        </div>
      </transition>
      <transition :name="getTransitionName(cell)">
        <div
          v-if="cell.revealed"
          :class="[
            'cell-in',
            {
              bee: cell.bee,
              vacia: cell.neighborCount <= 0,
              'n-a': cell.notAnimation,
            },
          ]"
        >
          <span v-if="cell.bee">
            <i class="fa-solid fa-bomb"></i>
          </span>
          <span v-if="cell.neighborCount > 0" class="text">
            {{ cell.neighborCount }}
          </span>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
  import { inject } from 'vue'
  const props = defineProps({
    cells: Object,
    i: Number,
  })

  const settings = inject('settings')
  const grid = inject('grid')
  const gameOver = inject('gameOver')
  const cols = settings.value.gridSize.cols
  const rows = settings.value.gridSize.rows

  const handleCellClick = (event, j, cell) => {
    if (event.shiftKey) {
      grid.value[props.i][j].flaged = !grid.value[props.i][j].flaged
      return
    }
    if (grid.value[props.i][j].flaged) return

    if (grid.value[props.i][j].bee) {
      gameOver()
      return
    }

    grid.value[props.i][j].reveal(
      grid.value,
      settings.value.gridSize.cols,
      settings.value.gridSize.rows
    )
  }

  const getTransitionName = (cell) => {
    let result = ''
    if (cell.neighborCount > 0 && !cell.notAnimation) {
      result = 'reveal'
    }

    return result
  }
</script>

<style lang="scss" scoped>
  .cell {
    border: 1px solid var(--clr-dark);
    width: var(--cell-size);
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    transform-style: preserve-3d;
  }

  .cell-in {
    width: 100%;
    height: 100%;
    font-family: 'Luckiest Guy', cursive;
    font-size: 1.3rem;
    line-height: 0;
    display: grid;
    color: var(--clr-dark);
    place-items: center;
    background-color: var(--clr-light);
    transform: translateZ(2rem);
    transform-style: preserve-3d;
    &.bee {
      color: var(--clr-accent-dark);
    }
    &.flaged {
      background: var(--clr-medium);
    }
  }
  .text {
    transform: translateZ(1rem);
    transform-style: preserve-3d;
  }
  .no-revealed {
    background: var(--clr-medium);
  }

  .reveal-enter-active {
    transition: all 400ms ease-in-out;
  }

  .reveal-enter-from {
    transform: rotateY(180deg);
  }
</style>
