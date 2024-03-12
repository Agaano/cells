const canvas = document.querySelector('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const ctx = canvas.getContext('2d')
const pixelSize = 30
const boardWidth = canvas.width / pixelSize
const boardHeight = canvas.height / pixelSize

let offsetX = 0
let offsetY = 0
