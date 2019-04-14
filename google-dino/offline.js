(function () {
  'use strict';

  var log = console.log.bind(console);

  // =====================================

  /**
   * 生成 canvas 元素
   * @param {HTMLElement} container canva 的容器
   * @param {Number} width canvas 的宽度
   * @param {Number} height canvas 的高度
   * @param {String} optClassName 给 canvas 添加的类名（可选）
   * @return {HTMLCanvasElement}
   */
  function createCanvas(container, width, height, optClassName) {
    var canvas = document.createElement('canvas');
    canvas.className = optClassName
      ? optClassName + ' ' + Runner.classes.CANVAS
      : Runner.classes.CANVAS;
    canvas.width = width;
    canvas.height = height;
    container.appendChild(canvas);

    return canvas;
  }

  // ====================================
  var DEFAULT_WIDTH = 600;
  var FPS = 60;

  function Runner(containerSelector, optConfig) {
    this.outerContainerEl = document.querySelector(containerSelector);
    this.containerEl = null;

    this.config = optConfig || Runner.config;
    this.dimensions = Runner.defaultDimensions;

    this.time = 0;
    this.currentSpeed = this.config.SPEED;

    this.activated  = false; // 游戏是否被激活
    this.playing = false;    // 游戏是否进行中
    this.crashed = false;    // 小恐龙是否碰到了障碍物
    this.paused = false      // 游戏是否暂停

    // 加载雪碧图，并初始化游戏
    // Runner 中 loadImages -> init -> new Horizon（箭头指代调用）
    this.loadImages();
  }
  window['Runner'] = Runner;
  
  Runner.config = {
    GAP_COEFFICIENT: 0.6, // TODO
    SPEED: 6,             // 移动速度
  };

  Runner.defaultDimensions = {
    WIDTH: DEFAULT_WIDTH,
    HEIGHT: 150
  };
  
  Runner.classes = {
    CONTAINER: 'runner-container',
    CANVAS: 'runner-canvas',
    PLAYER: '', // 用户可以自定义添加的修饰 canvas 的 className
  };

  Runner.spriteDefinition = {
    LDPI: {
      HORIZON: {x: 2, y: 54},
    },
  };

  Runner.keyCodes = {
    JUMP: {'38': 1, '32': 1}, // Up, spacebar
    DUCK: {'40': 1},          // Down
    RESTART: {'13': 1}        // Enter
  };

  Runner.events = {
    KEYDOWN: 'keydown',
    KEYUP: 'keyup',
    LOAD: 'load',
  };

  Runner.prototype = {
    init: function () {
      this.containerEl = document.createElement('div');
      this.containerEl.className = Runner.classes.CONTAINER;

      this.canvas = createCanvas(this.containerEl, this.dimensions.WIDTH,
        this.dimensions.HEIGHT, Runner.classes.PLAYER);

      this.ctx = this.canvas.getContext('2d');
      this.ctx.fillStyle = '#f7f7f7';
      this.ctx.fill();

      // 加载 Horizon
      this.horizon = new Horizon(this.canvas, this.spritePos,
        this.dimensions, this.config.GAP_COEFFICIENT);

      // 将游戏添加到页面中
      this.outerContainerEl.appendChild(this.containerEl);
      // 开始监听用户动作
      this.startListening();
      // 更新画布
      this.update();         
    },
    loadImages() {
      this.spritePos = Runner.spriteDefinition.LDPI; // 获取雪碧图中图片的坐标信息
      Runner.imageSprite = document.getElementById('offline-resources-1x');

      // 当图片加载完成（complete 是 DOM 中 Image 对象自带的一个属性）
      if (Runner.imageSprite.complete) {
        this.init();
      } else {
        // 图片没有加载完成，监听其 load 事件
        Runner.imageSprite.addEventListener(Runner.events.LOAD,
          this.init.bind(this));
      }
    },
    // 监听按键事件
    startListening: function () {
      document.addEventListener(Runner.events.KEYDOWN, this);
      document.addEventListener(Runner.events.KEYUP, this);
    },
    // 移除事件监听器
    stopListening: function () {
      document.removeEventListener(Runner.events.KEYDOWN, this);
      document.removeEventListener(Runner.events.KEYUP, this);
    },
    /**
     * 游戏被激活时的开场过渡动画
     * 用于将 canvas 的宽度调整到最大
     */
    playIntro: function () {
      if (!this.activated && !this.crashed) {
        this.playingIntro = true; // 正在执行过渡动画

        // 定义 CSS 动画关键帧
        var keyframes = '@-webkit-keyframes intro { ' +
            'from { width:' + Trex.config.WIDTH + 'px }' +
            'to { width: ' + this.dimensions.WIDTH + 'px }' +
          '}';
        // 将动画关键帧插入页面中的第一个样式表
        document.styleSheets[0].insertRule(keyframes, 0);


      }
    },
    setPlayStatus: function (isPlaying) {
      this.playing = isPlaying;
    },
    getTimeStamp: function () {
      return performance.now();
    },
    // play: function () {
    //   if (!this.crashed) {
    //     this.setPlayStatus(true);
    //     this.paused = false;
    //     this.time = this.getTimeStamp();
    //     this.update();
    //   }
    // },
    // stop: function () {
    //   this.setPlayStatus(false);
    //   this.paused = true;
    //   cancelAnimationFrame(this.raqId);
    //   this.raqId = 0;
    // },
    clearCanvas: function () {
      this.ctx.clearRect(0, 0, this.dimensions.WIDTH, this.dimensions.HEIGHT);
    },
    scheduleNextUpdate: function () {
      if (!this.updatePending) {
        this.updatePending = true;
        this.raqId = requestAnimationFrame(this.update.bind(this));
      }
    },
    /**
     * 更新游戏帧并准备下一次更新
     */
    update: function () {
      this.updatePending = false; // 等待更新
      
      var now = this.getTimeStamp();
      var deltaTime = now - (this.time || now);
      
      this.time = now;

      if (this.playing) {
        this.clearCanvas();
        
        // 更新 Horizon
        // deltaTime = !this.activated ? 0 : deltaTime;
        this.horizon.update(deltaTime, this.currentSpeed);
      }

      if (this.playing) {
        this.scheduleNextUpdate();
      }
    },
    onKeyDown: function (e) {
      if (!this.crashed && !this.paused) {
        if (Runner.keyCodes.JUMP[e.keyCode]) {
          e.preventDefault();

          if (!this.playing) {
            this.setPlayStatus(true);
            this.update();
          }
          
          // this.activated = true;
        }
      }      
    },
    // 用来处理 EventTarget（这里就是 Runner 类） 上发生的事件
    // 当事件被发送到 EventListener 时，浏览器就会自动调用这个方法
    // 然后就可以进行一些事件响应操作
    handleEvent: function (e) {
      return (function (eType, events) {
        switch (eType) {
          case events.KEYDOWN:
            this.onKeyDown(e);
            break;
          default:
            break;
        }
      }.bind(this))(e.type, Runner.events);
    },
  };



  // ====================================
  function HorizonLine(canvas, spritePos) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.spritePos = spritePos; // 雪碧图中地面的位置
    this.dimensions = {};       // 地面的尺寸

    this.spritePosX = [];       // 雪碧图中地面的两种地形的 x 坐标

    this.posX = [];             // 画布中地面的 x 坐标
    this.posY = 0;              // 画布中地面的 y 坐标

    this.bumpThreshold = 0.5;   // 随机地形系数，控制两种地形的出现频率

    // 初始化
    this.init();

    // 绘制地面
    this.draw();
  }

  HorizonLine.dimensions = {
    WIDTH: 600,
    HEIGHT: 12,
    POSY: 127,  // 在 canvas 中的位置
  };

  HorizonLine.prototype = {
    init: function () {
      for (const d in HorizonLine.dimensions) {
        if (HorizonLine.dimensions.hasOwnProperty(d)) {
          const elem = HorizonLine.dimensions[d];
          this.dimensions[d] = elem;
        }
      }
      this.spritePosX = [
        this.spritePos.x,
        this.spritePos.x + this.dimensions.WIDTH
      ];
      this.posX = [0, HorizonLine.dimensions.WIDTH];
      this.posY = HorizonLine.dimensions.POSY;
    },
    draw: function () {
      this.ctx.drawImage(
        Runner.imageSprite,                   // 原图片
        this.spritePosX[0], this.spritePos.y, // 原图中裁剪区域的起点坐标
        this.dimensions.WIDTH, this.dimensions.HEIGHT,
        this.posX[0], this.posY,              // 画布中绘制区域的起点坐标
        this.dimensions.WIDTH, this.dimensions.HEIGHT,
      );
      this.ctx.drawImage(
        Runner.imageSprite,
        this.spritePosX[1], this.spritePos.y,
        this.dimensions.WIDTH, this.dimensions.HEIGHT,
        this.posX[1], this.posY,
        this.dimensions.WIDTH, this.dimensions.HEIGHT,
      );
    },
    /**
     * 获取随机的地形
     */
    getRandomType: function () {
      return Math.random() > this.bumpThreshold ? this.dimensions.WIDTH : 0;
    },
    /**
     * 更新地面的 x 坐标，并
     * @param {Number} pos 地面的位置
     * @param {Number} incre 移动距离
     */
    updatePosX: function (pos, incre) {
      var line1 = pos;
      var line2 = pos === 0 ? 1 : 0;

      // 第一段地面向左移动，第二段地面随之
      this.posX[line1] -= incre;
      this.posX[line2] = this.posX[line1] + this.dimensions.WIDTH;

      // 第一段地面移出了 canvas
      if (this.posX[line1] <= -this.dimensions.WIDTH) {
        // 将第一段地面放到 canvas 右侧
        this.posX[line1] += this.dimensions.WIDTH * 2;
        // 此时第二段地面的 x 坐标刚好和 canvas 的 x 坐标对齐
        this.posX[line2] = this.posX[line1] - this.dimensions.WIDTH;
        // 给放到 canvas 后面的地面随机地形
        this.spritePosX[line1] = this.getRandomType() + this.spritePos.x;
      }
    },
    /**
     * 更新地面
     * @param {Number} deltaTime 间隔时间
     * @param {Number} speed 速度
     */
    update: function (deltaTime, speed) {
      // 计算地面每次移动的距离（距离 = 速度 x 时间）时间由帧率和间隔时间共同决定
      var incre = Math.floor(speed * (FPS / 1000) * deltaTime);

      if (this.posX[0] <= 0) {
        this.updatePosX(0, incre);
      } else {
        this.updatePosX(1, incre);
      }
      this.draw();
    },
  };

  /**
   * Horizon 背景类
   * @param {HTMLCanvasElement} canvas 画布
   * @param {Object} spritePos 雪碧图中的位置
   * @param {Object} dimensions 画布的尺寸
   * @param {Number} gapCoefficient 间隙系数
   */
  function Horizon(canvas, spritePos, dimensions, gapCoefficient) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.spritePos = spritePos;
    // this.dimensions = dimensions;
    // this.gapCoefficient = gapCoefficient;
    // this.config = Horizon.config;

    // this.obstacles = [];
    // this.obstacleHistory = [];

    // // 云的频率
    // this.cloudFrequency = this.config.CLOUD_FREQUENCY;
    // // 夜晚模式
    // this.nightMode = null;

    // // 云
    // this.clouds = [];
    // this.cloudSpeed = this.config.BG_CLOUD_SPEED;
    
    // 地面
    this.horizonLine = null;

    // 初始化
    this.init();
  }

  // Horizon.config = {
  //   BG_CLOUD_SPEED: 0.2, // 云的速度
  //   CLOUD_FREQUENCY: .5, // 云的频率
  //   MAX_CLOUDS: 6        // 云的最大数量
  // };

  Horizon.prototype = {
    init: function () {
      this.horizonLine = new HorizonLine(this.canvas, this.spritePos.HORIZON);
    },
    update: function (deltaTime, currentSpeed) {
      this.horizonLine.update(deltaTime, currentSpeed);
    },
  };
})();