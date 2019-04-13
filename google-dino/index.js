window.onload = function () {
  var log = console.log.bind(console);
  
  var chromeDino = document.getElementById('chrome-dino');
  chromeDino.classList.add('offline');

  new Runner('#chrome-dino');
};