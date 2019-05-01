/**
 * 砖块显示面板类
 * @param {HTMLCanvasElement} canvas 画布元素
 * @param {Number} currentLevel 当前关卡
 */
function BrickPanel(canvas, currentLevel) {
  this.canvas = canvas;
  this.canvasCtx = canvas.getContext('2d');

  this.bricks = [];  // 存储砖块

  this.xPos = 0;
  this.yPos = 0;

  this.brickNum = 0; // 砖块的数目

  this.init(currentLevel);
}

BrickPanel.prototype = {
  init: function (currentLevel) {
    var level = levels[currentLevel - 1];
    var row = level.length;    // 砖块的行数
    var col = level[0].length; // 砖块的列数

    // 砖块显示面板水平居中
    this.xPos = (Breakout.dimensions.WIDTH -
      (Breakout.config.BRICK_GAP * (col - 1)) -
      (Brick.dimensions.WIDTH * col)) / 2;
    this.yPos = Breakout.config.BRICK_PANEL_MARGIN;

    for (var i = 0; i < level.length; i++) {
      for (var j = 0; j < level[i].length; j++) {
        // 关卡数组中存储的元素就是砖块的生命值
        var brickLife = level[i][j];
        var brick = new Brick(this.canvas,
          Breakout.spriteDefinition.BRICK);
        
        // 统计本关卡砖块数目
        if (brickLife) {
          this.brickNum++;
        }
        brick.life = brickLife;
        brick.xPos = this.xPos +
          (brick.dimensions.WIDTH + brick.gap) * j;
        brick.yPos = this.yPos +
          (brick.dimensions.HEIGHT + brick.gap) * i;

        this.bricks.push(brick);
      }
    }
  },
  update: function () {
    this.draw();
  },
  draw: function () {
    for (var i = 0; i < this.bricks.length; i++) {
      this.bricks[i].draw();
    }
  },
  // 重置关卡
  reset: function (currentLevel) {
    this.init(currentLevel);
  },
};