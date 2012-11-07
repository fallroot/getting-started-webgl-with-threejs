/*
 * WebGL Water
 * http://madebyevan.com/webgl-water/
 *
 * Copyright 2011 Evan Wallace
 * Released under the MIT license
 */

function text2html(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
}

function handleError(text) {
  var html = text2html(text);
  if (html == 'WebGL not supported') {
    html = 'Your browser does not support WebGL.<br>Please see\
    <a href="http://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">\
    Getting a WebGL Implementation</a>.';
  }
  var loading = document.getElementById('loading');
  loading.innerHTML = html;
  loading.style.zIndex = 1;
}

window.onerror = handleError;

var gl = GL.create();
var water;
var cubemap;
var renderer;
var angleX = -25;
var angleY = -200.5;

// Sphere physics info
var useSpherePhysics = false;
var center;
var oldCenter;
var velocity;
var gravity;
var radius;
var paused = false;

window.onload = function() {
  function onresize() {
    gl.canvas.width = window.innerWidth - 300;
    gl.canvas.height = window.innerHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.matrixMode(gl.PROJECTION);
    gl.loadIdentity();
    gl.perspective(45, gl.canvas.width / gl.canvas.height, 0.01, 100);
    gl.matrixMode(gl.MODELVIEW);
    draw();
  }

  document.body.appendChild(gl.canvas);
  gl.clearColor(0, 0, 0, 1);

  water = new Water();
  renderer = new Renderer();
  cubemap = new Cubemap({
    xneg: document.getElementById('xneg'),
    xpos: document.getElementById('xpos'),
    yneg: document.getElementById('ypos'),
    ypos: document.getElementById('ypos'),
    zneg: document.getElementById('zneg'),
    zpos: document.getElementById('zpos')
  });

  center = oldCenter = new GL.Vector(-0.4, -0.75, 0.2);
  velocity = new GL.Vector();
  gravity = new GL.Vector(0, -4, 0);
  radius = 0.25;

  for (var i = 0; i < 20; i++) {
    water.addDrop(Math.random() * 2 - 1, Math.random() * 2 - 1, 0.03, (i & 1) ? 0.01 : -0.01);
  }

  document.getElementById('loading').innerHTML = '';
  onresize();

  var prevTime = new Date().getTime();
  setInterval(function() {
    var nextTime = new Date().getTime();
    if (!paused) {
      update((nextTime - prevTime) / 1000);
      draw();
    }
    prevTime = nextTime;
  }, 1000 / 60);

  window.onresize = onresize;

  var prevHit;
  var planeNormal;
  var mode = -1;
  var MODE_ADD_DROPS = 0;
  var MODE_MOVE_SPHERE = 1;
  var MODE_ORBIT_CAMERA = 2;

  gl.onmousedown = function(e) {
    var tracer = new GL.Raytracer();
    var ray = tracer.getRayForPixel(e.x, e.y);
    var pointOnPlane = tracer.eye.add(ray.multiply(-tracer.eye.y / ray.y));
    var sphereHitTest = GL.Raytracer.hitTestSphere(tracer.eye, ray, center, radius);
    if (sphereHitTest) {
      mode = MODE_MOVE_SPHERE;
      prevHit = sphereHitTest.hit;
      planeNormal = tracer.getRayForPixel(gl.canvas.width / 2, gl.canvas.height / 2).negative();
    } else if (Math.abs(pointOnPlane.x) < 1 && Math.abs(pointOnPlane.z) < 1) {
      mode = MODE_ADD_DROPS;
      gl.onmousemove(e);
    } else {
      mode = MODE_ORBIT_CAMERA;
    }
  };

  gl.onmouseup = function(e) {
    mode = -1;
  };

  gl.onmousemove = function(e) {
    switch (mode) {
      case MODE_ADD_DROPS:
        var tracer = new GL.Raytracer();
        var ray = tracer.getRayForPixel(e.x, e.y);
        var pointOnPlane = tracer.eye.add(ray.multiply(-tracer.eye.y / ray.y));
        water.addDrop(pointOnPlane.x, pointOnPlane.z, 0.03, 0.01);
        if (paused) {
          water.updateNormals();
          renderer.updateCaustics(water);
        }
        break;
      case MODE_MOVE_SPHERE:
        var tracer = new GL.Raytracer();
        var ray = tracer.getRayForPixel(e.x, e.y);
        var t = -planeNormal.dot(tracer.eye.subtract(prevHit)) / planeNormal.dot(ray);
        var nextHit = tracer.eye.add(ray.multiply(t));
        center = center.add(nextHit.subtract(prevHit));
        center.x = Math.max(radius - 1, Math.min(1 - radius, center.x));
        center.y = Math.max(radius - 1, Math.min(10, center.y));
        center.z = Math.max(radius - 1, Math.min(1 - radius, center.z));
        prevHit = nextHit;
        if (paused) renderer.updateCaustics(water);
        break;
      case MODE_ORBIT_CAMERA:
        angleY -= e.deltaX;
        angleX -= e.deltaY;
        angleX = Math.max(-90, Math.min(90, angleX));
        break;
    }
    if (paused) draw();
  };

  document.onkeydown = function(e) {
    if (e.which == ' '.charCodeAt(0)) paused = !paused;
    else if (e.which == 'G'.charCodeAt(0)) useSpherePhysics = !useSpherePhysics;
    else if (e.which == 'L'.charCodeAt(0) && paused) draw();
  };

  var frame = 0;

  function update(seconds) {
    if (seconds > 1) return;
    frame += seconds * 2;

    if (mode == MODE_MOVE_SPHERE) {
      // Start from rest when the player releases the mouse after moving the sphere
      velocity = new GL.Vector();
    } else if (useSpherePhysics) {
      // Fall down with viscosity under water
      var percentUnderWater = Math.max(0, Math.min(1, (radius - center.y) / (2 * radius)));
      velocity = velocity.add(gravity.multiply(seconds - 1.1 * seconds * percentUnderWater));
      velocity = velocity.subtract(velocity.unit().multiply(percentUnderWater * seconds * velocity.dot(velocity)));
      center = center.add(velocity.multiply(seconds));

      // Bounce off the bottom
      if (center.y < radius - 1) {
        center.y = radius - 1;
        velocity.y = Math.abs(velocity.y) * 0.7;
      }
    }

    // Displace water around the sphere
    water.moveSphere(oldCenter, center, radius);
    oldCenter = center;

    // Update the water simulation and graphics
    water.stepSimulation();
    water.stepSimulation();
    water.updateNormals();
    renderer.updateCaustics(water);
  }

  function draw() {
    // Change the light direction to the camera look vector when the L key is pressed
    if (GL.keys.L) {
      renderer.lightDir = GL.Vector.fromAngles((90 - angleY) * Math.PI / 180, -angleX * Math.PI / 180);
      if (paused) renderer.updateCaustics(water);
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.loadIdentity();
    gl.translate(0, 0, -4);
    gl.rotate(-angleX, 1, 0, 0);
    gl.rotate(-angleY, 0, 1, 0);
    gl.translate(0, 0.5, 0);

    gl.enable(gl.DEPTH_TEST);
    renderer.sphereCenter = center;
    renderer.sphereRadius = radius;
    renderer.renderCube();
    renderer.renderWater(water, cubemap);
    renderer.renderSphere();
    gl.disable(gl.DEPTH_TEST);
  }
};
