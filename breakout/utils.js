log = console.log.bind(console);

function clearCanvas(ctx) {
  ctx.clearRect(0, 0, Game.config.width, Game.config.height);
}