window.onload = function () {
  var container = document.querySelector('#breakout-root');
  container.classList.add('breakout-container');

  new Breakout('#breakout-root');
};