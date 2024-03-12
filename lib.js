function removeElementAtIndex(arr, index) {
	if (index < 0 || index >= arr.length) {
		return arr
	}
	arr.splice(index, 1)
	return arr
}

function drawLine(fromX, fromY, toX, toY, color) {
	ctx.strokeStyle = color
	ctx.beginPath()
	ctx.moveTo(fromX, fromY)
	ctx.lineTo(toX, toY)
	ctx.stroke()
	ctx.closePath
}

function drawBoard() {
	ctx.fillStyle = '#fff'
	ctx.fillRect(0, 0, boardWidth * pixelSize, boardHeight * pixelSize)
	for (let i = 0; i <= boardWidth; i++) {
		drawLine(i * pixelSize, 0, i * pixelSize, boardHeight * pixelSize, '#000')
	}
	for (let i = 0; i <= boardWidth; i++) {
		drawLine(0, i * pixelSize, boardWidth * pixelSize, i * pixelSize, '#000')
	}
}

function drawPixel(x, y, color) {
	ctx.fillStyle = color
	ctx.fillRect(
		x * pixelSize + offsetX * pixelSize,
		y * pixelSize + offsetY * pixelSize,
		pixelSize,
		pixelSize
	)
}

function drawHighlight(ox, oy) {
	const x = ox + offsetX
	const y = oy + offsetY
	const color = '#0f0'
	for (let i = 0; i <= 3; i++) {
		drawLine(
			x * pixelSize,
			y * pixelSize,
			x * pixelSize + pixelSize / 4,
			y * pixelSize,
			color
		)
		drawLine(
			x * pixelSize,
			y * pixelSize,
			x * pixelSize,
			y * pixelSize + pixelSize / 4,
			color
		)
		drawLine(
			x * pixelSize + pixelSize,
			y * pixelSize,
			x * pixelSize + pixelSize - pixelSize / 4,
			y * pixelSize,
			color
		)
		drawLine(
			x * pixelSize + pixelSize,
			y * pixelSize,
			x * pixelSize + pixelSize,
			y * pixelSize + pixelSize / 4,
			color
		)
		drawLine(
			x * pixelSize,
			y * pixelSize + pixelSize,
			x * pixelSize + pixelSize / 4,
			y * pixelSize + pixelSize,
			color
		)
		drawLine(
			x * pixelSize,
			y * pixelSize + pixelSize,
			x * pixelSize,
			y * pixelSize + pixelSize - pixelSize / 4,
			color
		)
		drawLine(
			x * pixelSize + pixelSize,
			y * pixelSize + pixelSize,
			x * pixelSize + pixelSize,
			y * pixelSize + pixelSize - pixelSize / 4,
			color
		)
		drawLine(
			x * pixelSize + pixelSize,
			y * pixelSize + pixelSize,
			x * pixelSize + pixelSize - pixelSize / 4,
			y * pixelSize + pixelSize,
			color
		)
	}
}

const type = x => (x == null ? `${x}` : x.constructor.name)
