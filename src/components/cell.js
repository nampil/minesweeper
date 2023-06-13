function Cell(i, j) {
  this.i = i
  this.j = j

  this.neighborCount = 0
  this.notAnimation = false
  this.bee = false
  this.flaged = false
  this.revealed = false
}

Cell.prototype.reveal = function (grid, cols, rows) {
  this.revealed = true
  if (this.neighborCount == 0) {
    this.floodFill(grid, cols, rows)
  }
}

Cell.prototype.countBees = function (grid, cols, rows) {
  if (this.bee) {
    this.neighborCount = -1
    return
  }

  let total = 0
  for (let xoff = -1; xoff <= 1; xoff++) {
    for (let yoff = -1; yoff <= 1; yoff++) {
      let i = this.i + xoff
      let j = this.j + yoff
      if (i > -1 && i < cols && j > -1 && j < rows) {
        let neighbor = grid[i][j]
        if (neighbor.bee) {
          total++
        }
      }
    }
  }
  this.neighborCount = total
}

Cell.prototype.floodFill = function (grid, cols, rows) {
  for (let xoff = -1; xoff <= 1; xoff++) {
    for (let yoff = -1; yoff <= 1; yoff++) {
      let i = this.i + xoff
      let j = this.j + yoff
      if (i > -1 && i < cols && j > -1 && j < rows) {
        let neighbor = grid[i][j]
        if (!neighbor.bee && !neighbor.revealed) {
          neighbor.reveal(grid, cols, rows)
        }
      }
    }
  }
}

export default Cell
