
// # Version 1.10

// Import Three.js
import * as THREE from 'three';

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Obs: Create a sphere and add to Scene
const geometry = new THREE.SphereGeometry(25, 64, 32);
const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
const sphere = new THREE.Mesh(geometry, material);

scene.add(sphere);

// * Window Postion Tracker
let x = window.screenX;
// console.log(x);
let y = window.screenY;
// console.log(y);

function trackWindowPosition() {
    if (x !== window.screenX || y !== window.screenY) {
        x = window.screenX;
        y = window.screenY;
        console.log(x);
    }
}

// * Render loop
function animate() {
    requestAnimationFrame(animate);

    sphere.rotation.x += 0.01;
    sphere.rotation.y += 0.01;

    renderer.render(scene, camera);
    trackWindowPosition();
}
animate();
console.log('sphere.js loaded successfully');