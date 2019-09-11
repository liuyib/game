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

// 检测小球和挡板是否碰撞
function checkBallPaddleCollision(ball, paddle, opt_canvas) {
  var b = ball;
  var p = paddle;

  // 生成最外层的碰撞盒子
  var ballBox = createCollisionBox(b);
  var paddleBox = createCollisionBox(p);

  // 先检测外层盒子，当外层盒子碰撞后，再检测内层，以此来优化性能
  if (detectCollision(ballBox, paddleBox, opt_canvas)) {
    // 根据挡板外层的碰撞盒子，调整内层盒子的位置
    var pTopBox =
      adjustCollisionBox(p.topCollisionBoxes[0], paddleBox);

    for (var i = 0; i < p.leftCollisionBoxes.length; i++) {
      // 挡板左边的碰撞盒子
      var pLeftBox =
        adjustCollisionBox(p.leftCollisionBoxes[i], paddleBox);
      // 挡板右边的碰撞盒子
      var pRightBox =
        adjustCollisionBox(p.rightCollisionBoxes[i], paddleBox);

      if (detectCollision(ballBox, pLeftBox, opt_canvas)) {
        return 'left';
      } else if (detectCollision(ballBox, pRightBox, opt_canvas)) {
        return 'right';
      }
    }

    // 撞到挡板顶部
    if (detectCollision(ballBox, pTopBox, opt_canvas)) {
      return 'top';
    }
  }

  return 'none';
}

// 检测小球和砖块是否碰撞
function checkBallBrickCollision(ball, brick, opt_canvas) {
  // 生成最外层的碰撞盒子
  var ballBox = createCollisionBox(ball);
  var brickBox = createCollisionBox(brick);

  // 外层碰撞
  if (detectCollision(ballBox, brickBox, opt_canvas)) {
    for (var i = 0; i < brick.collisionBoxes.length; i++) {
      var brInnerBox = brick.collisionBoxes[i];
      var adjustBox = adjustCollisionBox(brInnerBox, brickBox);

      if (detectCollision(ballBox, adjustBox, opt_canvas)) {
        switch(i) {
          case 0: return 'top'; break;
          case 1: return 'right'; break;
          case 2: return 'bottom'; break;
          case 3: return 'left'; break;
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

function randomNum(min, max) {
  return Math.random() * (max - min) + min;
}
