//環境變數
var updateFPS = 30
var showMouse = true
var time = 0
var bgColor = "black"

//控制
var controls = {
    value: 0
}
var gui = new dat.GUI()
gui.add(controls, "value", -2, 2).step(0.01).onChange(function (value) { })

//------------------------
// Vec2

class Vec2 {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
    set(x, y) {
        this.x = x
        this.y = y
    }
    move(x, y) {
        this.x += x
        this.y += y
    }
    add(v) {
        return new Vec2(this.x + v.x, this.y + v.y)
    }
    sub(v) {
        return new Vec2(this.x - v.x, this.y - v.y)
    }
    mul(s) {
        return new Vec2(this.x * s, this.y * s)
    }
    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }
    set length(nv) {
        let temp = this.unit.mul(nv)
        this.set(temp.x, temp.y)
    }
    clone() {
        return new Vec2(this.x, this.y)
    }
    toString() {
        return `(${this.x}, ${this.y})`
    }
    equal(v) {
        return this.x == v.x && this.y == v.y
    }
    get angle() {
        return Math.atan2(this.y, this.x)
    }
    get unit() {
        return this.mul(1 / this.length)
    }

    static get ZERO() {
        return new Vec2(0, 0)
    }
    static get UP() {
        return new Vec2(0, -1)
    }
    static get DOWN() {
        return new Vec2(0, 1)
    }
    static get LEFT() {
        return new Vec2(-1, 0)
    }
    static get RIGHT() {
        return new Vec2(1, 0)
    }
    static DIR(str) {
        if (!str) {
            return Vec2.ZERO
        }
        let type = ("" + str).toUpperCase()
        return Vec2[type]
    }
    static DIR_ANGLE(str) {
        switch (str) {
            case "right":
                return 0
            case "left":
                return PI()
            case "up":
                return PI(-0.5)
            case "down":
                return PI(0.5)
        }
        return 0
    }

}

//------



var canvas = document.getElementById("mycanvas")
var ctx = canvas.getContext("2d")
ctx.circle = function (v, r) {
    this.arc(v.x, v.y, r, 0, Math.PI * 2)
}
ctx.line = function (v1, v2) {
    this.moveTo(v1.x, v1.y)
    this.lineTo(v2.x, v2.y)
}

let getVec2 = (args) => {
    if (args.length == 1) {
        return args[0]
    } else if (args.length == 2) {
        return new Vec2(args[0], args[1])
    }
}

let moveTo = function () {
    let v = getVec2(arguments)
    ctx.moveTo(v.x, v.y)
}
let lineTo = function () {
    let v = getVec2(arguments)
    ctx.lineTo(v.x, v.y)
}
let translate = function () {
    let v = getVec2(arguments)
    ctx.translate(v.x, v.y)
}
let arc = function () {
    ctx.arc.apply(ctx, arguments)
}
let rotate = (angle) => {
    if (angle != 0) {
        ctx.rotate(angle)
    }
}
let beginPath = () => { ctx.beginPath() }
let closePath = () => { ctx.closePath() }

let setFill = (color) => { ctx.fillStyle = color }
let setStroke = (color) => { ctx.strokeStyle = color }

let fill = (color) => {
    if (color) {
        setFill(color)
    }
    ctx.fill()
}
let stroke = (color) => {
    if (color) {
        setStroke(color)
    }
    ctx.stroke()
}

let save = (func) => {
    ctx.save()
    func()
    ctx.restore()
}


function initCanvas() {
    ww = canvas.width = window.innerWidth
    wh = canvas.height = window.innerHeight
}
initCanvas()

function init() {

}
function update() {
    time++
}
function draw() {
    //清空背景
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, ww, wh)

    //-------------------------
    //   在這裡繪製



    //-----------------------
    //繪製滑鼠座標

    ctx.fillStyle = "red"
    ctx.beginPath()
    ctx.circle(mousePos, 2)
    ctx.fill()

    ctx.save()
    ctx.beginPath()
    ctx.translate(mousePos.x, mousePos.y)
    ctx.strokeStyle = "red"
    let len = 20
    ctx.line(new Vec2(-len, 0), new Vec2(len, 0))
    ctx.line(new Vec2(0, -len), new Vec2(0, len))
    ctx.fillText(mousePos, 10, -10)
    ctx.stroke()
    ctx.restore()

    //schedule next render

    requestAnimationFrame(draw)
}
function loaded() {
    initCanvas()
    init()
    requestAnimationFrame(draw)
    setInterval(update, 1000 / updateFPS)
}
window.addEventListener("load", loaded)
window.addEventListener("resize", initCanvas)

//滑鼠事件跟紀錄
var mousePos = new Vec2(0, 0)
var mousePosDown = new Vec2(0, 0)
var mousePosUp = new Vec2(0, 0)

window.addEventListener("mousemove", mousemove)
window.addEventListener("mouseup", mouseup)
window.addEventListener("mousedown", mousedown)
function mousemove(evt) {
    mousePos.set(evt.x, evt.y)
    // console.log(mousePos)
}
function mouseup(evt) {
    mousePos.set(evt.x, evt.y)
    mousePosUp = mousePos.clone()

}
function mousedown(evt) {
    mousePos.set(evt.x, evt.y)
    mousePosDown = mousePos.clone()
}