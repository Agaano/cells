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
				right_directed_cell: () => {
					cells.push(
						new RightDirectedCell(
							clickedX,
							clickedY,
							+placeCellEnergyAmount.value
						)
					)
				},
				left_directed_cell: () => {
					cells.push(
						new LeftDirectedCell(
							clickedX,
							clickedY,
							+placeCellEnergyAmount.value
						)
					)
				},
				n_type_transistor: () => {
					cells.push(
						new NTypeTransistor(
							clickedX,
							clickedY,
							+placeCellEnergyAmount.value
						)
					)
				},
				p_type_transistor: () => {
					cells.push(
						new PTypeTransistor(
							clickedX,
							clickedY,
							+placeCellEnergyAmount.value
						)
					)
				},
				transistor_output: () => {
					cells.push(
						new TransistorOutput(
							clickedX,
							clickedY,
							+placeCellEnergyAmount.value
						)
					)
				},
				void_cell: () => {
					cells.push(new VoidCell(clickedX, clickedY))
				},
				capacitor: () => {
					cells.push(
						new Capacitor(clickedX, clickedY, +placeCellEnergyAmount.value)
					)
				},
				transistor_base: () => {
					cells.push(
						new TransistorBase(clickedX, clickedY, +placeCellEnergyAmount.value)
					)
				},
				transistor_collector: () => {
					cells.push(
						new TransistorCollector(
							clickedX,
							clickedY,
							+placeCellEnergyAmount.value
						)
					)
				},
				infinity_cell: () => {
					cells.push(
						new InfinityCell(clickedX, clickedY, +placeCellEnergyAmount.value)
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
let cells = []

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

function saveBoard() {
	const cellList = []
	cells.map(cell =>
		cellList.push({
			type: type(cell),
			x: cell.x,
			y: cell.y,
			energy: cell.energy,
		})
	)
	downloadAsFile(
		JSON.stringify(cellList),
		`${new Date(Date.now()).getTime()}.json`
	)
}

const uploadElement = document.getElementById('upload')
uploadElement.addEventListener('change', loadBoard)

function loadBoard(e) {
	const file = e.target.files[0]
	const fReader = new FileReader()
	fReader.onload = e => {
		const newCellsJSON = JSON.parse(e.target.result)
		cells = []
		newCellsJSON.map(newCell =>
			cells.push(
				{
					Cell: () => new Cell(newCell.x, newCell.y, newCell.energy),
					DevouringCell: () =>
						new DevouringCell(newCell.x, newCell.y, newCell.energy),
					UndevouringCell: () =>
						new UndevouringCell(newCell.x, newCell.y, newCell.energy),
					UpDirectedCell: () =>
						new UpDirectedCell(newCell.x, newCell.y, newCell.energy),
					DownDirectedCell: () =>
						new DownDirectedCell(newCell.x, newCell.y, newCell.energy),
					RightDirectedCell: () =>
						new RightDirectedCell(newCell.x, newCell.y, newCell.energy),
					LeftDirectedCell: () =>
						new LeftDirectedCell(newCell.x, newCell.y, newCell.energy),
					NTypeTransistor: () =>
						new NTypeTransistor(newCell.x, newCell.y, newCell.energy),
					PTypeTransistor: () =>
						new PTypeTransistor(newCell.x, newCell.y, newCell.energy),
					TransistorBase: () =>
						new TransistorBase(newCell.x, newCell.y, newCell.energy),
					TransistorCollector: () =>
						new TransistorCollector(newCell.x, newCell.y, newCell.energy),
					TransistorOutput: () =>
						new TransistorOutput(newCell.x, newCell.y, newCell.energy),
					VoidCell: () => new VoidCell(newCell.x, newCell.y, newCell.energy),
					InfinityCell: () =>
						new InfinityCell(newCell.x, newCell.y, newCell.energy),
					Capacitor: () => new Capacitor(newCell.x, newCell.y, newCell.energy),
				}[newCell.type]()
			)
		)
	}
	fReader.readAsText(file)
	e.target.value = null
}

function newBoard() {
	cells = []
}
