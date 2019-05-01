/**
 * 挡板类
 * @param {HTMLCanvasElement} canvas 画布元素
 * @param {Object} spritePos 雪碧图中的坐标
 * @constructor
 */
function Paddle(canvas, spritePos) {
  this.canvas = canvas;
  this.canvasCtx = canvas.getContext('2d');
  this.spritePos = spritePos;
  this.dimensions = Paddle.dimensions;
  this.config = Paddle.config;
  
  // 坐标
  this.xPos = 0;
  this.yPos = 0;
  
  // 碰撞盒子
  this.topCollisionBoxes = [];   // 挡板顶部的碰撞盒子
  this.leftCollisionBoxes = [];  // 挡板左边的碰撞盒子
  this.rightCollisionBoxes = []; // 挡板右边的碰撞盒子
  
  this.init();
}

// 配置参数
Paddle.config = {
  SPEED: 6,
};

// 尺寸设置
Paddle.dimensions = {
  WIDTH: 120,
  HEIGHT: 24,
};

Paddle.prototype = {
  init: function () {
    this.topCollisionBoxes = [
      new CollisionBox(5, 0, 110, 3),
    ];
    this.leftCollisionBoxes = [
      new CollisionBox(3, 3, 57, 4),
      new CollisionBox(1, 5, 59, 4),
      new CollisionBox(0, 7, 60, 2),
    ];
    this.rightCollisionBoxes = [
      new CollisionBox(60, 3, 57, 4),
      new CollisionBox(60, 5, 59, 4),
      new CollisionBox(60, 7, 60, 2),
    ];
    this.xPos = (Breakout.dimensions.WIDTH - this.dimensions.WIDTH) / 2;
    this.yPos = Breakout.dimensions.HEIGHT -
      Breakout.config.PADDLE_BOTTOM_MARGIN - this.dimensions.HEIGHT;

    this.draw();
  },
  // 绘制挡板
  draw: function () {
    // 原始尺寸
    var sourceWidth = this.dimensions.WIDTH;
    var sourceHeight = this.dimensions.HEIGHT;

    // 绘制到画布上的尺寸
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
   * 更新挡板
   * @param {Boolean} isLeftMove 是否左移
   * @param {Boolean} isRightMove 是否右移
   */
  update: function (isLeftMove, isRightMove) {
    if (isLeftMove || isRightMove) {
      var deltaXPos = 0;

      if (isLeftMove) {
        deltaXPos = -this.config.SPEED;
      } else if (isRightMove) {
        deltaXPos = this.config.SPEED;
      }
  
      this.xPos += deltaXPos;

      // 限制移动范围
      if (this.xPos < 0) this.xPos = 0;
      if (this.xPos + this.dimensions.WIDTH > Breakout.dimensions.WIDTH)
        this.xPos = Breakout.dimensions.WIDTH - this.dimensions.WIDTH;
    }

    // 重新绘制挡板
    this.draw();
  },
};