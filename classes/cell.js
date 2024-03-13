class Cell {
	constructor(x, y, energy, resistance) {
		this.x = x
		this.y = y
		this.energy = energy ?? 0
		this.resistance = resistance ?? 0
	}
	onChangeFunc = () => {}
	energy = 0
	throughput = 12
	energyLifetime = this.throughput * 3
	prevEnergySenderX = 0
	prevEnergySenderY = 0
	prevEnergy = 0
	render() {
		drawPixel(
			this.x,
			this.y,
			this.energy < 0 ? '#00f' : this.energy === 0 ? '#000' : '#f00'
		)
	}
	step(neightbours) {
		if (this.energy !== this.prevEnergy)
			this.energyLifetime = this.throughput * 3
		else if (this.energy !== 0 && this.prevEnergy != 0) this.energyLifetime--
		if (this.energyLifetime <= 0) this.energy = 0
		if (neightbours.length === 0) {
			this.prevEnergy = this.energy
			this.onChangeFunc(this)
			return
		}
		if (this.energy - this.throughput <= 0) {
			this.onChangeFunc(this)
			this.prevEnergy = this.energy
			// this.energyLifetime--
			return
		}
		let energy = this.energy
		neightbours
			.filter(neightbour => neightbour.energy < this.energy)
			.map(neightbour => {
				if (
					neightbour.x === this.prevEnergySenderX &&
					neightbour.y === this.prevEnergySenderY
				)
					return
				this.energy -= neightbour.getEnergy(
					this.throughput / neightbours.length,
					this.x,
					this.y
				)
			})
		if (energy === this.energy) {
			this.energy--
		}
		this.onChangeFunc(this)
		this.prevEnergy = energy
	}
	getResistance(resistance) {
		this.resistance += resistance
		this.onChangeFunc(this)
		return resistance
	}
	giveResistance(resistance) {
		if (this.resistance <= resistance) {
			this.resistance = 0
			this.onChangeFunc(this)
			return resistance
		}
		this.resistance -= resistance
		this.onChangeFunc(this)
		return resistance
	}
	getEnergy(energy, x, y) {
		this.prevEnergySenderX = x
		this.prevEnergySenderY = y
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
			this.onChangeFunc(this)
			return energyToGive
		}
		this.energy -= energy
		this.onChangeFunc(this)
		return energy
	}
	prioGiveEnergy(energy) {
		if (this.energy < energy) {
			const s = this.energy
			this.energy = 0
			return s
		}
		this.energy -= energy
		return energy
	}
	prioGetEnergy(energy) {
		this.energy += energy
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

class NTypeTransistor extends Cell {
	throughput = 1
	render() {
		super.render()
		drawDevouringCell(this.x, this.y)
		drawTransistor(this.x, this.y)
	}
	step(neightbours) {
		if (neightbours.length === 0) return
		const output = neightbours.find(
			neightbour => neightbour instanceof TransistorOutput
		)
		const base = neightbours.find(
			neightbour => neightbour instanceof TransistorBase
		)
		const collector = neightbours.find(
			neightbour => neightbour instanceof TransistorCollector
		)
		if (!output || output.energy >= 100 || !base || !collector) return
		if (base.energy > 0) {
			output.getEnergy(collector.giveEnergy(this.throughput))
			output.getResistance(collector.giveResistance(this.throughput))
		}
		this.onChangeFunc(this)
	}
	getEnergy(energy) {
		return 0
	}
	giveEnergy(energy) {
		return 0
	}
}

class PTypeTransistor extends NTypeTransistor {
	step(neightbours) {
		if (neightbours.length === 0) return
		const output = neightbours.find(
			neightbour => neightbour instanceof TransistorOutput
		)
		const base = neightbours.find(
			neightbour => neightbour instanceof TransistorBase
		)
		const collector = neightbours.find(
			neightbour => neightbour instanceof TransistorCollector
		)
		if (!output || output.energy >= 100 || !base || !collector) return
		if (base.energy <= 0) {
			output.getEnergy(collector.giveEnergy(this.throughput))
			output.getResistance(collector.giveResistance(this.throughput))
		}
		this.onChangeFunc(this)
	}
}

class TransistorOutput extends Cell {
	render() {
		super.render()
		drawTransistor(this.x, this.y)
	}
}

class Capacitor extends Cell {
	throughput = 1
	render() {
		super.render()
		drawDevouringCell(this.x, this.y)
		drawVoidCell(this.x, this.y)
	}

	step(neightbours) {
		if (neightbours.length === 0) return
		neightbours.forEach(neightbour => {
			if (type(neightbour) === 'Cell') {
				this.energy += neightbour.giveEnergy(this.throughput)
			}
		})
		this.onChangeFunc(this)
	}

	giveEnergy(energy) {
		return 0
	}
}

class TransistorBase extends Cell {
	render() {
		super.render()
		drawCircleOutline(
			this.x * pixelSize + pixelSize / 2,
			this.y * pixelSize + pixelSize / 2,
			pixelSize / 10,
			'#fff'
		)
	}
}

class TransistorCollector extends Cell {
	directionToTransistor = undefined
	render() {
		super.render()
		if (!this.directionToTransistor) return
		;({
			right: () => {
				drawRightDirectCell(this.x, this.y)
			},
			left: () => {
				drawLeftDirectCell(this.x, this.y)
			},
			up: () => {
				drawUpDirectCell(this.x, this.y)
			},
			down: () => {
				drawDownDirectCell(this.x, this.y)
			},
		})[this.directionToTransistor]()
		drawDevouringCell(this.x, this.y)
	}
	step(neightbours) {
		super.step(neightbours)
		const transistor = neightbours.find(
			neightbour => neightbour instanceof NTypeTransistor
		)
		if (!transistor) return
		if (transistor.x > this.x) this.directionToTransistor = 'right'
		if (transistor.x < this.x) this.directionToTransistor = 'left'
		if (transistor.y > this.y) this.directionToTransistor = 'down'
		if (transistor.y < this.y) this.directionToTransistor = 'up'
	}
}

class InfinityCell extends Cell {
	throughput = 1
	constructor(x, y) {
		super(x, y, 100000)
	}
	render() {
		drawPixel(this.x, this.y, '#f00')
		drawVoidCell(this.x, this.y)
	}
	giveEnergy(energy) {
		return energy
	}
	getEnergy(energy) {
		return 0
	}

	step(neightbours) {
		if (neightbours.length === 0) return
		neightbours.forEach(neightbour => {
			neightbour.getEnergy(this.throughput)
		})
		return
	}
}

class VoidCell extends Cell {
	throughput = 0
	constructor(x, y) {
		super(x, y, 0)
	}

	render() {
		drawPixel(this.x, this.y, '#000')
		drawVoidCell(this.x, this.y)
	}

	getEnergy(energy) {
		return 0
	}

	giveEnergy(energy) {
		return 0
	}

	step(neightbours) {
		if (neightbours.length === 0) return
		neightbours.forEach(neightbour => {
			this.energy += neightbour.giveEnergy(neightbour.energy)
			if (type(neightbour) === 'Capacitor')
				this.energy += neightbour.prioGiveEnergy(neightbour.energy)
		})
		this.onChangeFunc(this)
		return
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
