import * as THREE from 'https://unpkg.com/three@0.155.0/build/three.module.js';
//创建场景
const scene =  new THREE.Scene();
//创建相机视角
const camera = new THREE .PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
camera.position.set(0, 8, 0);
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);
//创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);
//创建物理信息
const radius =  0.2; 
const widthSegments = 30;
const heightSegments = 30; 
const geometrySun = new THREE.SphereGeometry(radius, widthSegments, heightSegments);


//创建材质的纹理
const loader1 = new THREE.TextureLoader();
const texture1 = loader1.load('resources/images/test.png');
const texture2 = loader1.load('resources/images/test.png');
//创建材质
const material1 = new THREE.MeshBasicMaterial({map:texture1,});
const material2 = new THREE.MeshBasicMaterial({map:texture2,});

//创建物体
const solarSystem = new THREE.Object3D;
scene.add(solarSystem);
const Sun = new THREE.Mesh(geometrySun,material1);
Sun.scale.set(5, 5, 5);
solarSystem.add(Sun);


const earthOrbit = new THREE.Object3D();
earthOrbit.position.x = -3;
solarSystem.add(earthOrbit);
const geometryEarth = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
const earth = new THREE.Mesh(geometryEarth,material2)
earthOrbit.add(earth);

const geometryMoon = new THREE.SphereGeometry(radius,widthSegments,heightSegments);

const moon = new THREE.Mesh(geometryEarth,material2)
moon.position.x = 0.8;
moon.scale.set(0.5,0.5,0.5);
earthOrbit.add(moon);


renderer.render(scene, camera);

//动画函数
function animate(){
    requestAnimationFrame(animate);

    // solarSystem.rotation.x +=0.01;
    solarSystem.rotation.y +=0.01;
    earthOrbit.rotation.y +=0.005;
    renderer.render(scene, camera);
}
animate();

