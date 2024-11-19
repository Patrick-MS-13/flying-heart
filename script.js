var canvas;
var stage;
var container;
var captureContainers;
var captureIndex;

function init() {
  // create a new stage and point it at our canvas:
  canvas = document.getElementById("testCanvas");
  stage = new createjs.Stage(canvas);

  // Resize canvas to fit window size
  resizeCanvas();

  container = new createjs.Container();
  stage.addChild(container);

  captureContainers = [];
  captureIndex = 0;

  // Create more hearts (500 hearts in this case):
  for (var i = 0; i < 500; i++) {  // Increased from 100 to 500 hearts
    var heart = new createjs.Shape();
    heart.graphics.beginFill(createjs.Graphics.getHSL(Math.random() * 30 - 45, 100, 50 + Math.random() * 30));
    heart.graphics.moveTo(0, -12).curveTo(1, -20, 8, -20).curveTo(16, -20, 16, -10).curveTo(16, 0, 0, 12);
    heart.graphics.curveTo(-16, 0, -16, -10).curveTo(-16, -20, -8, -20).curveTo(-1, -20, 0, -12);
    heart.y = -100;
    container.addChild(heart);
  }

  // Adjust text size based on screen width
  var text = new createjs.Text("Nee oru Mass laaa 🔥", "bold " + getTextSize() + "px Arial", "#312");
  text.textAlign = "center";
  text.lineWidth = canvas.width - 40;  // To allow text wrapping inside the screen
  text.x = canvas.width / 2;
  text.y = canvas.height / 2 - text.getMeasuredLineHeight();
  stage.addChild(text);

  // Cache container for better performance
  for (var i = 0; i < 100; i++) {
    var captureContainer = new createjs.Container();
    captureContainer.cache(0, 0, canvas.width, canvas.height);
    captureContainers.push(captureContainer);
  }

  // start the tick and point it at the window so we can do some work before updating the stage:
  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.on("tick", tick);

  // Add resize listener for responsiveness
  window.addEventListener('resize', onResize);
}

function getTextSize() {
  // Adjust text size based on window width
  var windowWidth = window.innerWidth;

  if (windowWidth <= 600) { // Mobile devices
    return 32; // Larger text on small screens
  } else if (windowWidth <= 1024) { // Tablets or medium screens
    return 28;
  } else {
    return 24; // Default text size for larger screens
  }
}

function onResize() {
  // Adjust canvas size and text size on resize
  resizeCanvas();

  // Update the text size and position based on the new screen size
  var text = stage.getChildAt(1);  // Assuming the text is the second child in the stage
  text.font = "bold " + getTextSize() + "px Arial";
  text.lineWidth = canvas.width - 40;  // Allow text to wrap and adjust to the screen
  text.x = canvas.width / 2;
  text.y = canvas.height / 2 - text.getMeasuredLineHeight();

  // Redraw stage
  stage.update();
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  stage.update();
}

function tick(event) {
  var w = canvas.width;
  var h = canvas.height;
  var l = container.numChildren;

  captureIndex = (captureIndex + 1) % captureContainers.length;
  stage.removeChildAt(0);
  var captureContainer = captureContainers[captureIndex];
  stage.addChildAt(captureContainer, 0);
  captureContainer.addChild(container);

  // iterate through all the children and move them according to their velocity:
  for (var i = 0; i < l; i++) {
    var heart = container.getChildAt(i);
    if (heart.y < -50) {
      heart._x = Math.random() * w;
      heart.y = h * (1 + Math.random()) + 50;
      heart.perX = (1 + Math.random() * 2) * h;
      heart.offX = Math.random() * h;
      heart.ampX = heart.perX * 0.1 * (0.15 + Math.random());
      heart.velY = -Math.random() * 2 - 1;
      heart.scale = Math.random() * 2 + 1;
      heart._rotation = Math.random() * 40 - 20;
      heart.alpha = Math.random() * 0.75 + 0.05;
      heart.compositeOperation = Math.random() < 0.33 ? "lighter" : "source-over";
    }
    var int = (heart.offX + heart.y) / heart.perX * Math.PI * 2;
    heart.y += heart.velY * heart.scaleX / 2;
    heart.x = heart._x + Math.cos(int) * heart.ampX;
    heart.rotation = heart._rotation + Math.sin(int) * 30;
  }

  captureContainer.updateCache("source-over");

  // draw the updates to stage:
  stage.update(event);
}

init();
