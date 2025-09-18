import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { AdditiveBlending } from 'three';

//创建场景
const scene =  new THREE.Scene();

//创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

//轨道控制和相机
const camera = new THREE .PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
camera.position.set(0, 5, -10);

// const controls = new OrbitControls( camera, renderer.domElement );
// controls.target.set(0, 0, 0);


//加入天空盒
const loader = new THREE.TextureLoader();
const texture = loader.load(
  'resources/images/space2.jpg',
  () => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    scene.background = texture;
  });

//创建光源
const color = 0xFFFFFF;
const intensity = 0.5;
const light = new THREE.AmbientLight(color);
scene.add(light);

const gui = new GUI();
gui.add(light,'intensity',0,5,0.01);

//飞船
let spaceship;
let spaceshipLoaded = false
// 在飞船加载完成后添加粒子系统


const gltfLoader = new GLTFLoader();
gltfLoader.load('resources/model/spaceship/scene.gltf', (gltf) => {
    console.log('OK')
    spaceship = gltf.scene;
    spaceship.scale.set(0.25, 0.25, 0.25);
    spaceship.rotation.y =  Math.PI;
    spaceship.position.set(0,0,-12);
    scene.add(spaceship);

    const axesHelper = new THREE.AxesHelper(3); 
    spaceship.add(axesHelper);
    spaceshipLoaded = true;
});

// 鼠标控制
let mouseX = 0;
let mouseY = 0;
const rotationspeed = 0.002;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - window.innerWidth / 2) * rotationspeed;
    mouseY = (event.clientY - window.innerHeight / 3*2) * rotationspeed;
});
// 键盘控制
const keys = {
    w: false,
    shift: false
};

document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'w') keys.w = true;
    if (event.key === 'Shift') keys.shift = true;
});

document.addEventListener('keyup', (event) => {
    if (event.key.toLowerCase() === 'w') keys.w = false;
    if (event.key === 'Shift') keys.shift = false;
});


//粒子系统
let particleSystem, particleGeo, particleMat;
const maxParticles = 20000;      // 最大粒子数
const emissionRate = 8;        // 持续按 W 时每帧发射的粒子数
const particleLifetime = 0.05;   // 粒子寿命（秒）
const particles = [];           // 粒子对象池

function initParticles() {
    // 创建 BufferGeometry 并预分配位置、寿命属性
    particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(maxParticles * 3);
    const lifetimes = new Float32Array(maxParticles);
    particleGeo.setAttribute(
      'position', 
      new THREE.BufferAttribute(positions, 3)
    );
    particleGeo.setAttribute(
      'lifetime', 
      new THREE.BufferAttribute(lifetimes, 1)
    );
  
    // 使用点精灵材质，开启加色法混合与透明度
    particleMat = new THREE.PointsMaterial({
      size: 0.5,
      map: new THREE.TextureLoader().load('resources/images/fire.png'),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      color: 0xffaa33
    });
  
    // 将粒子系统添加到场景
    particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);
  
    // 初始化粒子对象池
    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        life: 0,
        index: i
      });
    }
  }
  function emitParticles(delta) {
    // 如果按住 W 则持续发射新粒子
    let toEmit = keys.w ? emissionRate : 0;
    while (toEmit-- > 0) {
      // 从对象池里找一个“死掉”的粒子
      const p = particles.find(p => p.life <= 0);
      if (!p) break;
  
      // 粒子初始位置：飞船尾部
      p.pos.copy(new THREE.Vector3(0, 0, 1))
        .applyQuaternion(spaceship.quaternion)
        .add(spaceship.position);
  
      // 在锥形区域内随机方向，转换为世界空间速度
      const coneAngle = Math.PI / 12;
      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * coneAngle,
        (Math.random() - 0.5) * coneAngle,
        1
      ).normalize();
      dir.applyQuaternion(spaceship.quaternion);
      // 根据是否按 Shift 决定喷射速度，并加上一点随机值
      p.vel.copy(
        dir.multiplyScalar((keys.shift ? 3 : 1) + Math.random())
      );
  
      // 重置寿命
      p.life = particleLifetime;
    }
  
    // 更新所有粒子的位置与寿命
    const positions = particleGeo.attributes.position.array;
    const lifetimes = particleGeo.attributes.lifetime.array;
  
    particles.forEach(p => {
      if (p.life > 0) {
        p.life -= delta;
        p.pos.addScaledVector(p.vel, delta);
  
        const i3 = p.index * 3;
        positions[i3]     = p.pos.x;
        positions[i3 + 1] = p.pos.y;
        positions[i3 + 2] = p.pos.z;
        // 将剩余寿命用于后续 shader 淡出
        lifetimes[p.index] = p.life / particleLifetime;
      } else {
        // “隐藏”已经死亡的粒子
        const i3 = p.index * 3;
        positions[i3] = positions[i3+1] = positions[i3+2] = 0;
        lifetimes[p.index] = 0;
      }
    });
  
    // 通知 Three.js 更新缓冲区
    particleGeo.attributes.position.needsUpdate = true;
    particleGeo.attributes.lifetime.needsUpdate = true;
  }
  initParticles();

  // 使用时钟计算帧间隔
const clock = new THREE.Clock();


//飞船参数设置
const basespeed = 0.1;
const boostspeed = 0.3;
let currentspeed = 0;
const deadzone = 0.1;
//相机跟随
function move(){
    if (spaceship) {
        // targetRotationX += (mouseY - targetRotationX) * 0.1;
        // targetRotationY += (mouseX - targetRotationY) * 0.1;
        if (Math.abs(mouseX) > deadzone) {
            spaceship.rotation.y -= Math.sqrt(Math.abs(mouseX)-deadzone) * 0.01 * Math.sign(mouseX-deadzone);                     
        }
        if (Math.abs(mouseY) > deadzone) {
            spaceship.rotation.x -= Math.sqrt(Math.abs(mouseY)-deadzone) * 0.01 * Math.sign(mouseY-deadzone);               
        }
        // spaceship.rotation.x = Math.max(-Math.PI/4, Math.min(Math.PI/2, spaceship.rotation.x));

               
        if (keys.w) {
            currentspeed = keys.shift ? boostspeed : basespeed;
            
        } else {
            currentspeed = 0;

        }
        // 移动飞船
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(spaceship.quaternion);
        spaceship.position.add(direction.multiplyScalar(currentspeed));      
    }

    

    //相机跟随

    const cameraOffset = new THREE.Vector3(0, 1, 3);

    // 根据飞船的旋转调整相机位置
    cameraOffset.applyQuaternion(spaceship.quaternion);

    // 设置相机位置（飞船位置 + 偏移量）
    camera.position.copy(spaceship.position).add(cameraOffset);

    // 让相机看向飞船前方稍远的位置，而不是直接看向飞船
    const lookAtPosition = new THREE.Vector3(0, 0, -10);
    lookAtPosition.applyQuaternion(spaceship.quaternion);
    lookAtPosition.add(spaceship.position);

    camera.lookAt(lookAtPosition);
}



// 创建材质的纹理 - 使用本地文件
const loader1 = new THREE.TextureLoader();
// 设置纹理加载的基本路径（如果纹理在textures文件夹中）
loader1.setPath('textures/');

//加载本地纹理
const sunTexture = loader1.load('sun.jpg');
const mercuryTexture = loader1.load('mercury.jpg');
const venusTexture = loader1.load('venus.jpg');
const earthTexture = loader1.load('earth.png');
const marsTexture = loader1.load('mars.jpg');
const jupiterTexture = loader1.load('jupiter.jpg');
const saturnTexture = loader1.load('saturn.jpg');
const uranusTexture = loader1.load('uranus.jpg')
const neptuneTexture = loader1.load('neptune.jpg');
const moonTexture = loader1.load('moon.jpg');
const fireTexture = loader.load

//创建材质
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const mercuryMaterial = new THREE.MeshBasicMaterial({ map: mercuryTexture });
const venusMaterial = new THREE.MeshBasicMaterial({ map: venusTexture });
const earthMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
const marsMaterial = new THREE.MeshBasicMaterial({ map: marsTexture });
const jupiterMaterial = new THREE.MeshBasicMaterial({ map: jupiterTexture });
const saturnMaterial = new THREE.MeshBasicMaterial({ map: saturnTexture });
const uranusMaterial = new THREE.MeshBasicMaterial({ map: uranusTexture });
const neptuneMaterial = new THREE.MeshBasicMaterial({ map: neptuneTexture });
const moonMaterial = new THREE.MeshBasicMaterial({ map: moonTexture });


//创建物理信息
const data = {radius : 0.2,widthSegments : 30,heightSegments : 30 };
const gplanet = new THREE.SphereGeometry(data.radius, data.widthSegments, data.heightSegments);

function createPlanetRings(innerRadius, outerRadius, particleCount, color, thickness = 0.01) {
    const geometry  = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
  
    for (let i = 0; i < particleCount; i++) {
      // 环面角度 & 半径
      const angle    = Math.random() * Math.PI * 2;
      const distance = THREE.MathUtils.lerp(innerRadius, outerRadius, Math.random());
  
      // XZ 平面分布
      positions[i * 3]     = Math.cos(angle) * distance;
      positions[i * 3 + 2] = Math.sin(angle) * distance;
      // Y 轴高度微小随机：thickness 越小越扁平
      positions[i * 3 + 1] = (Math.random() * 2 - 1) * thickness;
    }
  
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
    const material = new THREE.PointsMaterial({
      color: color,
      size: 0.04,
      sizeAttenuation: true,
      transparent: true,
      depthWrite: false,
    });
  
    const points = new THREE.Points(geometry, material);
  
    // 额外沿 Y 轴缩放整体几何，进一步压扁行星环
    points.scale.set(1, 0.2, 1);
  
    return points;
  }
  
  // 调用示例
  const rings = createPlanetRings(2, 4, 2000, 0xcccccc, 0.005);
  scene.add(rings);

  //行星参数和GUI
  const planetData = {
    unit:8,
    speed:0.15
    };

    gui.add(planetData, 'speed', 0, 2, 0.01).name('公转速度');
    gui.add(planetData, 'unit', 4, 8, 0.5).name('距离比例');


//创建星体
const solarSystem = new THREE.Object3D;

scene.add(solarSystem);
    const Sun = new THREE.Mesh(gplanet,sunMaterial);
    Sun.scale.set(20, 20, 20);
    solarSystem.add(Sun);
//水
    const MercuryOrbit = new THREE.Object3D();
    const Mercury = new THREE.Mesh(gplanet,mercuryMaterial)
    Mercury.scale.set(0.4, 0.4, 0.4);
    Mercury.position.x = -0.4*planetData.unit;
    MercuryOrbit.add(Mercury);
//金
    const VenusOrbit = new THREE.Object3D();
    const Venus = new THREE.Mesh(gplanet,venusMaterial)
    Venus.scale.set(1.2, 1.2, 1.2);
    Venus.position.x = -0.7*planetData.unit;
    VenusOrbit.add(Venus);
//地
    const earthOrbit = new THREE.Object3D();
    const earth = new THREE.Mesh(gplanet,earthMaterial)
    earth.scale.set(1.27, 1.27, 1.27);
    earth.position.x = -1*planetData.unit;
    earthOrbit.add(earth);
        //月
        const moonOrbit = new THREE.Object3D();
        earth.add(moonOrbit);
        const moon = new THREE.Mesh(gplanet,moonMaterial)
        moon.position.x = 0.8;
        moon.scale.set(0.5,0.5,0.5);
        moonOrbit.add(moon);
//火
    const MarsOrbit = new THREE.Object3D();
    const Mars = new THREE.Mesh(gplanet,marsMaterial)
    Mars.scale.set(0.68, 0.68, 0.68);
    Mars.position.x = -1.5*planetData.unit;
    MarsOrbit.add(Mars);

//    const Asteroidbelt = new THREE.Object3D();
//木
    const JupiterOrbit = new THREE.Object3D();
    const Jupiter = new THREE.Mesh(gplanet,jupiterMaterial)
    Jupiter.scale.set(14, 14, 14);
    Jupiter.position.x = -5.0*planetData.unit;
    JupiterOrbit.add(Jupiter);

    const jupiterRings = createPlanetRings(0.375, 0.45, 3000, 0xd8ca9d);
    Jupiter.add(jupiterRings);
//土
    const SaturnOrbit = new THREE.Object3D();
    const Saturn = new THREE.Mesh(gplanet,saturnMaterial)
    Saturn.scale.set(12, 12, 12);
    Saturn.position.x = -10*planetData.unit;
    SaturnOrbit.add(Saturn);
    
    const saturnRings = createPlanetRings(0.325, 0.5, 5000, 0xf1e6c9);
    Saturn.add(saturnRings);
//天
    const UranusOrbit = new THREE.Object3D();
    const Uranus = new THREE.Mesh(gplanet,uranusMaterial)
    Uranus.scale.set(5, 5, 5);
    Uranus.position.x = -20*planetData.unit;
    UranusOrbit.add(Uranus);
//海
    const NeptuneOrbit = new THREE.Object3D();
    const Neptune = new THREE.Mesh(gplanet,neptuneMaterial)
    Neptune.scale.set(5, 5, 5);
    Neptune.position.x = -30*planetData.unit;
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


function planetRevolution(){

    Sun.rotation.y +=0.20944*planetData.speed;
    MercuryOrbit.rotation.y +=0.0714*planetData.speed;
    VenusOrbit.rotation.y +=0.02805*planetData.speed;
    earthOrbit.rotation.y +=0.0172142466*planetData.speed;
    MarsOrbit.rotation.y +=0.00916*planetData.speed;
    JupiterOrbit.rotation.y +=0.0014510393*planetData.speed;
    SaturnOrbit.rotation.y +=0.0005839219*planetData.speed;
    UranusOrbit.rotation.y +=0.0002049250*planetData.speed;
    NeptuneOrbit.rotation.y +=0.0001044520*planetData.speed;
}


//添加星空背景
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 0.1,
    transparent: true
});

const starVertices = [];
for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starVertices.push(x, y, z);
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

renderer.render(scene, camera);


//动画函数

function animate(){
    requestAnimationFrame(animate);
    planetRevolution();
    renderer.render(scene, camera);
    const delta = clock.getDelta();
    emitParticles(delta);
     if (spaceshipLoaded) {
        move();
     }
    renderer.render(scene, camera);

}
animate();
