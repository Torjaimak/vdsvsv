// ตัวแปรเริ่มต้น, ผู้เล่น
let board;
let boardWidth = 1000;
let boardHeight = 300;
let context;
let playerWidth = 85;
let playerHeight = 85;
let playerX = 50;
let playerY = 215;
let playerImg;
let player = {
    x: playerX,
    y: playerY,
    width: playerWidth,
    height: playerHeight
};
let gameOver = false;
let score = 0;
let time = 0;
let live = 4;

// ตัวกล่อง
let boxImg;
let boxWidth = 60;
let boxHeight = 100;
let boxX = 1100;
let boxY = 215;




// การตั้งค่าตัวกล่อง
let boxesArray = [];
let boxSpeed = -3;

// แรงโน้มถ่วง, ความเร็ว
let VelocityY = 0;
let Gravity = 0.25;
let isJumping = false; // ตัวแปรเพื่อบอกว่าผู้เล่นกำลังกระโดดหรือไม่

console.log(player);

// โหลดภาพชีวิต
let livesImgs = [];
for (let i = 0; i < 4; i++) {
    let img = new Image();
    img.src = "https://imgcdn.sigstick.com/jqHzOGywrevfEVwDai22/2.thumb128.webp"; // เปลี่ยน URL ให้เป็นภาพที่ต้องการใช้
    livesImgs.push(img);

}

window.onload = function() {
    // แสดงผล
    board = document.getElementById("Board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // ผู้เล่น
    playerImg = new Image();
    playerImg.src = "https://imgcdn.sigstick.com/VHrPt77W58pWz1lzjyTE/cover-1.png";
    playerImg.onload = function() {
        context.drawImage(playerImg, player.x, player.y, player.width, player.height);
    };

 

    // กล่อง
    boxImg = new Image();
    boxImg.src = "https://imgcdn.sigstick.com/xe9V0Eq5CSBAJ5WWG1C6/9-1.thumb128.png";

    // ปุ่ม Start และ Retry
    let startButton = document.getElementById("startButton");
    let retryButton = document.getElementById("retryButton");
    retryButton.style.display = "none"; // ซ่อนปุ่ม retry เริ่มต้น

    // เพิ่ม Event Listener
    startButton.addEventListener("click", startGame);
    retryButton.addEventListener("click", function() {
        gameReset();
        retryButton.style.display = "none";
        
    });

    document.addEventListener("keydown", movePlayer);
    document.addEventListener("keyup", stopJump); // ฟังการปล่อยปุ่ม Space Bar

    // ซ่อนปุ่ม Start เมื่อเริ่มเกม
    startButton.style.display = "block";
};

// ฟังก์ชันเริ่มเกม
function startGame() {
    let startButton = document.getElementById("startButton");
    if (startButton) {
        startButton.style.display = "none"; // ซ่อนปุ่มเริ่มเกม
    }
    gameReset(); // รีเซ็ตเกม
    requestAnimationFrame(update); // เริ่มลูปเกม
}


// ฟังก์ชันสร้างกล่องที่มีช่วงเวลาแบบสุ่ม
let boxCreationInterval;

function createBoxWithRandomInterval() {
    if (gameOver) {
        if (boxCreationInterval) {
            clearTimeout(boxCreationInterval);
            boxCreationInterval = null; // กำหนดเป็น null หลังจากหยุด
        }
        return;
    }

    createBox(); // สร้างกล่องใหม่
    let randomTime = rnd(1000, 3000);
    boxCreationInterval = setTimeout(createBoxWithRandomInterval, randomTime);
}


function rnd(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



// ฟังก์ชันอัปเดต
function update() {
    requestAnimationFrame(update); // อัปเดตแอนิเมชันตลอดเวลา

    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);
    VelocityY += Gravity;

    player.y = Math.min(player.y + VelocityY, playerY);
    context.drawImage(playerImg, player.x, player.y, player.width, player.height);

    // แสดงกล่อง
    for (let index = 0; index < boxesArray.length; index++) {
        let box = boxesArray[index];
        box.x += boxSpeed;
        context.drawImage(box.img, box.x, box.y, box.width, box.height);

        if (onCollision(player, box)) {
            handleGameOver("GameOver!");
            return; // หยุดการทำงานหากเกิดการชน
        }
    }

    score++;
    time += 0.01;
    context.font = "normal bold 40px Arial";
    context.textAlign = "left";
    context.fillText("Score : " + score, 700, 30);
    context.fillText("Time : " + time.toFixed(0), 20, 40);

    // แสดงชีวิตที่เหลือ (ปรับขนาดภาพให้ใหญ่ขึ้น)
    for (let i = 0; i < live; i++) {
        context.drawImage(livesImgs[i], 20 + (i * 60), 80, 70, 70); // วาดภาพชีวิตใหญ่ขึ้น (50x50 พิกเซล)
    }

    if (time >= 60) {
        handleGameOver("You Won! With Score :" + score);
    }
}



function movePlayer(e) {
    if (gameOver) {
        return;
    }

    if (e.code === "Space") {
        if (!isJumping && player.y === playerY) {
            VelocityY = -10;
            isJumping = true;
        }
    }
}

function stopJump(e) {
    if (e.code === "Space") {
        isJumping = false;
    }
}

function createBox() {
    if (gameOver) {
        return;
    }

    let box = {
        img: boxImg,
        x: boxX,
        y: boxY,
        width: boxWidth,
        height: boxHeight
    };

    boxesArray.push(box);

    if (boxesArray.length > 5) {
        boxesArray.shift(); // ลบกล่องที่เก่าออกหากมีมากกว่า 5 กล่อง
    }
}

function onCollision(obj1, obj2) {
    return obj1.x < (obj2.x + obj2.width) && (obj1.x + obj1.width) > obj2.x // ตรวจสอบการชนในแนวแกน X
        && obj1.y < (obj2.y + obj2.height) && (obj1.y + obj1.height) > obj2.y; // ตรวจสอบการชนในแนวแกน Y
}

function gameReset() {
    if (live > 1) {
        gameOver = false;
        live -= 1;
        score = 0;
        time = 0;
        boxesArray = [];
        
        // รีเซ็ตตำแหน่งและความเร็วของผู้เล่น
        player.y = playerY;
        VelocityY = 0;

        // สร้างกล่องใหม่
        if (boxCreationInterval) {
            clearTimeout(boxCreationInterval);
        }
        createBoxWithRandomInterval();
    } else {
        // จัดการกรณีที่ไม่มีชีวิตเหลืออยู่ เช่น จบเกมหรือแสดงข้อความ
    }
}

function handleGameOver(message) {
    gameOver = true;
    context.clearRect(0, 0, board.width, board.height); // เคลียร์แคนวาสก่อนวาดข้อความ
    context.font = "normal bold 40px Arial";
    context.textAlign = "center";
    context.fillText(message, boardWidth / 2, boardHeight / 2);
    
    // แสดงปุ่ม retry
    let retryButton = document.getElementById("retryButton");
    retryButton.style.display = "block";
}

