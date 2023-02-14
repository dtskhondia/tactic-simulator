var canvas = document.getElementById('pitch');
var ctx = canvas.getContext('2d');

let circleCount = 0;
let dx = 2;
let dy = dx;

const playerConfig = {
  radius: canvas.height / 32,
  color: 'green',
  numberAlign: 'center',
  numberColor: 'black',
  numberFont: (canvas.height / 32) + 'px Comic Sans MS'
}

const ballConfig = {
  radius: playerConfig.radius / 2,
  color: 'red'
}

function move(obj, x, y, speed){
    let ratio = 1;
    let xFinished = false;
    let yFinished = false;

    if(obj.x < x) {
      obj.x += dx * speed;

      if(obj.x >= x){
        obj.x = x;
        xFinished = true;
      }

      ratio = Math.abs((obj.y - y)/(obj.x - x));
    } else if (obj.x > x) {
      obj.x -= dx * speed;

      if(obj.x <= x){
        obj.x = x;
        xFinished = true;
      }

      ratio = Math.abs((obj.y - y)/(obj.x - x));
    } else {
      xFinished = true;
    }
    
    if(obj.y < y){
      obj.y += dy * speed * ratio;

      if(obj.y >= y){
        obj.y = y;
        yFinished = true;
      }
    } else if(obj.y > y) {
      obj.y -= dy * speed * ratio;

      if(obj.y <= y){
        obj.y = y;
        yFinished = true;
      }
    } else {
      yFinished = true;
    }
    
    return !xFinished || !yFinished;
}

class Player {
  constructor(id, pos, x, y){
    this.id = id;
    this.pos = pos;
    this.x = x;
    this.y = y;
    this.isRunning = false;
  }

  run(x, y, speed){
    if(!this.isRunning) return;

    this.isRunning = move(this, x, y, speed);
  } 
}

class Ball {
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.isPassing = false;
  }

  pass(x, y, speed){
    if(!this.isPassing) return;
    this.isPassing = move(this, x, y, speed);
  }
}

let player1 = new Player(0, 1, canvas.width / 8, canvas.height / 8);
let player2 = new Player(1, 2, player1.x, canvas.height - player1.y);
let player3 = new Player(2, 3, canvas.width / 2, canvas.height / 2);
let player4 = new Player(3, 4, canvas.width - player1.x, player1.y);
let player5 = new Player(4, 5, canvas.width - player2.x, player2.y);

let ball = new Ball(player1.x, player1.y);

let players = [player1, player2, player3, player4, player5];
let positions = [player1.id, player2.id, player3.id, player4.id, player5.id];
let playersPrev = players.map(player => { return {...player} });;

function isRunning(){
  let res = false;
  players.forEach(player => {
    if (player.isRunning) res = true;
  });

  if(ball.isPassing) res = true;

  return res;
}; 

function drawPlayerNumber(player){
  ctx.beginPath();
  ctx.font = playerConfig.numberFont;
  ctx.fillStyle = playerConfig.numberColor;
  ctx.textAlign = playerConfig.numberAlign;
  ctx.fillText(player.id + 1, player.x, player.y);
  ctx.closePath();
}

function drawPlayer(player){
  ctx.beginPath();
  ctx.arc(player.x, player.y, playerConfig.radius, 0, 2*Math.PI);
  ctx.fillStyle = playerConfig.color;
  ctx.fill();
  ctx.closePath();
  drawPlayerNumber(player);
}

function drawBall(ball){
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ballConfig.radius,0, 2*Math.PI);
  ctx.fillStyle = ballConfig.color;
  ctx.fill();
  ctx.closePath();
}

function drawField(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  players.forEach(player => {
    drawPlayer(player);
  });

  drawBall(ball);
}

function getDistance(x1, y1, x2, y2){
  return Math.max(Math.abs(x1-x2), Math.abs(y1-y2));
}

function runCircle(player1, player2, player3){
  let dist1 = getDistance(player1.x, player1.y, playersPrev[player2.id].x, playersPrev[player2.id].y);
  let dist2 = getDistance(player2.x, player2.y, playersPrev[player3.id].x, playersPrev[player3.id].y);
  let dist3 = getDistance(player3.x, player3.y, playersPrev[player1.id].x, playersPrev[player1.id].y);

  let base = Math.min(dist1, dist2, dist3);

  player1.run(playersPrev[player2.id].x, playersPrev[player2.id].y, dist1/base);

  player2.run(playersPrev[player3.id].x, playersPrev[player3.id].y, dist2/base);
  
  player3.run(playersPrev[player1.id].x, playersPrev[player1.id].y, dist3/base);

  return base;
}

function simulate(){
  drawField();

  if(!isRunning()) {
    playersPrev = players.map(player => { return {...player} });

    if(circleCount%2 == 1){
      let tmpPosition = positions[0];
      positions[0] = positions[3];
      positions[3] = positions[2];
      positions[2] = tmpPosition;

      players[positions[1]].isRunning = true;
      players[positions[2]].isRunning = true;
      players[positions[4]].isRunning = true;
    } else {
      let tmpPosition = positions[1];
      positions[1] = positions[4];
      positions[4] = positions[2];
      positions[2] = tmpPosition;

      players[positions[0]].isRunning = true;
      players[positions[2]].isRunning = true;
      players[positions[3]].isRunning = true;
    }

    ball.isPassing = true;

    circleCount+=1;            
  };
  
  if(circleCount%2==1){
    let dist = getDistance(ball.x, 
                           ball.y, 
                           playersPrev[positions[1]].x, 
                           playersPrev[positions[1]].y);

    let base = runCircle(players[positions[0]], players[positions[2]], players[positions[3]]);

    console.log(dist,' -1- ', base);

    ball.pass(playersPrev[positions[1]].x, playersPrev[positions[1]].y, dist / base);
  } else {
    let dist = getDistance(ball.x, 
                           ball.y, 
                           playersPrev[positions[0]].x, 
                           playersPrev[positions[0]].y);

    let base = runCircle(players[positions[1]], players[positions[2]], players[positions[4]]);

    console.log(dist,' -2- ', base);

    ball.pass(playersPrev[positions[0]].x, playersPrev[positions[0]].y, dist / base);
  }

}

circleCount = 1;
ball.isPassing = true;
player1.isRunning = true;
player3.isRunning = true;
player4.isRunning = true;

setInterval(simulate, 10);