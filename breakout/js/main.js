/**
 * 游戏主体控制类
 * @param {String} containerElemId 游戏的容器元素
 * @param {Object} opt_config 可选的配置参数
 * @constructor
 */
function Breakout(containerElemId, opt_config) {
  // 整个游戏的容器元素
  this.gameContinerElem = document.querySelector(containerElemId);
  // canvas 的容器元素
  this.canvasContainerElem = null;
  this.config = opt_config || Breakout.config;  // 游戏的配置参数
  this.dimensions = Breakout.dimensions;        // 游戏的默认尺寸

  this.isActivited = false;                       // 游戏是否激活
  this.isPlayingIntro = false;                    // 是否正在执行开场动画
  this.isPlaying = false;                         // 游戏是否开始
  this.isDroped = false;                          // 小球是否落到地面
  this.isPaused = false;                          // 游戏是否暂停

  this.keys = [];                                 // 存储按下的键

  this.currentLevel = 1;                          // 当前关卡
  this.playCount = 0;                             // 游戏局数

  this.paddle = null;                             // 挡板
  this.ball = null;                               // 小球
  this.brickPanel = null;                         // 绘制砖块的区域
  this.panel = null;                              // 面板

  // 加载图片资源并初始化游戏
  this.loadImage();

  // 开始监听键盘事件
  this.startListener();
};

// 挂载到 window 对象上
window['Breakout'] = Breakout;

// 游戏的帧率
var FPS = 60;

// 游戏的配置参数
Breakout.config = {
  PLAYER_LIFE: 3,            // 玩家每一关的生命值
  PADDLE_BOTTOM_MARGIN: 20,  // 挡板距底部的距离
  BRICK_GAP: 10,             // 砖块之间的间隔
  BRICK_PANEL_MARGIN: 15,    // 砖块显示面板到画布边界的距离
};

// 游戏的默认尺寸
Breakout.dimensions = {
  WIDTH: 600,
  HEIGHT: 400,
};

// 雪碧图信息
Breakout.spriteDefinition = {
  PADDLE: { x: 54, y: 47 },           // 挡板
  BALL: { x: 90, y: 15 },             // 球
  BRICK: { x: 2, y: 2 },              // 砖块
  RESTART: { x: 54, y: 15 },          // 重新开始按钮
  GAMEOVER_TEXT: { x: 54, y: 2 },     // Game Over 文字
};

// 游戏中用到的 CSS 类名
Breakout.classes = {
  CANVAS_CONTINER: 'canvas-container',  // 画布容器
  CANVAS: 'breakout-canvas',            // 游戏画布
  ARCADE_MODE: 'arcade-mode',           // 街机模式
};

// 游戏用到的键盘码
Breakout.keyCodes = {
  LEFT: { '37': 1, '65': 1 },
  RIGHT: { '39': 1, '68': 1 },
  START: { '32': 1 },
};

// 游戏用到的事件
Breakout.events = {
  LOAD: 'load',
  KEYDOWN: 'keydown',
  KEYUP: 'keyup',
  TRANSITION_END: 'webkitTransitionEnd',
  FOCUS: 'focus',
  BLUR: 'blur',
};

Breakout.prototype = {
  init: function () {
    this.canvasContainerElem = document.createElement('div');
    this.canvasContainerElem.className = Breakout.classes.CANVAS_CONTINER;

    this.canvas = createCanvas(this.canvasContainerElem, this.dimensions);

    this.canvasCtx = this.canvas.getContext('2d');
    this.canvasCtx.fillStyle = '#f7f7f7';
    this.canvasCtx.fill();

    // 初始化挡板
    this.paddle = new Paddle(this.canvas, this.spriteDef.PADDLE);

    // 初始化小球
    this.ball = new Ball(this.canvas, this.spriteDef.BALL);

    // 关卡初始化为第一关
    this.currentLevel = 1;
  
    // 初始化绘制砖块的区域
    this.brickPanel = new BrickPanel(this.canvas, this.currentLevel);

    // 初始化面板
    this.panel = new Panel(this.canvas,
      this.spriteDef.RESTART, this.spriteDef.GAMEOVER_TEXT);

    // 将游戏输出到页面中
    this.gameContinerElem.appendChild(this.canvasContainerElem);

    this.showStartButton();
    this.update();
  },
  // 加载雪碧图资源
  loadImage: function () {
    // 获取雪碧图的坐标信息
    this.spriteDef = Breakout.spriteDefinition;
    Breakout.imageSprite = document.getElementById('breakout-sprite-img');

    // 雪碧图加载完成
    if (Breakout.imageSprite.complete) {
      this.init();
    } else {
      Breakout.imageSprite.addEventListener(Breakout.events.LOAD,
        this.init.bind(this));
    }
  },
  // 显示开始按钮
  showStartButton: function () {
    // 不绘制 Game Over 文字
    this.panel.draw(false);
  },
  // 更新游戏画布
  update: function () {
    if (this.isPlaying) {
      this.clearCanvas();

      // 小球是否落到地面
      var isBallDroped = this.ball.update();

      // 游戏结束
      if (isBallDroped) {
        this.gameOver();
      }

      // 进入下一关
      if (!!this.brickPanel && !this.brickPanel.brickNum) {
        this.toNextLevel();
      }

      // 绘制砖块
      this.brickPanel.update();

      var bricks = this.brickPanel.bricks;
      var brickCollision = ''; // 小球和砖块是否碰撞

      for (var i = 0; i < bricks.length; i++) {
        // 砖块生命值不为零
        if (bricks[i].life) {
          brickCollision =
            checkBallBrickCollision(this.ball, bricks[i], this.canvas);
        }

        if (brickCollision != 'none' && bricks[i].life != 0) {
          bricks[i].life--;

          // 砖块减少一个
          if (bricks[i].life == 0) {
            this.brickPanel.brickNum--;
          }
        }

        switch(brickCollision) {
          case 'top':
            this.ball.speedY = -Math.abs(this.ball.speedY);
            break;
          case 'right':
            this.ball.speedX = Math.abs(this.ball.speedX);
            break;
          case 'bottom':
            this.ball.speedY = Math.abs(this.ball.speedY);
            break;
          case 'left':
            this.ball.speedX = -Math.abs(this.ball.speedX);
            break;
        }
      }

      // 最后一次按下的键盘码
      var currentKeyCode = this.keys[0];
      var isLeftMove = Breakout.keyCodes.LEFT[currentKeyCode];
      var isRightMove = Breakout.keyCodes.RIGHT[currentKeyCode];

      // 更新挡板
      this.paddle.update(isLeftMove, isRightMove);

      // 是否碰撞 第三个参数传入 canvas 进行 debug
      var pCollision =
        // checkBallPaddleCollision(this.ball, this.paddle);
        checkBallPaddleCollision(this.ball, this.paddle, this.canvas);

      // 小球的垂直中心
      var ballCenter = this.ball.yPos + this.ball.dimensions.HEIGHT / 2;
      // 挡板的垂直中心
      var paddleCenter = this.paddle.yPos + this.paddle.dimensions.HEIGHT / 2;

      if (pCollision == 'top') { // 小球撞到挡板顶部
        // 小球向着障碍物运动
        if ((ballCenter - paddleCenter) >
          (ballCenter - this.ball.speedY - paddleCenter)) {
          this.ball.speedY *= -1;
        } else {
          this.ball.speedY *= 1;
        }
      } else if (pCollision == 'left') { // 小球撞到挡板左侧
        this.ball.speedX = -Math.abs(this.ball.speedX);
        this.ball.speedY = -Math.abs(this.ball.speedY);
      } else if (pCollision == 'right') { // 小球撞到挡板右侧
        this.ball.speedX = Math.abs(this.ball.speedX);
        this.ball.speedY = -Math.abs(this.ball.speedY);
      } else { // 没有碰撞或碰撞部位不允许反弹
        this.ball.speedX *= 1;
        this.ball.speedY *= 1;
      }

      // 小球没有掉落到地面
      if (!this.isDroped) {
        // 进行下一次更新
        this.reqAFId = requestAnimationFrame(this.update.bind(this));
      }
    }
  },
  // 监听事件
  startListener: function () {
    document.addEventListener(Breakout.events.KEYDOWN, this);
    document.addEventListener(Breakout.events.KEYUP, this);
  },
  stopListener: function () {
    document.removeEventListener(Breakout.events.KEYDOWN, this);
    document.removeEventListener(Breakout.events.KEYUP, this);
  },
  // 处理事件
  handleEvent: function (e) {
    return (function (eType, events) {
      switch(eType) {
        case events.KEYDOWN:
          this.onKeyDown(e);
          break;
        case events.KEYUP:
          this.onKeyUp(e);
          break;
        default: break;
      }
    }.bind(this))(e.type, Breakout.events);
  },
  onKeyDown: function (e) {
    // 游戏没有暂停，并且小球没有落到地面上
    if (!this.isDroped && !this.isPaused) {
      // 按下空格，开始游戏
      if (Breakout.keyCodes.START[e.keyCode] &&
        !this.isPlaying && !this.isPlayingIntro) {
        this.playIntro(); // 执行开场动画
      }

      // 只存储新的键盘码
      if (this.isPlaying && e.keyCode != this.keys[0]) {
        this.keys.unshift(e.keyCode);
      }
    }
  },
  onKeyUp: function (e) {
    // 松开了当前挡板移动方向对应的按键
    if (e.keyCode == this.keys[0]) {
      this.keys.length = 0;
    }

    // 小球落到地面
    if (this.isDroped && Breakout.keyCodes.START[e.keyCode]) {
      // 本关游戏的次数已达上限，重置关卡
      if (this.playCount == Breakout.config.PLAYER_LIFE) {
        this.currentLevel = 1;
      }
      this.restart();
    }
  },
  // 执行开场动画
  playIntro: function () {
    if (!this.isActivited && !this.isDroped) {
      this.isActivited = true;
      this.isPlayingIntro = true;
      this.startArcadeMode();
    }
  },
  // 进入街机模式（全屏游戏）
  startArcadeMode: function () {
    var fullScale = 1; // 扩大后的尺寸占屏幕的比例
    var winHeight = window.innerHeight * fullScale;
    var winWidth = window.innerWidth * fullScale;
    var scaleHeight = winHeight / this.dimensions.HEIGHT;
    var scaleWidth = winWidth / this.dimensions.WIDTH;

    // 获取宽和高中缩放比例较小的那一个，最小为 1
    var scale = Math.max(1, Math.min(scaleWidth, scaleHeight));
    
    document.body.classList.add(Breakout.classes.ARCADE_MODE);

    // 扩大画布
    this.canvasContainerElem.style.transform = 'scale(' + scale + ')';

    // 监听 CSS transition 事件是否结束
    this.canvasContainerElem.addEventListener(Breakout.events.TRANSITION_END,
      this.startGame.bind(this));
  },
  // 开始游戏
  startGame: function () {
    this.isPlayingIntro = false; // 开场动画结束
    this.isPlaying = true;       // 游戏开始

    this.update();

    window.addEventListener(Breakout.events.FOCUS,
      this.onFocusChange.bind(this));

    window.addEventListener(Breakout.events.BLUR,
      this.onFocusChange.bind(this));
  },
  // 当窗口失去焦点，暂停游戏
  onFocusChange: function (e) {
    if (e.type == 'blur') {
      this.stop();
    } else {
      this.play();
    }
  },
  // 进行游戏
  play: function () {
    if (!this.isDroped) {
      this.isPlaying = true;
      this.isPaused = false;
      this.update();
    }
  },
  // 暂停游戏
  stop: function () {
    this.isPlaying = false;
    this.isPaused = true;
    cancelAnimationFrame(this.reqAFId);
    this.reqAFId = 0;
  },
  // 游戏结束
  gameOver: function () {
    this.stop();
    this.isDroped = true;
    this.playCount++;

    // 绘制 Game Over 面板
    if (!this.panel) {
      this.panel = new Panel(this.canvas, Breakout.spriteDef.RESTART,
        Breakout.spriteDef.GAMEOVER_TEXT);
    } else {
      this.panel.draw(true);
    }
  },
  reset: function () {
    this.isPlaying = true;
    this.isPlayingIntro = false;
    this.isDroped = false;
    this.isPaused = false;
    this.ball.reset();
    this.brickPanel.reset(this.currentLevel);
  },
  // 重新开始游戏
  restart: function () {
    this.reset();
    this.update();
  },
  // 进入下一关
  toNextLevel: function () {
    this.currentLevel++;
    this.stop();
    this.reset();
  },
  // 清空画布
  clearCanvas: function () {
    this.canvasCtx.clearRect(0, 0, this.dimensions.WIDTH,
      this.dimensions.HEIGHT);
  },
};