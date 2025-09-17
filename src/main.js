import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

//创建场景
const scene =  new THREE.Scene();

//创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

//轨道控制和相机
const camera = new THREE .PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
camera.position.set(0, 8, 0);

const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set(0, 0, 0);

//加入天空盒
const loader = new THREE.TextureLoader();
const texture = loader.load(
  'resources/images/space.jpg',
  () => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    scene.background = texture;
  });

//创建光源
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.AmbientLight(color);
scene.add(light);

const gui = new GUI();
gui.add(light,'intensity',0,5,0.01);


//创建星体纹理(临时用)
const loader1 = new THREE.TextureLoader();
const texture1 = loader1.load('resources/images/test.png');
const texture2 = loader1.load('resources/images/test.png');
const texture3 = loader1.load('resources/images/test.png');
const texture4 = loader1.load('resources/images/test.png');
const texture5 = loader1.load('resources/images/test.png');
const texture6 = loader1.load('resources/images/test.png');
const texture7 = loader1.load('resources/images/test.png');
const texture8 = loader1.load('resources/images/test.png');
const texture9 = loader1.load('resources/images/test.png');
//创建材质
const material1 = new THREE.MeshPhongMaterial({map:texture1});
const material2 = new THREE.MeshPhongMaterial({map:texture2});
const material3 = new THREE.MeshPhongMaterial({map:texture3});
const material4 = new THREE.MeshPhongMaterial({map:texture4});
const material5 = new THREE.MeshPhongMaterial({map:texture5});
const material6 = new THREE.MeshPhongMaterial({map:texture6});
const material7 = new THREE.MeshPhongMaterial({map:texture7});
const material8 = new THREE.MeshPhongMaterial({map:texture8});
const material9 = new THREE.MeshPhongMaterial({map:texture9});

//创建物理信息
const data = {radius : 0.2,widthSegments : 30,heightSegments : 30 };
const gplanet = new THREE.SphereGeometry(data.radius, data.widthSegments, data.heightSegments);

//创建星体
const solarSystem = new THREE.Object3D;
const unit = 8;
scene.add(solarSystem);
    const Sun = new THREE.Mesh(gplanet,material1);
    Sun.scale.set(20, 20, 20);
    solarSystem.add(Sun);
//水
    const MercuryOrbit = new THREE.Object3D();
    const Mercury = new THREE.Mesh(gplanet,material2)
    Mercury.scale.set(0.4, 0.4, 0.4);
    Mercury.position.x = -0.4*unit;
    MercuryOrbit.add(Mercury);
//金
    const VenusOrbit = new THREE.Object3D();
    const Venus = new THREE.Mesh(gplanet,material3)
    Venus.scale.set(1.2, 1.2, 1.2);
    Venus.position.x = -0.7*unit;
    VenusOrbit.add(Venus);
//地
    const earthOrbit = new THREE.Object3D();
    const earth = new THREE.Mesh(gplanet,material4)
    earth.scale.set(1.27, 1.27, 1.27);
    earth.position.x = -1*unit;
    earthOrbit.add(earth);
        //月
        const moonOrbit = new THREE.Object3D();
        earth.add(moonOrbit);
        const moon = new THREE.Mesh(gplanet,material2)
        moon.position.x = 0.8;
        moon.scale.set(0.5,0.5,0.5);
        moonOrbit.add(moon);
//火
    const MarsOrbit = new THREE.Object3D();
    const Mars = new THREE.Mesh(gplanet,material5)
    Mars.scale.set(0.68, 0.68, 0.68);
    Mars.position.x = -1.5*unit;
    MarsOrbit.add(Mars);

    const Asteroidbelt = new THREE.Object3D();
//木
    const JupiterOrbit = new THREE.Object3D();
    const Jupiter = new THREE.Mesh(gplanet,material6)
    Jupiter.scale.set(14, 14, 14);
    Jupiter.position.x = -5.0*unit;
    JupiterOrbit.add(Jupiter);
//土
    const SaturnOrbit = new THREE.Object3D();
    const Saturn = new THREE.Mesh(gplanet,material7)
    Saturn.scale.set(12, 12, 12);
    Saturn.position.x = -10*unit;
    SaturnOrbit.add(Saturn);
        //环
        const rings = new THREE.Object3D();
//天
    const UranusOrbit = new THREE.Object3D();
    const Uranus = new THREE.Mesh(gplanet,material8)
    Uranus.scale.set(5, 5, 5);
    Uranus.position.x = -20*unit;
    UranusOrbit.add(Uranus);
//海
    const NeptuneOrbit = new THREE.Object3D();
    const Neptune = new THREE.Mesh(gplanet,material9)
    Neptune.scale.set(5, 5, 5);
    Neptune.position.x = -30*unit;
    NeptuneOrbit.add(Neptune);

solarSystem.add(MercuryOrbit);
solarSystem.add(VenusOrbit);
solarSystem.add(earthOrbit);
solarSystem.add(MarsOrbit);
solarSystem.add(JupiterOrbit);
solarSystem.add(SaturnOrbit);
solarSystem.add(UranusOrbit);
solarSystem.add(NeptuneOrbit);

renderer.render(scene, camera);

const speed = 1;
function planetRevolution(){

    Sun.rotation.y +=0.20944*speed;
    MercuryOrbit.rotation.y +=0.0714*speed;
    VenusOrbit.rotation.y +=0.02805*speed;
    earthOrbit.rotation.y +=0.0172142466*speed;
    MarsOrbit.rotation.y +=0.00916*speed;
    JupiterOrbit.rotation.y +=0.0014510393*speed;
    SaturnOrbit.rotation.y +=0.0005839219*speed;
    UranusOrbit.rotation.y +=0.0002049250*speed;
    NeptuneOrbit.rotation.y +=0.0001044520*speed;
}

//动画函数
function animate(){
    requestAnimationFrame(animate);
    planetRevolution();
    renderer.render(scene, camera);
    controls.update();
}
animate();

