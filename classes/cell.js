class Cell {
	constructor(x, y, energy) {
		this.x = x
		this.y = y
		this.energy = energy
	}
	onChangeFunc = () => {}
	energy = 0
	throughput = 12
	render() {
		drawPixel(
			this.x,
			this.y,
			this.energy < 0 ? '#00f' : this.energy === 0 ? '#000' : '#f00'
		)
	}
	step(neightbours) {
		if (neightbours.length === 0) return
		if (this.energy <= this.throughput) return
		neightbours.map(neightbour => {
			this.energy -= neightbour.getEnergy(this.throughput / neightbours.length)
		})
		this.onChangeFunc(this)
	}
	getEnergy(energy) {
		this.energy += energy
		this.onChangeFunc(this)
		return energy
	}
	giveEnergy(energy) {
		if (this.energy <= 0) {
			return 0
		}
		if (this.energy < energy) {
			const energyToGive = this.energy
			this.energy = 0
			return energyToGive
		}
		this.energy -= energy
		this.onChangeFunc(this)
		return energy
	}
	onChange(callback) {
		this.onChangeFunc = callback
	}
	highlight() {}
}

class DevouringCell extends Cell {
	render() {
		super.render()
		drawDevouringCell(this.x, this.y)
	}
	step(neightbours) {
		if (neightbours.length === 0) return 0
		if (this.energy >= 100) return 0
		neightbours.map(neightbour => {
			this.energy += neightbour.giveEnergy(this.throughput / neightbours.length)
		})
		this.onChangeFunc(this)
	}
	getEnergy(energy) {
		return 0
	}
}

class UndevouringCell extends Cell {
	throughput = 12
	render() {
		super.render()
		drawUndevouringCell(this.x, this.y)
	}
	step(neightbours) {
		if (neightbours.length === 0) return 0
		neightbours.map(neightbour => {
			if (neightbour instanceof DevouringCell) {
				const g = neightbour.giveEnergy(this.throughput / neightbours.length)
				if (g > 0) console.log(g)
				this.energy += g
			} else if (this.energy - this.throughput / neightbours.length >= 0) {
				this.energy -= neightbour.getEnergy(
					this.throughput / neightbours.length
				)
			}
		})
		this.onChangeFunc(this)
	}
	giveEnergy(energy) {
		return 0
	}
}

class DirectedCell extends Cell {
	getEnergy(energy) {
		return 0
	}
	giveEnergy(energy) {
		return 0
	}
}

class UpDirectedCell extends DirectedCell {
	render() {
		super.render()
		drawUpDirectCell(this.x, this.y)
	}
	step(neightbours) {
		const from = neightbours.find(neightbour => neightbour.y > this.y)
		const to = neightbours.find(neightbour => neightbour.y < this.y)
		if (!from || !to) return
		to.getEnergy(from.giveEnergy(this.throughput))
		this.onChangeFunc(this)
	}
}

class DownDirectedCell extends DirectedCell {
	render() {
		super.render()
		drawDownDirectCell(this.x, this.y)
	}
	step(neightbours) {
		const from = neightbours.find(neightbour => neightbour.y < this.y)
		const to = neightbours.find(neightbour => neightbour.y > this.y)
		if (!from || !to) return
		to.getEnergy(from.giveEnergy(this.throughput))
		this.onChangeFunc(this)
	}
}
class RightDirectedCell extends DirectedCell {
	render() {
		super.render()
		drawRightDirectCell(this.x, this.y)
	}
	step(neightbours) {
		const from = neightbours.find(neightbour => neightbour.x < this.x)
		const to = neightbours.find(neightbour => neightbour.x > this.x)
		if (!from || !to) return
		to.getEnergy(from.giveEnergy(this.throughput))
		this.onChangeFunc(this)
	}
}
class LeftDirectedCell extends DirectedCell {
	render() {
		super.render()
		drawLeftDirectCell(this.x, this.y)
	}
	step(neightbours) {
		const from = neightbours.find(neightbour => neightbour.x > this.x)
		const to = neightbours.find(neightbour => neightbour.x < this.x)
		if (!from || !to) return
		to.getEnergy(from.giveEnergy(this.throughput))
		this.onChangeFunc(this)
	}
}
