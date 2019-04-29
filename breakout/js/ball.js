/**
 * 小球类
 * @param {HTMLCanvasElement} canvas 画布元素
 * @param {Object} spritePos 雪碧图中的坐标
 */
function Ball(canvas, spritePos) {
  this.canvas = canvas;
  this.canvasCtx = canvas.getContext('2d');
  this.spritePos = spritePos;
  this.dimensions = Ball.dimensions;
  this.config = Ball.config;

  this.xPos = 0;
  this.yPos = 0;

  this.speedX = 0;
  this.speedY = 0;

  // 碰撞盒子
  this.collisionBoxes = [];

  this.init();
}

// 配置参数
Ball.config = {
  SPEED: 2,      // 当前速度
};

// 尺寸设置
Ball.dimensions = {
  WIDTH: 30,
  HEIGHT: 30,
};

Ball.prototype = {
  init: function () {
    this.collisionBoxes = [
      new CollisionBox(6, 2, 18, 26),
      new CollisionBox(4, 4, 22, 22),
      new CollisionBox(2, 6, 26, 18),
    ];
    
    this.reset();
    this.draw();
  },
  // 绘制小球
  draw: function () {
    var sourceWidth = this.dimensions.WIDTH;
    var sourceHeight = this.dimensions.HEIGHT;

    var targetWidth = sourceWidth;
    var targetHeight = sourceHeight;
    
    this.canvasCtx.drawImage(
      Breakout.imageSprite,
      this.spritePos.x, this.spritePos.y,
      sourceWidth, sourceHeight,
      this.xPos, this.yPos,
      targetWidth, targetHeight
    );
  },
  /**
   * 更新小球
   * @return {Boolean}
   */
  update: function () {
    var isDroped = false;

    this.xPos += this.speedX;
    this.yPos += this.speedY;

    if (this.xPos < 0 || this.xPos >
      Breakout.dimensions.WIDTH - this.dimensions.WIDTH) {
      this.speedX *= -1;
    }
    if (this.yPos < 0) {
      this.speedY *= -1;
    }
    if (this.yPos > 
      Breakout.dimensions.HEIGHT - this.dimensions.HEIGHT) {
        isDroped = true;
    }

    this.draw();

    return isDroped;
  },
  // 重置小球
  reset: function () {
    this.speedX = this.config.SPEED;
    this.speedY = -this.config.SPEED;

    this.xPos = (Breakout.dimensions.WIDTH - this.dimensions.WIDTH) / 2;
    this.yPos = Breakout.dimensions.HEIGHT - this.dimensions.HEIGHT -
      Breakout.config.PADDLE_BOTTOM_MARGIN - Paddle.dimensions.HEIGHT;
  },
};