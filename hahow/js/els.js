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

//PI轉換
let PI = n => n == undefined ?
    Math.PI : Math.PI * n;
//------------------------


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
    //關於事實的屬性ex: (0,-1)或是方法存於類別上
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
    //方向向量靜態
    static DIR(str) {
        if (!str) {
            return Vec2.ZERO
        }
        let type = ("" + str).toUpperCase()
        return Vec2[type]
    }
    //角度
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
    this.arc(v.x, v.y, r, 0, Math.PI * 2);
}
ctx.line = function (v1, v2) {
    this.moveTo(v1.x, v1.y);
    this.lineTo(v2.x, v2.y);
}
//兼容向量和xy值使用
let getVec2 = (args) => {
    if (args.length == 1) {
        return args[0];
    } else if (args.length == 2) {
        return new Vec2(args[0], args[1]);
    }
}
//arguments(function)
let moveTo = function () {
    let v = getVec2(arguments);
    ctx.moveTo(v.x, v.y);
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
    //apply接this
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
//坐標系轉移
let save = (func) => {
    ctx.save()
    func()
    ctx.restore()
}
// save(() => {
//     stroke(255);
//     translate(3, 5);
//     fill();
// })

function initCanvas() {
    ww = canvas.width = window.innerWidth
    wh = canvas.height = window.innerHeight
}
initCanvas()

//地圖
//除24定義格子寬度以確保在裡面
var WSPAN = Math.min(ww, wh) / 24;

//再20*20定義位置
function GETPOS(i, o) {
    let sourceV = getVec2(arguments);
    //原本原點左上
    // return sourceV.mul(WSPAN);

    //從中心
    return sourceV.mul(WSPAN).add(new Vec2(WSPAN / 2, WSPAN / 2));
}


//定位(這一個物件到底在哪裡)
//有兩個座標(1. io格子座標 2.實際上繪圖)
class GameObject {
    //物件
    constructor(args) {
        //建議物件def
        let def = {
            //兩座標確認
            p: Vec2.ZERO,
            gridP: Vec2.ZERO,
        }
        Object.assign(def, args);
        Object.assign(this, def);
        //轉換
        this.p = GETPOS(this.gridP);
    }
    //碰撞
    collide(gobj) {
        return this.p.sub(gobj.p).length < WSPAN;
    }
}

//食物
class Food extends GameObject {
    constructor(args) {
        super(args);
        //確認食物是否被吃掉/大力丸
        let def = {
            eaten: false,
            super: false,
        }
        Object.assign(def, args);
        Object.assign(this, def);
    }

    //前期角色位置定位，後續角色圖形出來覆蓋
    draw() {
        if (!this.eaten) {
            save(() => {
                translate(this.p);
                setFill('#f99595');
                if (this.super) {
                    //大力丸
                    //閃爍
                    if (time % 10 < 5) {
                        beginPath();
                        arc(0, 0, WSPAN / 5, 0, PI(2));
                        fill('white');
                    }

                } else {
                    //一般
                    let r = WSPAN / 10;
                    ctx.fillRect(-r, -r, r * 2, r * 2);
                }

            })
        }
    }
    get directionAngle() {
        return Vec2.DIR_ANGLE(this.currentDirection);
    }
}

//玩家
//class玩家 繼承來自GameObject
class Player extends GameObject {
    constructor(args) {
        super(args);
        //確認角色的是否移動/哪個方向移動/速度
        let def = {
            nextDirection: null,
            currentDirection: null,
            isMoving: false,
            speed: 10,
        }
        Object.assign(def, args);
        Object.assign(this, def);
    }

    //前期角色位置定位，後續角色圖形出來覆蓋
    draw() {
        beginPath();
        circle(this.p, 5);
        fill('white');
    }
    get directionAngle() {
        return Vec2.DIR_ANGLE(this.currentDirection);
    }

    //搭配方向事件去確認能否移動
    moveStep() {
        //判斷下一格
        let i0 = this.gridP.x;
        let o0 = this.gridP.y;
        //舊方向
        let oldDirection = this.currentDirection;

        let haveWall = map.getWalls(this.gridP.x, this.gridP.y);
        //判斷下一步方向是否有牆壁，紀錄非牆壁時可改變方向
        let avail = ['up', 'down', 'left', 'right'].filter(d => !haveWall[d]);

        //下一個方向
        //如果下一個指定方向沒有牆面，就更新方向
        if (!haveWall[this.nextDirection] && this.nextDirection) {
            this.currentDirection = this.nextDirection;
        }

        //根據方向更新位置
        this.gridP = this.gridP.add(Vec2.DIR(this.currentDirection));

        //判斷牆壁不能過去
        let isWall = map.isWall(this.gridP.x, this.gridP.y)
        if (!isWall) {
            this.isMoving = true;
            let moveStepTime = 10 / this.speed;

            //確認地圖邊界
            //如果在左右邊界且符合方向 => 瞬間跳躍
            if (this.gridP.x <= -1 && this.currentDirection == 'left') {
                this.gridP.x = 18;
                //取消中間滑動過程
                moveStepTime = 0;
            }
            if (this.gridP.x >= 19 && this.currentDirection == 'right') {
                this.gridP.x = 0
                moveStepTime = 0
            }


            TweenMax.to(this.p, moveStepTime, {
                //...展開(ES6)
                ...GETPOS(this.gridP),
                //上式展開等同於下式兩個
                //x:GETPOS(this.gridP).x,
                //y:GETPOS(this.gridP).y,
                ease: Linear.easeNone,
                //需用箭頭函數才能用this
                onCopmplete: () => {
                    this.isMoving = false;
                    this.moveStep();
                }
            })
            return true
        } else {
            //撞到牆壁初始化
            this.gridP.set(i0, o0);
            this.currentDirection = oldDirection;
        }

    }
}

//小精靈畫圖
//classPacman 繼承來自Player玩家
class Pacman extends Player {
    constructor(args) {
        super(args);
        let def = {
            //小精靈r半徑
            r: WSPAN / 2,
            deg: Math.PI / 4,

        }
        Object.assign(def, args);
        Object.assign(this, def);
    }
    draw() {
        let useDeg = PI(0.25);
        useDeg = this.deg;
        save(() => {
            translate(this.p);
            rotate(this.directionAngle);
            moveTo(Vec2.ZERO);
            rotate(useDeg);
            lineTo(this.r, 0);
            arc(0, 0, this.r, 0, PI(2) - useDeg * 2);
            closePath();
            fill('yellow');
        })
    }
}

//鬼畫圖
//classGhost 繼承來自Player玩家
class Ghost extends Player {
    constructor(args) {
        super(args);
        let def = {
            //小精靈r半徑
            r: WSPAN / 2,
            color: 'red',
            isEatable: false,
            isDead: false,
            deg: Math.PI / 4,

        }
        Object.assign(def, args);
        Object.assign(this, def);
    }
    draw() {
        let useDeg = PI(0.25);
        useDeg = this.deg;
        save(() => {
            translate(this.p);
            beginPath();
            arc(0, 0, this.r, PI(), 0);
            lineTo(this.r, this.r);

            //畫鋸齒狀
            //時間鋸齒動感
            let tt = parseInt(time / 3);
            let ttSpan = this.r * 2 / 7;
            let ttHeight = this.r / 3;
            for (var i = 0; i < 7; i++) {
                lineTo(this.r * 0.9 - ttSpan * i, ((i + tt) % 2 - 1) * ttHeight + this.r);
            }

            lineTo(-this.r, this.r);
            closePath();

            fill(this.color);

            //眼睛
            let eyeR = this.r / 3;
            let innerEyeR = eyeR / 2;
            //白白
            beginPath();
            arc(-this.r / 2.5, -eyeR, eyeR, 0, PI(2));
            arc(this.r / 2.5, -eyeR, eyeR, 0, PI(2));
            fill('white');
            //為了眼球朝移動方向
            save(() => {
                let innerEyePan = Vec2.DIR(this.currentDirection).mul(innerEyeR);
                translate(innerEyePan);
                //眼球
                beginPath();
                arc(-this.r / 2.5, -eyeR, innerEyeR, 0, PI(2));
                arc(this.r / 2.5, -eyeR, innerEyeR, 0, PI(2));
                fill('black');
            })

        })
    }
}

var pacman = new Pacman({
    gridP: new Vec2(7, 7),

})
var ghost = new Ghost({
    gridP: new Vec2(8, 7),

})

//TweenMax
TweenMax.to(pacman, 0.15, {
    deg: 0,
    ease: Linear.easeNone,
    repeat: -1,
    yoyo: true,
})

//畫地圖
class Map {
    constructor() {
        //定義地圖
        this.mapData = [
            "ooooooooooooooooooo",
            "o        o        o",
            "o oo ooo o ooo oo o",
            "o+               +o",
            "o oo o ooooo o oo o",
            "o    o   o   o    o",
            "oooo ooo o ooo oooo",
            "xxxo o       o oxxx",
            "oooo o oo oo o oooo",
            "       oxxxo       ",
            "oooo o ooooo o oooo",
            "xxxo o   x   o oxxx",
            "oooo ooo o ooo oooo",
            "o    o   o   o    o",
            "o oo o ooooo o oo o",
            "o+               +o",
            "o oo ooo o ooo oo o",
            "o        o        o",
            "ooooooooooooooooooo",

        ]
        //初始化
        this.init();
    }

    //小精靈/鬼以及食物放至
    init() {
        //加食物
        this.foods = [];
        for (var i = 0; i < 19; i++) {
            for (var j = 0; j < 19; j++) {
                let foodType = this.isFood(i, j);
                if (foodType) {
                    let food = new Food({
                        gridP: new Vec2(i, j),
                        super: foodType.super,
                    })
                    this.foods.push(food);
                }
            }
        }
    }
    isFood(i, o) {
        let type = this.getWallContent(i, o);
        if (type == '+' || type == " ") {
            return {
                super: type == "+",
            }
        }
        return false;
    }
    //牆壁繪圖
    draw() {
        for (var i = 0; i < 19; i++) {
            for (var j = 0; j < 19; j++) {
                save(() => {
                    translate(GETPOS(i, j));
                    setStroke('rgba(255,255,255,0.2');

                    //格線
                    // ctx.strokeRect(-WSPAN / 2, -WSPAN / 2, WSPAN, WSPAN);

                    //牆顏色
                    let walltype = this.getWalls(i, j);
                    setStroke('blue');
                    ctx.lineWidth = WSPAN / 5;
                    ctx.shadowColor = 'rgb(30,30,255)';
                    ctx.shadowBlur = 30;

                    //typecode沒有東西的話會承接上依次的值
                    //walltype回傳物件
                    let typecode = ['up', 'down', 'left', 'right']
                        .map(d => walltype[d] ? 1 : 0)
                        .join("");
                    // console.log(typecode);
                    if (walltype.none) {
                        typecode = "";
                    }
                    // typecode = walltype.none ? "" : typecode

                    //上下左右座標typecode
                    setFill('white');
                    // ctx.fillText(typecode, 0, 0);

                    //計算幾面牆
                    // '1100'.match(/1/g).length
                    // match(//g)為搜索全部，放入1為搜索幾個1
                    let countSide = (typecode.match(/1/g) || []).length;

                    //一格方塊裡面直線牆壁之間的距離
                    let wallspan = WSPAN / 4.5;
                    //一格方塊一半的寬度
                    let walllen = WSPAN / 2;

                    //劃出直線
                    // if (typecode == '1100') {
                    //     beginPath();
                    //     moveTo(wallspan, -walllen);
                    //     lineTo(wallspan, walllen);
                    //     moveTo(-wallspan, -walllen);
                    //     lineTo(-wallspan, walllen);
                    //     stroke();
                    // }

                    //用旋轉角度進行繪圖值線與橫線
                    if (typecode == '1100' || typecode == '0011') {
                        save(() => {
                            if (typecode == '0011') {
                                rotate(PI(0.5));
                            }
                            beginPath();
                            moveTo(wallspan, -walllen);
                            lineTo(wallspan, walllen);
                            moveTo(-wallspan, -walllen);
                            lineTo(-wallspan, walllen);
                            stroke();
                        })
                    } else if (countSide == 2) {
                        //定義角度旋轉幾度
                        let angles = {
                            '1010': 0,
                            '1001': 0.5,
                            '0101': 1,
                            '0110': 1.5,
                        }
                        save(() => {
                            rotate(PI(angles[typecode]));
                            beginPath();
                            arc(-walllen, -walllen, walllen + wallspan, 0, PI(0.5));
                            stroke();
                            beginPath();
                            arc(-walllen, -walllen, walllen - wallspan, 0, PI(0.5));
                            stroke();
                        })

                    }
                    //弧形接起來
                    if (countSide == 1) {
                        //定義角度旋轉幾度
                        let angles = {
                            '1000': 0,
                            '0001': 0.5,
                            '0100': 1,
                            '0010': 1.5,
                        }
                        save(() => {
                            rotate(PI(angles[typecode]));
                            beginPath();
                            arc(0, 0, wallspan, 0, PI());
                            stroke();
                            moveTo(wallspan, -walllen);
                            lineTo(wallspan, 0);
                            moveTo(-wallspan, -walllen);
                            lineTo(-wallspan, 0);
                            stroke();
                        })

                    }

                    if (countSide == 3) {
                        //定義角度旋轉幾度
                        let angles = {
                            '1011': 0,
                            '1101': 0.5,
                            '0111': 1,
                            '1110': 1.5,
                        }
                        save(() => {
                            rotate(PI(angles[typecode]));
                            //舉例1011繪圖
                            beginPath();
                            //左上小圓
                            arc(-walllen, -walllen, walllen - wallspan, 0, PI(0.5));
                            stroke();
                            beginPath();
                            //右上小圓
                            arc(walllen, -walllen, walllen - wallspan, PI(0.5), PI(1));
                            stroke();
                            beginPath();
                            //底下直線
                            moveTo(-walllen, wallspan);
                            lineTo(walllen, wallspan);
                            stroke();
                        })

                    }


                })
            }
        }
    }
    getWallContent(o, i) {
        //取陣列先取行再取第幾個
        //從零開始
        //map.getWallContent(1,3)取的"+"
        // return this.mapData[i][o];
        return this.mapData[i] && this.mapData[i][o];
    }
    isWall(i, o) {
        let type = this.getWallContent(i, o);
        //回傳布林值
        return type == "o";
    }

    //上下左右牆的情況
    getWalls(i, o) {
        return {
            up: this.isWall(i, o - 1),
            down: this.isWall(i, o + 1),
            left: this.isWall(i - 1, o),
            right: this.isWall(i + 1, o),
            none: !this.isWall(i, o),
        }
    }
}

var map;
function init() {
    map = new Map();
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
    save(() => {
        translate(ww / 2 - WSPAN * 10, wh / 2 - WSPAN * 10);
        map.draw();
        map.foods.forEach(food => food.draw());
        pacman.draw();
        ghost.draw();
    })


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
//抓取鍵盤
window.addEventListener('keydown', function (evt) {
    //按上下左右為ArrowUP/ArrowDown/ArrowLeft/ArrowRight
    //需取出方向並轉換成小寫設定下一個方向
    // console.log(evt.key);
    pacman.nextDirection = evt.key.replace('Arrow', '').toLowerCase();
    if (!pacman.isMoving) {
        pacman.moveStep();
    }
})
