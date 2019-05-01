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

  // 左上角的坐标
  this.xPos = 0;
  this.yPos = 0;

  // X、Y 方向上的速度
  this.speedX = 0;
  this.speedY = 0;

  this.init();
}

// 配置参数
Ball.config = {
  SPEED: 2,      // 当前速度
};

// 尺寸设置
Ball.dimensions = {
  WIDTH: 20,
  HEIGHT: 20,
};

Ball.prototype = {
  init: function () {
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
    var isDroped = false; // 小球是否落到地面

    this.xPos += this.speedX;
    this.yPos += this.speedY;

    // 当小球运动到边界时，不要直接对其速度进行取反
    // 否则，当“像素穿透”时，小球会卡在边界
    if (this.xPos < 0) {
      this.speedX = Math.abs(this.speedX);
    }
    if (this.xPos >
      Breakout.dimensions.WIDTH - this.dimensions.WIDTH) {
      this.speedX = -Math.abs(this.speedX);
    }
    if (this.yPos < 0) {
      this.speedY = Math.abs(this.speedY);
    }
    // 小球落到地面
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