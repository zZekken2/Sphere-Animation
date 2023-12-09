

// # Version 0.4
// - Adding a little bit of style to the sphere :D


// Import Three.js
import * as THREE from 'three';

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.OrthographicCamera(window.innerWidth / -3, window.innerWidth / 3, window.innerHeight / 3, window.innerHeight / -3, 0.1, 1000); // Since the camera is orthographic, the sphere will not be distorted when going further from the center of the scene
let cameraZ = 100;
camera.position.set(0, 0, cameraZ); // Set the camera's position
camera.lookAt(scene.position); // Set the camera's target to the center of the scene
camera.up.set(0, 1, 0); // Set the camera's up vector

// Create a renderer
const renderer = new THREE.WebGLRenderer({antialias: true}); // antialiasing makes the sphere look smoother
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Loading textures
const cubeTextureLoader = new THREE.CubeTextureLoader();
const envMap = (function(){ // Environment Map textures
    const path = '../Textures/Yokohama3/'; // textures made by Humus (https://www.humus.name/index.php?page=Textures)
    const format = '.jpg';
    const urls = [
        path + 'posx' + format, path + 'negx' + format,
        path + 'posy' + format, path + 'negy' + format,
        path + 'posz' + format, path + 'negz' + format
    ];

    const reflectionCube = cubeTextureLoader.load(urls);
    const refractionCube = cubeTextureLoader.load(urls);
    refractionCube.mapping = THREE.CubeRefractionMapping;

    return{
        reflection: reflectionCube,
        refraction: refractionCube
    };

})();

// Create a sphere and add to Scene
const radius = cameraZ * 0.7; // Has to be lower than the camera's z position (using 70% of that value)
const geometry = new THREE.SphereGeometry(radius, 64, 64);
const material = new THREE.MeshBasicMaterial({
    color: 0xc617de,
    wireframe: true,
    envMap: envMap.reflection, // Using the reflection environment map instead of the refraction one
    combine: THREE.MultiplyOperation
});
const sphere = new THREE.Mesh(geometry, material);

scene.add(sphere);

let rotation = 0.005;
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

    sphere.rotation.x += rotation;
    sphere.rotation.y += rotation;
    sphere.rotation.z += rotation;

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
        const velocity = data.distance / 0.8; // The higher the constant, the slower the sphere moves
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
        distance: Math.sqrt(x * x + y * y) * (radius / 2),
        angle: Math.atan2(y, x) * 180 / Math.PI
    };
}

/*
    Creates a vector with the specified magnitude and angle.
*/
function Vector(magnitude, angle){
    const angleRadians = (angle * Math.PI) / 180;

    this.magnitudeX = magnitude * Math.cos(angleRadians);
    this.magnitudeY = - magnitude * Math.sin(angleRadians); // The minus sign is needed to make the sphere move in the right direction
}

window.requestAnimationFrame(animation);
