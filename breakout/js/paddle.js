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
  this.collisionBoxes = [];

  this.init();
}

// 配置参数
Paddle.config = {
  SPEED: 8,
};

// 尺寸设置
Paddle.dimensions = {
  WIDTH: 120,
  HEIGHT: 24,
};

Paddle.prototype = {
  init: function () {
    // this.collisionBoxes = {
    //   top: [ // 顶部
    //     new CollisionBox(5, 0, 110, 3)
    //   ],
    //   side: [ // 两侧
    //     new CollisionBox(3, 3, 114, 4),
    //     new CollisionBox(1, 5, 118, 4),
    //     new CollisionBox(0, 7, 120, 2),
    //   ],
    // }
    this.collisionBoxes = [
      new CollisionBox(3, 3, 114, 4),
      new CollisionBox(1, 5, 118, 4),
      new CollisionBox(0, 7, 120, 2),
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
   * @param {Boolean} isMove 是否移动
   * @param {Boolean} isLeftMove 是否左移
   */
  update: function (isMove, isLeftMove) {
    if (isMove) {
      var deltaXPos = (isLeftMove ? -1 : 1) * this.config.SPEED;
  
      this.xPos += deltaXPos;
    }

    // 限制移动范围
    if (this.xPos < 0) this.xPos = 0;
    if (this.xPos + this.dimensions.WIDTH > Breakout.dimensions.WIDTH)
      this.xPos = Breakout.dimensions.WIDTH - this.dimensions.WIDTH;

    // 重新绘制挡板
    this.draw();
  },
};