(function () {
  'use strict';

  var canvas = document.getElementById("myCanvas");
  var ctx = canvas.getContext("2d");
  var FPS = 60;
  var frame = 1000 / FPS;

  function Paddle() {
    this.color = 'red'
    this.w = 90;
    this.h = 15;
    this.x = (Game.config.width - this.w) / 2;
    this.y = (Game.config.height - 50);
    this.speed = 7;

    this.update = this.update.bind(this);
  }

  Paddle.prototype = {
    draw: function () {
      clearCanvas(ctx);
      ctx.beginPath();
      ctx.rect(this.x, this.y, this.w, this.h);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.closePath();
    },
    update: function () {
      setInterval(function () {
        if (moveLeft && paddle.x > 0) {
          paddle.x -= paddle.speed;
        }
        if (moveRight && paddle.x < (Game.config.width - paddle.w)) {
          paddle.x += paddle.speed;
        }

        this.draw();
      }, frame);
    },
  };

  function Ball() {
    this.color = 'green';
    this.r = 10;
    this.x = 100;
    this.y = 200;
    this.dx = 2;
    this.dy = 2;
  }

  Ball.prototype = {
    draw: function () {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.closePath();
    },
    move: function () {
      setInterval(function () {
        this.x += this.dx;
        this.y += this.dy;
        this.draw();
      }, frame);
    },
  };

  function Game() {
    this.keys = {};
    this.actions = {};

    this.registerAction = this.registerAction.bind(this);
  };

  Game.config = {
    width: canvas.width,
    height: canvas.height,
  };

  Game.prototype = {
    draw: function () {
      // paddle.draw();
      // ball.draw();

      // if (ball.x < 0 || ball.x > (Game.config.width - ball.r)) {
      //   ball.dx *= -1;
      // }
      // if (ball.y < 0 || ball.y > (Game.config.height - ball.r)) {
      //   ball.dy *= -1;
      // }

      // ball.x += ball.dx;
      // ball.y += ball.dy;
    },
    registerAction: function (key, callback) {
      this.actions[key] = callback;
    },
  };
  window['Game'] = Game;

  var _main = function () {
    var g = new Game();
    var paddle = new Paddle();
    // var ball = new Ball();

    g.registerAction('ArrowLeft', function () {
      log(123);
      paddle.update();
    });

    g.registerAction('ArrowRight', function () {
      log(123);
      paddle.update();
    });

    window.addEventListener('keydown', function (e) {
      this.keys[e.key] = true;
    });
    window.addEventListener('keyup', function (e) {
      this.keys[e.key] = false;
    });

    setInterval(function () {
      // 获取注册的事件
      var keys = Object.keys(g.actions);

      keys.forEach(key => {
        // 按的键有对应的注册事件
        if (g.keys[key]) {
          g.actions[key]();
        }
      });
      
      g.draw();
    }, frame*100);

    paddle.draw();
  };

  _main();
})();