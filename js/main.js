// 取得 Canvas 元素和 2D 繪圖物件
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext('2d');

// 定義角色的位置和速度
const player1 = {
    x: 100,
    y: 100,
    dx: 0,
    dy: 0,
    width: 50,
    height: 50
};
const player2 = {
    x: 400,
    y: 300,
    dx: 0,
    dy: 0,
    width: 50,
    height: 50
};

//建立http
// const server = http.createServer(app);

//建立websocket伺服器
// const wss = new WebSocket.Server({ server });

// //當新的連
// wss.on('connection',(ws)=>{
//     //接收訊息
//     ws.on('message',(message)=>{
//         console.log(`Received message=>${message}`);
//     })
//     wss.clients.forEach((client)=>{

//     })
// })
// //廣播


// 設定 WebSocket 伺服器的網址
const wsUrl = "ws://localhost:3001";

// 建立 WebSocket 連線
const ws = new WebSocket(wsUrl);
ws.onerror = (error) => {
    console.error("WebSocket error:", error);
};
// 當 WebSocket 連線成功時，註冊按鍵事件並定期重新繪製畫面
ws.addEventListener("open", (event) => {
    console.log("WebSocket connection opened.");

    // 監聽鍵盤事件
    document.addEventListener("keydown", (event) => {
        let deltaX = 0;
        let deltaY = 0;
        switch (event.key) {
            case "ArrowLeft":
                deltaX = -10;
                break;
            case "ArrowRight":
                deltaX = 10;
                break;
            case "ArrowUp":
                deltaY = -10;
                break;
            case "ArrowDown":
                deltaY = 10;
                break;
            default:
                return;
        }
        player1.dx = deltaX;
        player1.dy = deltaY;

        // 將更新後的角色位置資訊傳送到伺服器端
        ws.send(JSON.stringify({
            type: "update",
            player: "player1",
            x: player1.x,
            y: player1.y,
            dx: player1.dx,
            dy: player1.dy
        }));
    });

    // 定期重新繪製畫面
    setInterval(() => {
        // 清空 Canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 更新角色位置
        player1.x += player1.dx;
        player1.y += player1.dy;

        // 繪製角色
        ctx.fillStyle = "red";
        ctx.fillRect(player1.x, player1.y, player1.width, player1.height);
        ctx.fillStyle = "blue";
        ctx.fillRect(player2.x, player2.y, player2.width, player2.height);
    });
});

		// 將更新後的角色位置資訊




