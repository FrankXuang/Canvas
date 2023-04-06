var canvas = document.querySelector("canvas");
var tilesetContainer = document.querySelector(".tileset-container");
var tilesetSelection = document.querySelector(".tileset-container_selection");
var tilesetImage = document.querySelector("#tileset-source");

var selection = [0, 0]; //Which tile we will paint from the menu

var isMouseDown = false;
var currentLayer = 0;
var layers = [
    //Bottom
    {
        //Structure is "x-y": ["tileset_x", "tileset_y"]
        //EXAMPLE: "1-1": [3, 4],
    },
    //Middle
    {},
    //Top
    {}
];

function draw() {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    //px
    var size_of_crop = 48;
}

tilesetImage.onload = function () {
    // layers = defaultState;
    draw();
    setLayer(0);
}




tilesetImage.src = "https://assets.codepen.io/21542/TileEditorSpritesheet.2x_2.png";