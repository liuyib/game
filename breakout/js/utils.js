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

// 检测小球和其他矩形障碍物是否碰撞
function checkPaddleCollision(ball, obstacle, opt_canvas) {
  var b = ball;
  var o = obstacle;

  // 小球和挡板碰撞
  if (o.type == 'paddle') {
    // 生成最外层的碰撞盒子
    var ballBox = createCollisionBox(b);
    var obstacleBox = createCollisionBox(o);

    // 小球中心的位置高于挡板中心的位置时，小球会反弹
    // 否则，小球不可能再反弹上去
    if (ballBox.y + ballBox.h / 2 <
      obstacleBox.y + obstacleBox.h / 2) {
      // 先检测外层盒子，当外层盒子碰撞后，再检测内层，以此来优化性能
      if (detectCollision(ballBox, obstacleBox, opt_canvas)) {
        // 根据挡板外层的碰撞盒子，调整内层盒子的位置
        var paddleTopBox =
          adjustCollisionBox(o.topCollisionBoxes[0], obstacleBox);
  
        for (var i = 0; i < o.leftCollisionBoxes.length; i++) {
          // 挡板左边的碰撞盒子
          var paddleLeftBox =
            adjustCollisionBox(o.leftCollisionBoxes[i], obstacleBox);
          // 挡板右边的碰撞盒子
          var paddleRightBox =
            adjustCollisionBox(o.rightCollisionBoxes[i], obstacleBox);
  
          if (detectCollision(ballBox, paddleLeftBox, opt_canvas)) {
            return 'left';
          } else if (detectCollision(ballBox, paddleRightBox, opt_canvas)) {
            return 'right';
          }
        }
  
        // 撞到挡板顶部
        if (detectCollision(ballBox, paddleTopBox, opt_canvas)) {
          return 'top';
        }
      }
    }
  }

  return 'none';
}

// 通过对象的坐标信息和尺寸生成碰撞盒子
function createCollisionBox(obj) {
  return {
    x: obj.xPos,
    y: obj.yPos,
    w: obj.dimensions.WIDTH,
    h: obj.dimensions.HEIGHT,
  };
}

/**
 * 根据外层碰撞盒子计算出内层碰撞盒子的信息
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

// 绘制矩形碰撞盒子
function drawRectCollisionBoxes(canvas, paddleBox, brickBox) {
  var ctx = canvas.getContext('2d');
  ctx.save();

  if (paddleBox) {
    ctx.strokeStyle = '#0f0';
    ctx.strokeRect(paddleBox.x, paddleBox.y, paddleBox.w, paddleBox.h);
  }

  if (brickBox) {
    ctx.strokeStyle = '#00f';
    ctx.strokeRect(brickBox.x, brickBox.y, brickBox.w, brickBox.h);
  }

  ctx.restore();
}

// 绘制圆形碰撞盒子
function drawBallCollisionBoxes(canvas, ball) {
  var ctx = canvas.getContext('2d');
  ctx.save();

  ctx.beginPath();
  ctx.strokeStyle = '#f00';
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

/**
 * 检测圆和矩形（非旋转）是否相撞
 * @param {Object} circleBox 圆形的碰撞盒子
 * @param {Object} rectBox 矩形的碰撞盒子
 * @param {HTMLCanvasElement} opt_canvas 画布元素
 */
function detectCollision(circleBox, rectBox, opt_canvas) {
  var tx, ty; // 矩形上距离圆最近的点
  var r = rectBox;
  var c = {
    // 圆心坐标
    x: circleBox.x + circleBox.w / 2,
    y: circleBox.y + circleBox.h / 2,
    // 半径
    r: circleBox.w / 2,
  };

  if (opt_canvas) {
    // debug - 绘制圆形的碰撞范围
    drawBallCollisionBoxes(opt_canvas, c);
    // debug - 绘制矩形的碰撞范围
    drawRectCollisionBoxes(opt_canvas, r);
  }

  if (c.x < r.x) {
    tx = r.x;
  } else if (c.x > r.x + r.w) {
    tx = r.x + r.w;
  } else {
    tx = c.x;
  }

  if (c.y < r.y) {
    ty = r.y;
  } else if (c.y > r.y + r.h) {
    ty = r.y + r.h;
  } else {
    ty = c.y;
  }

  if (distance(c.x, c.y, tx, ty) < c.r) {
    return true;
  }

  return false;
}

// 计算两点间的距离
function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}