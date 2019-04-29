log = console.log.bind(console);

/**
 * 生成 canvas 元素
 * @param {HTMLElement} container HTML 元素
 * @param {Object} dimensions 游戏画布的尺寸
 * @param {Object} opt_className CSS 类名
 * @return {HTMLCanvasElement}
 */
function createCanvas(container, dimensions, opt_className) {
  var canvas = document.createElement('canvas');

  canvas.width = dimensions.WIDTH;
  canvas.height = dimensions.HEIGHT;
  canvas.className = opt_className
    ? opt_className + ' ' + Breakout.classes.CANVAS
    : Breakout.classes.CANVAS;
  
  container.appendChild(canvas);

  return canvas;
}

/**
 * 获取当前时间戳
 * @return {Number}
 */
function getTimeStamp() {
  return Math.round(performance.now());
}

/**
 * 生成碰撞盒子
 * @param {Number} x X 坐标
 * @param {Number} y Y 坐标
 * @param {Number} w 宽度
 * @param {Number} h 高度
 * @constructor
 */
function CollisionBox(x, y, w, h) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
}

/**
 * 检测小球碰撞到挡板的位置是上面还是两边
 * @param {Object} ball 小球
 * @param {Object} obstacle 障碍物（挡板，砖块）
 * @param {HTMLCanvasContext} opt_canvas 画布元素
 * @return {String}
 */
function checkCollision(ball, obstacle, opt_canvas) {
  var ballBox = new CollisionBox(
    ball.xPos, ball.yPos,
    ball.dimensions.WIDTH, ball.dimensions.HEIGHT
  );
  var obstacleBox = new CollisionBox(
    obstacle.xPos, obstacle.yPos,
    obstacle.dimensions.WIDTH, obstacle.dimensions.HEIGHT
  );

  // debug - 绘制碰撞盒子
  if (opt_canvas) {
    drawCollisionBoxes(opt_canvas, ballBox, obstacleBox);
  }

  // 最外层的盒子碰撞
  if (boxCompare(ballBox, obstacleBox)) {
    if (ballBox.y + (ballBox.h / 2) <
      obstacleBox.y + (obstacleBox.h) / 2) {
        log(1);
      var bBoxes = ball.collisionBoxes;     // 小球的碰撞盒子
      var oBoxes = obstacle.collisionBoxes; // 障碍物的碰撞盒子

      for (var i = 0; i < bBoxes.length; i++) {
        for (var j = 0; j < oBoxes.length; j++) {
          // 基于最外层的碰撞盒子，来调整里面小碰撞盒子的位置
          var adjustBallBox =
            adjustCollisionBox(bBoxes[i], ballBox);
          var adjustObstacleBox =
            adjustCollisionBox(oBoxes[j], obstacleBox);
          
          if (opt_canvas) {
            drawCollisionBoxes(opt_canvas,
              adjustBallBox, adjustObstacleBox);
          }
  
          if (boxCompare(adjustBallBox, adjustObstacleBox)) {
            return 'side';
          }
        }
      }
  
      return 'up';
    } else {
      return 'drop';
    }
  }

  return '';
}

/**
 * 绘制碰撞盒子（debug 时使用）
 * @param {HTMLCanvasElement} canvas 画布元素
 * @param {CollisionBox} ballBox 小球的碰撞盒子
 * @param {CollisionBox} paddleBox 挡板的碰撞盒子
 * @param {CollisionBox} brickBox 砖块的碰撞盒子
 */
function drawCollisionBoxes(canvas, ballBox, paddleBox, brickBox) {
  var ctx = canvas.getContext('2d');

  ctx.save();

  if (ballBox) {
    ctx.strokeStyle = '#0f0';
    ctx.strokeRect(ballBox.x, ballBox.y, ballBox.w, ballBox.h);
  }

  if (paddleBox) {
    ctx.strokeStyle = '#f00';
    ctx.strokeRect(paddleBox.x, paddleBox.y, paddleBox.w, paddleBox.h);
  }

  if (brickBox) {
    ctx.strokeStyle = '#00f';
    ctx.strokeRect(brickBox.x, brickBox.y, brickBox.w, brickBox.h);
  }

  ctx.restore();
}

/**
 * 比较两个盒子是否碰撞
 * 有上下碰撞和左右碰撞两种情况
 * @param {Object} box1
 * @param {Object} box2
 * @return {String}
 */
function boxCompare(box1, box2) {
  var collided = false;
  var b1 = box1;
  var b2 = box2;

  if (b1.x + b1.w > b2.x && b1.x < b2.x + b2.w &&
    b1.y + b1.h > b2.y && b1.y < b2.y + b2.h) {
    collided = true;
  }

  return collided;
}

/**
 * 调整碰撞盒子
 * @param {CollisionBox} box 原来的碰撞盒子
 * @param {CollisionBox} referBox 参考的碰撞盒子
 */
function adjustCollisionBox(box, referBox) {
  return new CollisionBox(
    box.x + referBox.x,
    box.y + referBox.y,
    box.w, box.h
  );
}