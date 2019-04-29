
/**
 * 面板类
 * @param {HTMLCanvasElement} canvas 画布元素
 * @param {Object} restartSpritePos 重新开始按钮在雪碧图中的坐标
 * @param {Object} textSpritePos Game Over 文字在雪碧图中的坐标
 */
function Panel(canvas, restartSpritePos, textSpritePos) {
  this.canvas = canvas;
  this.canvasCtx = canvas.getContext('2d');
  this.dimensions = Panel.dimensions;
  
  this.restartSpritePos = restartSpritePos;
  this.textSpritePos = textSpritePos;
  
  this.text = {};     // Game Over 文字
  this.restart = {};  // 重新开始按钮

  this.init();
}

// 尺寸设置
Panel.dimensions = {
  RESTART_WIDTH: 34,
  RESTART_HEIGHT: 30,
  TEXT_WIDTH: 191,
  TEXT_HEIGHT: 11,
};

Panel.prototype = {
  init: function () {
    this.text.spritePos = this.textSpritePos;
    this.text.width = this.dimensions.TEXT_WIDTH;
    this.text.height = this.dimensions.TEXT_HEIGHT;

    this.restart.spritePos = this.restartSpritePos;
    this.restart.width = this.dimensions.RESTART_WIDTH;
    this.restart.height = this.dimensions.RESTART_HEIGHT;
  },
  draw: function (isDrawText) {
    var centerX = Breakout.dimensions.WIDTH / 2;
    var centerY = Breakout.dimensions.HEIGHT / 2;

    // 重新开始按钮
    var restartSourceWidth = this.dimensions.RESTART_WIDTH;
    var restartSourceHeight = this.dimensions.RESTART_HEIGHT;
    var restartSourceX = this.restart.spritePos.x;
    var restartSourceY = this.restart.spritePos.y;

    var restartTargetWidth = restartSourceWidth;
    var restartTargetHeight = restartSourceHeight;
    var restartTargetX = centerX - (restartTargetWidth / 2);
    var restartTargetY = 0;

    // 文字
    var textSourceWidth = this.dimensions.TEXT_WIDTH;
    var textSourceHeight = this.dimensions.TEXT_HEIGHT;
    var textSourceX = this.text.spritePos.x;
    var textSourceY = this.text.spritePos.y;

    var textTargetWidth = textSourceWidth;
    var textTargetHeight = textSourceHeight;
    var textTargetX = centerX - (textTargetWidth / 2);
    var textTargetY = 0;

    // 如果需要绘制文字
    if (isDrawText) {
      restartTargetY = centerY + (restartTargetHeight / 2);
      textTargetY = centerY - (textTargetHeight * 1.5);
    } else {
      restartTargetY = centerY - (restartTargetHeight / 2);
    }

    // 重新开始按钮
    this.canvasCtx.drawImage(
      Breakout.imageSprite,
      restartSourceX, restartSourceY,
      restartSourceWidth, restartSourceHeight,
      restartTargetX, restartTargetY,
      restartTargetWidth, restartTargetHeight
    );

    // 文字
    if (isDrawText) {
      this.canvasCtx.drawImage(
        Breakout.imageSprite,
        textSourceX, textSourceY,
        textSourceWidth, textSourceHeight,
        textTargetX, textTargetY,
        textTargetWidth, textTargetHeight
      );
    }
  },
};