import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import Tweakpane from "tweakpane";

/**
 * Base
 */
// Debug
const pane = new Tweakpane();

const paramaters = {};
paramaters.size = 0.02;
paramaters.radius = 250;
paramaters.heightStep = 0.1;
paramaters.turns = 4;
paramaters.pointsPerTurn = 325;
paramaters.randomness = 7.6;
paramaters.randomnessPower = 2;
paramaters.insideColor = "#ff6030";
paramaters.outsideColor = "#1b3984";

const generalFolder = pane.addFolder({
  title: "General settings",
});

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * generate Helix
 */
let group = null;
let geometry = null;
let material = null;
let points = null;
let angleStep = null;

const generateHelix = () => {
  if (points !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(group);
  }

  group = new THREE.Object3D();

  geometry = new THREE.BufferGeometry();

  angleStep = (Math.PI * 2) / paramaters.pointsPerTurn;

  const positions = new Float32Array(
    paramaters.turns * paramaters.pointsPerTurn * 3
  );
  const colors = new Float32Array(
    paramaters.turns * paramaters.pointsPerTurn * 3
  );

  const colorInside = new THREE.Color(paramaters.insideColor);
  const colorOutside = new THREE.Color(paramaters.outsideColor);

  for (let i = 0; i < paramaters.turns * paramaters.pointsPerTurn; i++) {
    const i3 = i * 3;

    const radius = Math.random() * paramaters.radius;

    const randomX =
      Math.pow(Math.random(), paramaters.randomnessPower) *
      paramaters.randomness *
      (Math.random() < 0.5 ? 1 : -1);
    const randomY =
      Math.pow(Math.random(), paramaters.randomnessPower) *
      paramaters.randomness *
      (Math.random() < 0.5 ? 1 : -1);
    const randomZ =
      Math.pow(Math.random(), paramaters.randomnessPower) *
      paramaters.randomness *
      (Math.random() < 0.5 ? 1 : -1);

    positions[i3] = Math.cos(angleStep * i) * radius + randomX;
    positions[i3 + 1] = paramaters.heightStep * i + randomY;
    positions[i3 + 2] = Math.sin(-angleStep * i) * radius + randomZ;

    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / paramaters.radius);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  material = new THREE.PointsMaterial({
    size: paramaters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  points = new THREE.Points(geometry, material);
  group.add(points);
  console.log(group);
  scene.add(group);
  const testBox = new THREE.Box3();
  testBox.setFromObject(group);

  const groupHeight = testBox.max.y - testBox.min.y;
  console.log(groupHeight);
  //   group.position.y = -groupHeight * 0.5;
  group.rotation.x = -Math.PI / 2;
};

generateHelix();

generalFolder
  .addInput(paramaters, "size", {
    step: 0.001,
    min: 0.001,
    max: 0.1,
  })
  .on("change", generateHelix);
generalFolder
  .addInput(paramaters, "radius", {
    step: 50,
    min: 150,
    max: 1500,
  })
  .on("change", generateHelix);
generalFolder
  .addInput(paramaters, "heightStep", {
    step: 0.01,
    min: 0.01,
    max: 0.5,
  })
  .on("change", generateHelix);
generalFolder
  .addInput(paramaters, "turns", {
    step: 1,
    min: 1,
    max: 10,
  })
  .on("change", generateHelix);
generalFolder
  .addInput(paramaters, "pointsPerTurn", {
    step: 100,
    min: 200,
    max: 15000,
  })
  .on("change", generateHelix);
generalFolder
  .addInput(paramaters, "randomness", {
    step: 0.1,
    min: 0.1,
    max: 15,
  })
  .on("change", generateHelix);
generalFolder
  .addInput(paramaters, "randomnessPower", {
    step: 1,
    min: 1,
    max: 10,
  })
  .on("change", generateHelix);
generalFolder.addInput(paramaters, "insideColor").on("change", generateHelix);
generalFolder.addInput(paramaters, "outsideColor").on("change", generateHelix);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  10000
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 70;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
