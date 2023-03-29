//環境變數
var updateFPS = 30
var showMouse = true
var time = 0
var bgColor = "black"

//控制
var controls = {
    value: 0,
    showId: true,
    showMap: false
}
var gui = new dat.GUI()
gui.add(controls, "showId")
gui.add(controls, "showMap")

//------------------------
// Vec2

class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    set(x, y) {
        this.x = x;
        this.y = y;
    }
    move(x, y) {
        this.x += x;
        this.y += y;
    }
    add(v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    }
    sub(v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    }
    mul(s) {
        return new Vec2(this.x * s, this.y * s);
    }
    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    set length(nv) {
        let temp = this.unit.mul(nv);
        this.set(temp.x, temp.y);
    }
    clone() {
        return new Vec2(this.x, this.y);
    }
    toString() {
        return `(${this.x}, ${this.y})`;
    }
    equal(v) {
        return this.x == v.x && this.y == v.y;
    }
    get angle() {
        return Math.atan2(this.y, this.x);
    }
    get unit() {
        return this.mul(1 / this.length);
    }

}

//------
var canvas = document.getElementById("mycanvas");
var ctx = canvas.getContext('2d');
ctx.circle = function (v, r) {
    this.arc(v.x, v.y, r, 0, Math.PI * 2);
}
ctx.line = function (v1, v2) {
    this.moveTo(v1.x, v1.y);
    this.lineTo(v2.x, v2.y);
}


function initCanvas() {
    // ww = canvas.width = window.innerWidth;
    ww = canvas.width = 1000;
    // wh = canvas.height = window.innerHeight;
    wh = canvas.height = 1000;
}
initCanvas()


var global = {
    scale: 1,
    width: 4000,
    height: 4000,
    foodmax: 500,
    playermax: 50,
    collideFactor: 0
}

function map(value, min, max, nmin, nmax) {
    let l1 = max - min
    let l2 = nmax - nmin
    let ratio = l2 / l1
    return (value - min) * ratio + nmin
}

class Player {
    constructor(args) {
        let def = {
            id: parseInt(Math.random() * 100000),
            p: new Vec2(0, 0),
            v: new Vec2(map(Math.random(), 0, 1, -5, 5), map(Math.random(), 0, 1, -5, 5)),
            a: new Vec2(0, 0),
            mass: 100,
            living: true,
            color: `hsl(${Math.random() * 360},60%,50%)`
        }

        Object.assign(def, args)
        Object.assign(this, def)
    }
    draw() {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.p.x, this.p.y, this.r, 0, Math.PI * 2)
        ctx.fill()
        //寫出自己的Iｄ
        if (this.type != "food" && controls.showId) {
            ctx.font = "10px Arial"
            ctx.fillStyle = "white"
            ctx.textAlign = "center"
            ctx.fillText(parseInt(this.id), this.p.x, this.p.y)
        }
        //寫出正在追的目標id
        if (this.lastTarget && controls.showId) {
            ctx.font = "10px Arial"
            ctx.fillStyle = "white"
            ctx.textAlign = "center"
            ctx.fillText(this.lastTarget.id, this.p.x, this.p.y + 10)
        }
    }
    update() {
        //移動位置
        this.p.move(this.v.x, this.v.y)
        this.v.move(this.a.x, this.a.y)
        this.a = this.a.mul(0.98)
        //如果重量<0，設定此玩家陣亡
        if (this.mass < 0) {
            this.living = false
        }
        //如果是食物，會越來越慢
        if (this.type == "food") {
            this.v.x *= 0.95
            this.v.y *= 0.95
        }
        this.checkBoundary()
    }
    checkBoundary() {
        //邊界判斷
        if (this.p.x - this.r < -global.width / 2) {
            this.p.x = -global.width / 2 + this.r
        }
        if (this.p.x + this.r > global.width / 2) {
            this.p.x = global.width / 2 - this.r
        }
        if (this.p.y - this.r < -global.height / 2) {
            this.p.y = -global.height / 2 + this.r
        }
        if (this.p.y + this.r > global.height / 2) {
            this.p.y = global.height / 2 - this.r
        }
    }
    eat(target) {
        TweenMax.to(this, 0.1, { mass: this.mass + target.mass })
        target.living = false
    }
    get r() {
        return Math.sqrt(this.mass)
    }
    get maxSpeed() {
        return 30 / (1 + Math.log(this.r))
    }
    isTarget(p) {
        let result = p.r < this.r * 0.9 && p.p.sub(this.p).length < 500
        return result
    }
}

players = []
myplayers = []

function init() {
    //隨機加入玩家
    for (var i = 0; i < 300; i++) {
        players.push(new Player({
            mass: Math.random() * 1000 + 20,
            p: new Vec2(
                map(Math.random(), 0, 1, -global.height / 2, global.height / 2),
                map(Math.random(), 0, 1, -global.height / 2, global.height / 2),
            )
        }))

    }
    //設定使用者玩家
    players[0].mass = 500
    myplayers.push(players[0])

    //定時縮放尺寸
    setInterval(function () {
        let scale = 1 / Math.log(Math.sqrt(myplayers[0].r) / 4 + 2)
        TweenMax.to(global, 2, { scale: scale })
    }, 2000)

    //定時加入補新玩家跟食物
    setInterval(function () {
        if (players.filter(p => p.type == "food").length < global.foodmax) {
            players.push(new Player({
                mass: 10,
                p: new Vec2(
                    map(Math.random(), 0, 1, -global.height / 2, global.height / 2),
                    map(Math.random(), 0, 1, -global.height / 2, global.height / 2),
                ),
                v: new Vec2(0, 0),
                type: "food"
            }))
        }
        if (players.filter(p => p.type != "food").length < global.playermax) {
            players.push(new Player({
                mass: Math.random() * 1000 + 20,
                p: new Vec2(
                    map(Math.random(), 0, 1, -global.height / 2, global.height / 2),
                    map(Math.random(), 0, 1, -global.height / 2, global.height / 2),
                ),
            }))
        }
    }, 10)
}

function update() {
    time++
    let myplayer = myplayers[0]
    //處理所有玩家的互吃跟移動
    players.forEach((player, pid) => {
        //只有在玩家還活著的情況執行更新
        if (player.living) {
            player.update()

            //非自己玩家-敵人AI
            if (((time + pid * 5) % 20) == 0 && player.id != myplayer.id) {

                //20%機率清除目標亂走
                if (Math.random() < 0.2) {
                    player.lastTarget = null
                    //隨機指定一個角度的最大速度
                    let angle = Math.PI * 2 * Math.random()
                    let len = player.maxSpeed
                    player.speed = new Vec2(Math.cos(angle) * len, Math.sin(angle) * len)
                }
                //30%機率選定新目標
                if (Math.random() < 0.3) {
                    let targets = players.filter(t => player.isTarget(t))
                        .sort((p1, p2) => p2.mass - p1.mass).slice(0, 5)
                    //其他自動吃小圓
                    if (player.type != 'food' && player != myplayer) {
                        if (targets[0]) {
                            let delta = targets[0].p.sub(player.p)
                            let mm = delta.unit.mul(targets[0].maxSpeed / 2)
                            TweenMax.to(player.v, 0.4, { x: mm.x, y: mm.y, ease: Cubic.easeOut })
                            player.lastTarget = targets[0]
                        }
                    }
                }
            } else {
                //去追自己紀錄的目標
                if (player.lastTarget && player.lastTarget.living) {
                    let delta = player.lastTarget.p.sub(player.p)
                    let newV = delta.unit.mul(player.maxSpeed)
                    TweenMax.to(player.v, 0.2, { x: newV.x, y: newV.y })
                }
            }
            //吃掉別人 (同id是自己)
            players.forEach((player2, pid2) => {
                if (pid != pid2 && (player.id != player2.id) && player2.living) {
                    if (player.r * 0.9 > player2.r && player.p.sub(player2.p).length - 10 <= (player.r - player2.r)) {
                        player.eat(player2)
                    }
                }
            })
        }
    })

    //玩家所有 
    myplayers.forEach((c1, c1id) => {
        myplayers.forEach((c2, c2id) => {
            //只對不同配對做檢查
            if (c1id != c2id && c1.living && c2.living) {
                //讓球彼此聚集
                let delta = c2.p.sub(c1.p)
                if (delta.length < c1.r + c2.r) {
                    let pan = delta.unit.mul((c1.r + c2.r) * global.collideFactor)
                    c2.p = c1.p.add(pan)
                    c2.v = c1.v.clone()
                }

                //互吃（記得不要吃掉自己的0)
                delta = c2.p.sub(c1.p)
                if (global.collideFactor < 0.7 &&
                    delta.length < (c1.r + c2.r) * 0.6
                    && c2id != 0) {
                    c1.mass += c2.mass
                    c1.p = c1.p.add(c2.p).mul(0.5)
                    c2.living = false
                    // console.log(`${c1.id}(${c1.mass}) eat ${c2.id}(${c2.mass})`)

                }
            }
        })
    })

    //滑鼠控制所有球球（他們跟著第一顆）
    myplayers.forEach((c1, c1id) => {
        if (c1id != 0) {
            let mdelta = myplayer.p.sub(c1.p)
            c1.p = c1.p.add(mdelta.unit.mul(map(mdelta.length, 0, 100, 0, 1) * 20 / Math.sqrt(c1.r)))
            let delta = mousePos.sub(new Vec2(ww / 2, wh / 2)).mul(0.1)
            let deltaLen = Math.min(0, delta.length - c1.r)
            //若差距向量>最大速度  調整為最大速度
            if (delta.length > c1.maxSpeed) {
                delta = delta.unit.mul(c1.maxSpeed)
            }
            c1.v = delta
            c1.v = c1.v.add(c1.a)

        }
    })

    //移動主要球球
    let delta = mousePos.sub(new Vec2(ww / 2, wh / 2)).mul(0.1)
    let deltaLen = Math.min(0, delta.length - myplayer.r)
    if (delta.length > 10) {
        delta = delta.unit.mul(myplayer.maxSpeed)
    }
    myplayer.v = delta


    //移除掉死亡的球
    players = players.slice().filter(p => p.living)
    myplayers = myplayers.slice().filter(p => p.living)

    //如果玩家全陣亡，抓一顆當自己
    if (myplayers.length == 0) {
        myplayers.push(players.filter(p => p.type != 'food')[0])
    }

    // console.log(players[0].v)
}

var cen = new Vec2(0, 0)
function draw() {
    //清空背景
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, ww, wh)

    //-------------------------
    //   在這裡繪製

    cen = myplayers[0].p

    ctx.save()

    ctx.translate(ww / 2, wh / 2)
    ctx.scale(global.scale, global.scale)
    ctx.translate(-cen.x, -cen.y)
    ctx.beginPath()

    let gridWidth = 300
    let gcount = global.width / 2 / gridWidth

    //grid繪製隔線
    for (var i = -gcount; i <= gcount; i++) {
        ctx.moveTo(i * gridWidth, -global.width / 2)
        ctx.lineTo(i * gridWidth, global.width / 2)
        ctx.moveTo(-global.height / 2, i * gridWidth)
        ctx.lineTo(global.height / 2, i * gridWidth)

    }
    ctx.strokeStyle = "rgba(255,255,255,0.4)"
    ctx.stroke()

    //根據大小決定誰排在後後面繪製 （由小而大）
    players.slice().sort((p1, p2) => p1.r - p2.r).forEach(p => {
        if (p.living) {
            p.draw()
        }
    })
    ctx.restore()


    ctx.font = "20px Arial"
    ctx.fillStyle = "white"
    //總成績
    let score = myplayers.map(p => p.mass).reduce((total, mp) => { return total + mp }, 0)
    ctx.fillText("Score: " + parseInt(score), 30, 30)
    // ctx.fillText("collide: "+global.collideFactor,30,60)
    //繪製分數


    if (controls.showMap) {
        //小地圖
        ctx.save()
        ctx.translate(0, wh)
        ctx.scale(1 / 30, 1 / 30)
        ctx.translate(0, -global.height)
        ctx.fillStyle = "rgba(255,255,255,0.2)"
        ctx.fillRect(0, 0, global.width, global.height)
        ctx.translate(global.width / 2, global.height / 2)
        console.log(players.length)

        players.forEach(player => {
            if (player.type != "food") {

                ctx.beginPath()
                ctx.fillStyle = "white"
                let r = 20
                if (myplayers.map(mp => mp.id).indexOf(player.id) != -1) {
                    ctx.fillStyle = "red"
                    r = 100
                }
                ctx.arc(player.p.x, player.p.y, r, 0, Math.PI * 2)
                ctx.fill()
            }
        })


        ctx.restore()

    }




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

window.addEventListener('keydown', function (evt) {
    if (evt.key == " ") {
        let newballs = []
        global.collideFactor = 1
        if (global.splitTimer) {
            clearTimeout(global.splitTimer)
        }
        TweenMax.killTweensOf(global)
        global.splitTimer = setTimeout(() => {
            TweenMax.to(global, 10, { collideFactor: 0 })
        }, 8000)
        myplayers.forEach(mp => {
            if (mp.mass > 400) {

                TweenMax.to(mp, 0.2, { mass: mp.mass / 2 })
                let splitSelf = new Player({
                    id: mp.id,
                    mass: mp.mass / 2,
                    p: mp.p.clone(),
                    v: mousePos.sub(new Vec2(ww / 2, wh / 2)).unit.mul(mp.maxSpeed * 3),
                    a: mousePos.sub(new Vec2(ww / 2, wh / 2)).unit.mul(mp.maxSpeed * 3),
                    color: mp.color,
                })
                // TweenMax.to(splitSelf.p,0.3,{
                //   x: mp.x,
                //   y: mp.y
                // })
                newballs.push(splitSelf)
            }
        })

        players = players.concat(newballs)
        myplayers = myplayers.concat(newballs)
    }
    if (evt.key == "w") {
        myplayers.forEach(mp => {

            if (mp.mass > 200) {
                TweenMax.to(mp, 0.2, { mass: mp.mass - 100 })
                let mouseDelta = mousePos.sub(new Vec2(ww / 2, wh / 2))
                let mouseAngle = mouseDelta.angle
                let initR = mp.r + 10
                let initPosition = mp.p.add(new Vec2(initR * Math.cos(mouseAngle), initR * Math.sin(mouseAngle)))
                let args = {
                    p: initPosition,
                    v: mp.v.mul(1.5).add(mouseDelta.unit.mul(Math.random() * 5 + 10)),
                    mass: 80,
                    color: mp.color,
                    type: "food"
                }
                // console.log(args)
                players.push(new Player(args))

            }
        })
    }
})