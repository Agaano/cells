const placeCellEnergyAmount = document.getElementById('energy')
let cursorType = 'Place'
document.getElementById('click-type').onchange = e => {
	cursorType = e.target.id
}
const placeCellTypeElement = document.getElementById('cell-type')

const selectedCellInfoElement = document.getElementById('selected-cell-info')
const selectedCellXElement = document.getElementById('selected-cell-x')
const selectedCellYElement = document.getElementById('selected-cell-y')
const selectedCellEnergyElement = document.getElementById(
	'selected-cell-energy'
)
const selectedCellTypeElement = document.getElementById('selected-cell-type')

let selectedInfoCell

document.onkeydown = e => {
	;({
		ArrowLeft: () => {
			offsetX += 1
		},
		ArrowRight: () => {
			offsetX -= 1
		},
		ArrowUp: () => {
			offsetY += 1
		},
		ArrowDown: () => {
			offsetY -= 1
		},
	})[e.key]?.()
}

canvas.onclick = e => {
	const clickedX = Math.floor(e.clientX / pixelSize) - offsetX
	const clickedY = Math.floor(e.clientY / pixelSize) - offsetY
	const findCellFunction = cell => cell.x === clickedX && cell.y === clickedY
	const cell = cells.find(findCellFunction)

	;({
		Place: () => {
			if (cell !== undefined) return
			;({
				regular_cell: () => {
					cells.push(new Cell(clickedX, clickedY, +placeCellEnergyAmount.value))
				},
				devouring_cell: () => {
					cells.push(
						new DevouringCell(clickedX, clickedY, +placeCellEnergyAmount.value)
					)
				},
				undevouring_cell: () => {
					cells.push(
						new UndevouringCell(
							clickedX,
							clickedY,
							+placeCellEnergyAmount.value
						)
					)
				},
				up_directed_cell: () => {
					cells.push(
						new UpDirectedCell(clickedX, clickedY, +placeCellEnergyAmount.value)
					)
				},
				down_directed_cell: () => {
					cells.push(
						new DownDirectedCell(
							clickedX,
							clickedY,
							+placeCellEnergyAmount.value
						)
					)
				},
			})[placeCellTypeElement.value]()
		},
		Delete: () => {
			console.log(cell === undefined)
			if (cell === undefined) return
			cells = removeElementAtIndex(
				[...cells],
				cells.findIndex(findCellFunction)
			)
			drawPixel(cell.x, cell.y, '#fff')
		},
		Replace: () => {
			if (cell === undefined) return
			cells = removeElementAtIndex(cells, cells.findIndex(findCellFunction))
			cells.push(new Cell(clickedX, clickedY, +placeCellEnergyAmount.value))
		},
		Info: () => {
			if (cell === undefined) return
			if (
				selectedInfoCell !== undefined &&
				cell.x === selectedInfoCell.x &&
				cell.y === selectedInfoCell.y
			) {
				selectedInfoCell?.onChange(() => {})
				selectedInfoCell = undefined
				selectedCellInfoElement.classList.remove('active')
				return
			}
			function changeInfoText(cell) {
				selectedCellXElement.innerText = `x: ${cell?.x}`
				selectedCellYElement.innerText = `y: ${cell?.y}`
				selectedCellEnergyElement.innerText = `energy: ${cell?.energy}`
				selectedCellTypeElement.innerText = `type: ${type(cell)}`
			}
			selectedInfoCell?.onChange(() => {})
			selectedCellInfoElement.classList.add('active')
			changeInfoText(cell)
			cell.onChange(changeInfoText)
			selectedInfoCell = cell
		},
	})[cursorType]()
}
let cells = [
]

function getNeighbours(cell, cells) {
	return [
		cells.find(thisCell => thisCell.x === cell.x - 1 && thisCell.y === cell.y),
		cells.find(thisCell => thisCell.x === cell.x + 1 && thisCell.y === cell.y),
		cells.find(thisCell => thisCell.x === cell.x && thisCell.y === cell.y - 1),
		cells.find(thisCell => thisCell.x === cell.x && thisCell.y === cell.y + 1),
	].filter(el => el !== undefined)
}

async function start() {
	drawBoard()
	cells.forEach(cell => {
		cell.step(getNeighbours(cell, cells))
		cell.render()
	})
	if (selectedInfoCell) {
		drawHighlight(selectedInfoCell.x, selectedInfoCell.y)
	}
	setTimeout(() => requestAnimationFrame(start), 100)
}
console.log(type(cells[0]))
console.log(type(cells[1]))
console.log(type(cells[2]))
start()
