

// # Version 0.2.2
// - Creating smooth movement based on the window position vectors


// Import Three.js
import * as THREE from 'three';

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 150;

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a sphere and add to Scene
const radius = 25;
const geometry = new THREE.SphereGeometry(radius, 64, 32);
const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
const sphere = new THREE.Mesh(geometry, material);

scene.add(sphere);

let lastFrame = 0;
let winCoords = {
    x: window.screenX,
    y: window.screenY
};
let prevWinCoords = {
    x: window.screenX,
    y: window.screenY
};

let sphereCoords = [{
    x: sphere.position.x,
    y: sphere.position.y
}];
let nextSphereCoords = {
    x: 0,
    y: 0
};

/*
    The animation fucntion controls the render loop
*/
function animation(milliseconds){ // milliseconds is passed automatically by the requestAnimationFrame function
    let elapsed = milliseconds - lastFrame; // elapsed is the time passed since the last frame
    lastFrame = milliseconds;

    renderFunctions(elapsed);
    renderer.render(scene, camera);

    setTimeout(window.requestAnimationFrame(animation), 300);
}

/*
    The renderFunctions  calls all the functions that are needed to render the scene
*/
function renderFunctions(elapsed){
    if(winCoords.x !== window.screenX || winCoords.y !== window.screenY){
        windowTracker();
        windowToSphereCoords();
        newPosCalc(elapsed);
        moveSphere();
    }
}


/*
    The windowTracker function tracks the window position
    and saves the previous position dor later use
*/
function windowTracker(){
    prevWinCoords.x = winCoords.x;
    prevWinCoords.y = winCoords.y;

    winCoords.x = window.screenX;
    winCoords.y = window.screenY;
}

/*
    The windowToSphereCoords function calculates the new sphere position
    based on the difference between the previous and the current window position
    adding the difference to the current sphere position
*/
function windowToSphereCoords(){
    nextSphereCoords.x = sphereCoords[0].x + (winCoords.x - prevWinCoords.x);
    nextSphereCoords.y = sphereCoords[0].y + (winCoords.y - prevWinCoords.y);
}

/*
    The newPosCalc function calculates the new position of the sphere
    based on the distance and angle between the current and the next sphere position
*/
function newPosCalc(milliseconds){
    for(const s of sphereCoords){
        const data = distanceAndAngle(s.x, s.y, nextSphereCoords.x, nextSphereCoords.y);
         const velocity = data.distance / 1; // Original value: 0.5 but I liked 0.4 better
        const newPosVector = new Vector(velocity, data.angle);
        const elapsedTime = milliseconds / 1000; // convert to seconds

        s.x += newPosVector.magnitudeX * elapsedTime;
        s.y += newPosVector.magnitudeY * elapsedTime;
    }
}


/*
    Moves the sphere to the specified coordinates.
*/
function moveSphere(){
    for(const s of sphereCoords){
        sphere.position.x = s.x;
        sphere.position.y = s.y;
    }
}

/*
    Calculates the distance and angle between two points.
*/
function distanceAndAngle(x1, y1, x2, y2){
    const x = x2 - x1;
    const y = y2 - y1;

    return{
        distance: Math.sqrt(x * x + y * y) * (radius / 2), // TODO: Find a way to make the sphere move more smoothly (previusly: multiplied by 5)
        angle: Math.atan2(y, x) * 180 / Math.PI
    };
}

/*
    Creates a vector with the specified magnitude and angle.
*/
function Vector(magnitude, angle){
    const angleRadians = (angle * Math.PI) / 180;

    this.magnitudeX = magnitude * Math.cos(angleRadians);
    this.magnitudeY = magnitude * Math.sin(angleRadians);
}

window.requestAnimationFrame(animation);
