(function () {
  'use strict';

  var log = console.log.bind(console);

  // =====================================

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
  // var FPS = 60;

  function Runner(containerSelector, optConfig) {
    this.outerContainerEl = document.querySelector(containerSelector);
    this.containerEl = null;

    this.config = optConfig || Runner.config;
    this.dimensions = Runner.defaultDimensions;

    // 加载雪碧图，并初始化游戏
    // Runner 中 loadImages -> init -> new Horizon（箭头指代调用）
    this.loadImages();
  }
  window['Runner'] = Runner;
  
  Runner.config = {
    GAP_COEFFICIENT: 0.6, // TODO ???
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

      // 加载地平线
      this.horizon = new Horizon(this.canvas, this.spritePos,
        this.dimensions, this.config.GAP_COEFFICIENT);

      // 将游戏添加到页面中
      this.outerContainerEl.appendChild(this.containerEl);
      
      this.startListening(); // 开始监听用户动作
      this.update();         // 更新画布
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
    startListening: function () {
      log('监听按键')
      // 监听按键事件
      document.addEventListener(Runner.events.KEYDOWN, this);
      document.addEventListener(Runner.events.KEYUP, this);
    },
    stopListening: function () {
      // 移除监听的按键事件
      document.removeEventListener(Runner.events.KEYDOWN, this);
      document.removeEventListener(Runner.events.KEYUP, this);
    },
    update: function () {
      log('画布更新');
    },
  };



  // ====================================
  function HorizonLine(canvas, spritePos) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.spritePos = spritePos; // 雪碧图中地平线的位置
    this.dimensions = {};       // 地平线的尺寸
    // this.sourceDimensions = {}; // 用于适配 HDPI 和 LDPI（这里忽略）

    this.spritePosX = [];       // 雪碧图中地平线的两种地形的 x 坐标

    this.posX = [];             // 画布中地平线的 x 坐标
    this.posY = 0;              // 画布中地平线的 y 坐标

    this.bumpThreshold = 0.5;   // 随机地形系数，控制两种地形的出现频率

    // 初始化
    this.init();

    // 绘制地平线
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
    
    // 地平线
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
    reset: function () {
      this.horizonLine.reset();
    },
  };
})();