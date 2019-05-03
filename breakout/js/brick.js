/**
 * 砖块类
 * @param {HTMLCanvasElement} canvas 画布元素
 * @param {Object} spritePos 在雪碧图中的坐标
 */
function Brick(canvas, spritePos) {
  this.canvas = canvas;
  this.canvasCtx = canvas.getContext('2d');
  this.spritePos = spritePos;
  this.dimensions = Brick.dimensions;
  this.config = Brick.config;

  // 坐标
  this.xPos = 0;
  this.yPos = 0;

  // 碰撞盒子
  this.collisionBoxes = [];

  this.life = 0;         // 砖块的生命值
  this.value = 0;        // 砖块的分值
  this.isRemove = false; // 是否被移除
  this.gap = 0;          // 砖块之间的间隙

  this.init();
}

Brick.config = {
  BASIC_VALUE: 10,           // 砖块的基础分值
  VALUE_INCRE_COEFFICIENT: 2, // 砖块分值的增长系数
};

// 尺寸设置
Brick.dimensions = {
  WIDTH: 50,
  HEIGHT: 20,
};

// 砖块在雪碧图中的位置（相对于第一个砖块）
Brick.spriteYPos = [0, 22, 44, 66, 88, 110];

Brick.prototype = {
  init: function () {
    this.gap = Breakout.config.BRICK_GAP;
 
    var d = this.dimensions;
    this.collisionBoxes = [
      new CollisionBox(2, 0, d.WIDTH - 4, 1),            // 上
      new CollisionBox(d.WIDTH - 1, 2, 1, d.HEIGHT - 4), // 右
      new CollisionBox(2, d.HEIGHT - 1, d.WIDTH - 4, 1), // 下
      new CollisionBox(0, 2, 1, d.HEIGHT - 4),           // 左
    ];
  },
  // 绘制砖块
  draw: function () {
    var sourceWidth = this.dimensions.WIDTH;
    var sourceHeight = this.dimensions.HEIGHT;

    var targetWidth = sourceWidth;
    var targetHeight = sourceHeight;
    
    // 砖块的生命值不为零
    if (this.life) {
      this.canvasCtx.drawImage(
        Breakout.imageSprite,
        this.spritePos.x,
        this.spritePos.y + Brick.spriteYPos[this.life - 1],
        sourceWidth, sourceHeight,
        this.xPos, this.yPos,
        targetWidth, targetHeight
      );
    }
  },
  // 更新砖块的绘制和分值
  update: function () {
    this.updateValue();
    this.draw();
  },
  // 更新砖块的分值
  updateValue: function () {
    this.value = this.life * Brick.config.BASIC_VALUE *
      Brick.config.VALUE_INCRE_COEFFICIENT;
  },
};