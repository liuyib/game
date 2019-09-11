
/**
 * 面板类
 * @param {HTMLCanvasElement} canvas 画布元素
 * @param {Object} buttonSpritePos 开始按钮在雪碧图中的坐标
 * @param {Object} gameOverSpritePos Game Over 文字在雪碧图中的坐标
 */
function Scene(canvas, buttonSpritePos, gameOverSpritePos) {
  this.canvas = canvas;
  this.canvasCtx = canvas.getContext('2d');
  this.dimensions = Scene.dimensions;
  this.config = Scene.config;

  this.buttonSpritePos = buttonSpritePos;
  this.gameOverSpritePos = gameOverSpritePos;

  this.score = 0;      // 得分
  this.life = 0;       // 生命值
  this.level = 0;      // 关卡
  this.gameOver = {};  // Game Over 文字
  this.button = {};    // 开始按钮

  this.init();
}

Scene.config = {
  TEXT_FONT_SIZE: 20,  // 字体大小
  SCORE_X: 10,         // 分数文字的 x 坐标
  SCORE_Y: 25,
  LEVEL_X: 510,        // 关卡文字的 x 坐标
  LEVEL_Y: 25,
  LIFE_X: 260,         // 生命值的 x 坐标
  LIFE_Y: 25,
};

Scene.dimensions = {
  BUTTON_WIDTH: 34,
  BUTTON_HEIGHT: 30,
  GAMEOVER_WIDTH: 191,
  GAMEOVER_HEIGHT: 11,
};

Scene.prototype = {
  init: function () {
    this.gameOver.x = this.gameOverSpritePos.x;
    this.gameOver.y = this.gameOverSpritePos.y;
    this.gameOver.w = this.dimensions.GAMEOVER_WIDTH;
    this.gameOver.h = this.dimensions.GAMEOVER_HEIGHT;

    this.button.x = this.buttonSpritePos.x;
    this.button.y = this.buttonSpritePos.y;
    this.button.w = this.dimensions.BUTTON_WIDTH;
    this.button.h = this.dimensions.BUTTON_HEIGHT;

    // 初始绘制分数和关卡
    this.draw();
    // 绘制开始按钮
    this.drawButton();
  },
  // 绘制分数和关卡
  draw: function () {
    this.canvasCtx.save();
    this.canvasCtx.font = this.config.TEXT_FONT_SIZE + 'px 微软雅黑';

    // 绘制分数
    var showScoreText = '分数：' + this.score;
    this.canvasCtx.fillStyle = '#000';
    this.canvasCtx.fillText(showScoreText,
      this.config.SCORE_X, this.config.SCORE_Y);

    // 绘制生命值
    var showLifeText = '生命：' + this.life;
    this.canvasCtx.fillStyle = '#000';
    this.canvasCtx.fillText(showLifeText,
      this.config.LIFE_X, this.config.LIFE_Y);

    // 绘制关卡
    var showLevelText = '关卡：' + this.level;
    this.canvasCtx.fillStyle = '#000';
    this.canvasCtx.fillText(showLevelText,
      this.config.LEVEL_X, this.config.LEVEL_Y);
    
    this.canvasCtx.restore();
  },
  // 更新分数和关卡
  update: function (score, life, level) {
    this.score = score;
    this.life = life;
    this.level = level;

    this.draw();
  },
  // 绘制重新开始按钮
  drawButton: function () {
    var targetX = (Breakout.dimensions.WIDTH - this.button.w) / 2;
    var targetY = Breakout.dimensions.HEIGHT / 2 + this.button.h;

    this.canvasCtx.drawImage(
      Breakout.imageSprite,
      this.button.x, this.button.y,
      this.button.w, this.button.h,
      targetX, targetY,
      this.button.w, this.button.h
    );
  },
  // 绘制 Game Over 文字
  drawGameOver: function () {
    var targetX = (Breakout.dimensions.WIDTH - this.gameOver.w) / 2;
    var targetY = Breakout.dimensions.HEIGHT / 2 - this.gameOver.h * 2;

    this.canvasCtx.drawImage(
      Breakout.imageSprite,
      this.gameOver.x, this.gameOver.y,
      this.gameOver.w, this.gameOver.h,
      targetX, targetY,
      this.gameOver.w, this.gameOver.h
    );
  },
  reset: function () {
    this.update(0, 0, 0);
  },
};
