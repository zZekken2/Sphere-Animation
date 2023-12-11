

/*
    # Version 0.4.1

    - Adding a Directional Light and switching to MeshPhongMaterial
    - Creating resizer so the values of the camera and renderer get updated with the new window size values
*/


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

// Create a light
const light = new THREE.DirectionalLight(0xffffff, 15); // color and intensity
light.position.set(80, 10, 80);

// Create a sphere
const radius = cameraZ * 0.7; // Has to be lower than the camera's z position (using 70% of that value)
const geometry = new THREE.SphereGeometry(radius, 64, 32);
const material = new THREE.MeshPhongMaterial({ // Using MeshPhongMaterial to make the sphere interact with the light
    color: 0xc617de,
    wireframe: true,
    emissive: 0x551f5c, // The color of the part of the object unafected by light
    specular: 0xb06abe, // The color of the part of the object directly lit by the light
    envMap: envMap.reflection, // Using the reflection environment map instead of the refraction one
    combine: THREE.MultiplyOperation
});
const sphere = new THREE.Mesh(geometry, material);

// Add objects to the scene
scene.add(light);
scene.add(sphere);

let rotation = 0.005;
let lastFrame = 0;
let resizeTimer;
let resize = false;

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
    Calls all the functions that are needed to render the scene
*/
function renderFunctions(elapsed){
    if((winCoords.x !== window.screenX || winCoords.y !== window.screenY) && !resize){
        windowTracker();
        windowToSphereCoords();
        newPosCalc(elapsed);
        moveSphere();
    }
}


/*
    This function tracks the window position and saves the previous for later use
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
    adding the result to the current position of the sphere
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
        const data = distanceAndAngle(s.x, s.y, nextSphereCoords.x, nextSphereCoords.y); // The distance and angle between the current and the final position
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
        // x^2 + y^2 = h^2, and multplying by raddius/2 to make the sphere move more than original equation
        distance: Math.sqrt(x * x + y * y) * (radius / 2),
        // Converting from radians to degrees
        angle: Math.atan2(y, x) * 180 / Math.PI
    };
}

/*
    Creates a vector with the specified magnitude and angle.
*/
function Vector(magnitude, angle){
    // Converting from degrees to radians
    const angleRadians = (angle * Math.PI) / 180;

    this.magnitudeX = magnitude * Math.cos(angleRadians);
    this.magnitudeY = - magnitude * Math.sin(angleRadians); // The minus sign is needed to make the sphere move in the right direction
}

/*
    Everytime the window is resized, there's a need to update the camera aspect ratio
    and the renderer size so it can accomodate the changes
*/
window.addEventListener('resize', function(){
    clearTimeout(resizeTimer); // Clear the timer so it doesn't run multiple times
    resize = true; // Set the resize flag to true so renderFunctions doesn't run at the same time

    // Making sphere's position stay the same when resizing
    sphere.position.x = sphereCoords[0].x;
    sphere.position.y = sphereCoords[0].y;

    renderer.setSize(window.innerWidth, window.innerHeight); // Match the renderer size to the window size

    // Updating the camera's frustrum planes
    camera.left = window.innerWidth / -3;
    camera.right = window.innerWidth / 3;
    camera.top = window.innerHeight / 3;
    camera.bottom = window.innerHeight / -3;
    camera.updateProjectionMatrix(); // It must be called after changing parameters

    // Setting the resize timer to false after 250ms
    resizeTimer = setTimeout(function(){
        resize = false;

        /* 
            Updating the winCoords so when the timer is done, the sphere doesn't jump to anotehr position
            Only the winCoords is updated because sphereCoords will be "updated" when renderFunctions is called after the timer is done
        */
        winCoords.x = window.screenX;
        winCoords.y = window.screenY;
    }, 10);
});

window.requestAnimationFrame(animation);
