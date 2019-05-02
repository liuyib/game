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

  // 坐标
  this.xPos = 0;
  this.yPos = 0;

  // 碰撞盒子
  this.collisionBoxes = [];

  this.life = 0;           // 砖块的生命值
  this.isRemove = false;   // 是否被移除
  this.gap = 0;            // 砖块之间的间隙

  this.init();
}

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
};