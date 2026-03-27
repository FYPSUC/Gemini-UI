import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { planetsData } from './planetsData.js';
import { updateHoverUI, hideHoverUI, initSPA_Navigation } from './uiManager.js';

// ---- 1. 基础场景设置 ----
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.set(0, 120, 250);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = true;
controls.minDistance = 5;
controls.maxDistance = 8000;

// ---- 极致视觉：SSS级后期渲染流 (Cinematic Bloom Effect) ----
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.8, 0.4, 0.85);
bloomPass.threshold = 0.70; // 仅仅让极亮的恒星、光环发光泛光，保持行星地貌清晰
bloomPass.strength = 1.8;   // 顶级电影级辉光强度
bloomPass.radius = 0.6;
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// ---- 炫酷特效：摄像机绑定的超光速跃迁星轨 (Warp Tunnel) ----
const createWarpTunnel = () => {
    const count = 1500;
    const pos = new Float32Array(count * 6);
    for(let i=0; i<count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const radius = Math.random() * 150 + 20;
        const x = Math.cos(theta) * radius;
        const y = Math.sin(theta) * radius;
        const zStart = -Math.random() * 3000 - 500; 
        const zEnd = zStart - (Math.random() * 400 + 100); 
        pos[i*6] = x; pos[i*6+1] = y; pos[i*6+2] = zStart;
        pos[i*6+3] = x; pos[i*6+4] = y; pos[i*6+5] = zEnd;
    }
    const mat = new THREE.LineBasicMaterial({ color: 0x88ffcc, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const lineMesh = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3)), mat);
    lineMesh.visible = false; // 初始隐藏，防止深度缓冲引发黑色遮罩层
    camera.add(lineMesh);
    scene.add(camera); // 相机作为实体加入场景，星轨永远跟随前方
    return { mesh: lineMesh, mat: mat, active: false };
};
const warpEngine = createWarpTunnel();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.06); 
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xfffff0, 3.5, 0, 0); // 衰减设为0，防止近距离行星直接过曝变白
sunLight.position.set(0, 0, 0); 
scene.add(sunLight);

const textureLoader = new THREE.TextureLoader();
textureLoader.setCrossOrigin('anonymous');


// ---- 2. 宇宙环境：高性能满天星系背景 ----
const createSpaceBackground = () => {
    const starCount = 12000; // 恢复充足的星光数量，Points材质基本0消耗
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const color1 = new THREE.Color(0xffffff);
    const color2 = new THREE.Color(0x88ccff);
    const color3 = new THREE.Color(0xffaa88);

    for(let i = 0; i < starCount; i++) {
        const r = 200 + Math.random() * 1500; // 超大半径分布，包裹黑洞坐标体系
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        
        starPositions[i*3]     = r * Math.sin(phi) * Math.cos(theta);
        starPositions[i*3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        starPositions[i*3 + 2] = r * Math.cos(phi);

        const rand = Math.random();
        let mixColor = color1;
        if(rand > 0.8) mixColor = color1.clone().lerp(color2, Math.random());
        else if(rand > 0.6) mixColor = color1.clone().lerp(color3, Math.random());

        starColors[i*3] = mixColor.r; starColors[i*3 + 1] = mixColor.g; starColors[i*3 + 2] = mixColor.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    // 使用官方基础材质结合尺寸不随距离衰减参数 (sizeAttenuation: false)
    // 保证星星无论多远都能保持 1.5 像素点，彻底杜绝拉远后背景黑掉的问题！
    const starMaterial = new THREE.PointsMaterial({ 
        size: 1.5, 
        vertexColors: true, 
        sizeAttenuation: false, 
        transparent: true, 
        opacity: 0.9, 
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const starParticles = new THREE.Points(starGeometry, starMaterial);
    scene.add(starParticles);
    return starParticles;
};
const starsGroup = createSpaceBackground();

// ==== 浩瀚深空奇景：超大规模程序化旋涡星系 (Volumetric Galaxy) ====
// 运用十万级粒子与高级缓动构筑无与伦比的深邃星云，兼顾巅峰画质与60FPS极限性能
const generateGalaxy = (offsetX, offsetY, offsetZ, config) => {
    const parameters = Object.assign({
        count: 150000, size: 3.5, radius: 650, branches: 3, spin: 1.6, randomness: 0.6, randomnessPower: 3.5, 
        insideColor: '#ffeebb', outsideColor: '#2255ff', type: 'spiral' 
    }, config);

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);
    const scales = new Float32Array(parameters.count * 1); 

    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    for(let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;
        let x, y, z;
        
        // 采用抛物线分布，让星系极度聚集于星核，形成耀眼的中心曝光
        const radius = Math.pow(Math.random(), 1.2) * parameters.radius; 
        
        if (parameters.type === 'spiral') {
            const spinAngle = radius * parameters.spin * (1 / parameters.radius);
            const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;
            
            // 拉宽星系厚度，减缓指数衰减，使旋臂更像云朵而不是锋利的丝带
            const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
            const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius * 0.4; 
            const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
            
            // 20% 的星辰随机散落在整个星盘，用于“拓宽”星系，填补旋臂间的绝对空白，模拟图1的网状星系感
            if (Math.random() < 0.25) {
                const angle = Math.random() * Math.PI * 2;
                x = Math.cos(angle) * radius + randomX;
                z = Math.sin(angle) * radius + randomZ;
            } else {
                x = Math.cos(branchAngle + spinAngle) * radius + randomX;
                z = Math.sin(branchAngle + spinAngle) * radius + randomZ;
            }
            y = randomY;
        } else if (parameters.type === 'sombrero') {
            const angle = Math.random() * Math.PI * 2;
            if (Math.random() < 0.35) { // spherical bright core
                const r = Math.pow(Math.random(), 2.5) * parameters.radius * 0.35;
                const phi = Math.acos((Math.random() * 2) - 1);
                x = r * Math.sin(phi) * Math.cos(angle);
                y = r * Math.sin(phi) * Math.sin(angle);
                z = r * Math.cos(phi);
            } else { // wide ultra flat disk
                const r = parameters.radius * 0.1 + Math.pow(Math.random(), 1.2) * parameters.radius * 0.9;
                const randomX = (Math.random() - 0.5) * r * parameters.randomness * 0.15;
                const randomY = (Math.random() - 0.5) * r * parameters.randomness * 0.02; // very flat
                const randomZ = (Math.random() - 0.5) * r * parameters.randomness * 0.15;
                x = Math.cos(angle) * r + randomX;
                y = randomY;
                z = Math.sin(angle) * r + randomZ;
            }
        }

        positions[i3] = x; positions[i3 + 1] = y; positions[i3 + 2] = z;

        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, radius / parameters.radius);
        
        if (parameters.type === 'sombrero') { // Add dark dust lane
            const diskDist = Math.sqrt(x*x + z*z);
            if (diskDist > parameters.radius * 0.45 && Math.abs(y) < 6) mixedColor.lerp(new THREE.Color('#000000'), 0.88);
        } else {
            // 增加色彩杂色：深红/粉紫/蓝色，让星云更具层次，类似网图的云雾
            const randColor = Math.random();
            if (randColor > 0.85) mixedColor.lerp(new THREE.Color(0xff4477), 0.6); 
            else if (randColor > 0.70) mixedColor.lerp(new THREE.Color(0x2288ff), 0.6);
        }

        colors[i3] = mixedColor.r; colors[i3 + 1] = mixedColor.g; colors[i3 + 2] = mixedColor.b;
        scales[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

    const material = new THREE.ShaderMaterial({
        depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true, transparent: true,
        vertexShader: `
            attribute float aScale; varying vec3 vColor;
            void main() {
                vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                vec4 viewPosition = viewMatrix * modelPosition;
                gl_Position = projectionMatrix * viewPosition;
                gl_PointSize = ${parameters.size.toFixed(1)} * aScale * (1000.0 / - viewPosition.z);
                vColor = color;
            }
        `,
        // 指数调降到2.0，让粒子更“蓬松”，更易于融合出连续的星云薄纱效果
        fragmentShader: `varying vec3 vColor; void main() { float s = pow(1.0 - distance(gl_PointCoord, vec2(0.5)), 2.0); gl_FragColor = vec4(vColor, s); }`
    });

    const galaxy = new THREE.Points(geometry, material);
    galaxy.position.set(offsetX, offsetY, offsetZ);
    galaxy.rotation.x = Math.PI / 6;
    galaxy.rotation.z = Math.PI / 12;
    scene.add(galaxy);
    return galaxy;
};

// 放置极高规格的壮观星系群 (利用 Frustum Culling，渲染开销依然可控)
const galaxiesList = [];
galaxiesList.push(generateGalaxy(4500, 1500, -6500, {})); // Andromeda
// 重制版银河系，参照写实螺旋：数量增加、4个旋臂交叉缠绕、高旋转角度形成密集的中央长带，提升离散度融合边缘、粒子更大导致星云感更好
galaxiesList.push(generateGalaxy(-6000, 500, 4500, { count: 200000, radius: 950, branches: 4, insideColor: '#ffe8a0', outsideColor: '#2b5cff', spin: 2.0, randomness: 0.9, randomnessPower: 2.2, size: 5.0 })); 
galaxiesList.push(generateGalaxy(-3000, -2500, -7000, { count: 160000, radius: 850, insideColor: '#ffffff', outsideColor: '#ffbb88', type: 'sombrero', size: 3.5 })); // Sombrero

// ---- 3. 星球引擎：程序化地貌与太阳风暴着色器 ----

// 生成全细节行星地貌与环形坑（让普通纯色星球拥有类似地球的高清晰地质纹理）
const generatePlanetBumpMap = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 1024, 512);

    // 陨石坑与地貌噪声 (替换为方形绘制极大消除初次生成的卡顿)
    for(let i=0; i<15000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#111111';
        ctx.globalAlpha = Math.random() * 0.08;
        ctx.fillRect(Math.random()*1024, Math.random()*512, Math.random()*4, Math.random()*4);
    }
    // 气态条带叠加（使木星、海王星等体现大气流动感）
    for(let i=0; i<40; i++) {
        const y = Math.random() * 512;
        const h = Math.random() * 20 + 5;
        const gradient = ctx.createLinearGradient(0, y, 0, y+h);
        gradient.addColorStop(0, 'rgba(255,255,255,0)');
        gradient.addColorStop(0.5, `rgba(${Math.random()>0.5?255:0},${Math.random()>0.5?255:0},${Math.random()>0.5?255:0},0.08)`);
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 1.0;
        ctx.fillRect(0, y, 1024, h);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return tex;
};
const proceduralBumpTex = generatePlanetBumpMap();

// 恒星（恒星表面沸腾渲染引擎）支持多颜色定制
const starUniforms = { time: { value: 0 } };
const createStarShaderMat = (baseHex, brightHex, extraHex) => {
    return new THREE.ShaderMaterial({
        uniforms: starUniforms,
        vertexShader: `varying vec3 vPos; void main() { vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `
            uniform float time; varying vec3 vPos;
            vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
            vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
            float snoise(vec3 v){ 
                const vec2 C = vec2(1.0/6.0, 1.0/3.0); const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                vec3 i  = floor(v + dot(v, C.yyy)); vec3 x0 = v - i + dot(i, C.xxx);
                vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g;
                vec3 i1 = min(g.xyz, l.zxy); vec3 i2 = max(g.xyz, l.zxy);
                vec3 x1 = x0 - i1 + C.xxx; vec3 x2 = x0 - i2 + 2.0 * C.xxx; vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
                i = mod(i, 289.0); 
                vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                vec3 ns = (1.0/7.0) * D.wyz - D.xzx; vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
                vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_); vec4 x = x_ *ns.x + ns.yyyy; vec4 y = y_ *ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y); vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw);
                vec4 sh = -step(h, vec4(0.0)); vec4 a0 = b0.xzyw + floor(b0)*2.0 * sh.xxyy + 1.0 * sh.xxyy; 
                vec3 p0 = vec3(a0.xy, h.x); vec3 p1 = vec3(a0.zw, h.y);
                vec3 p2 = vec3(b1.xy + floor(b1.xy)*2.0*sh.zz + sh.zz, h.z); vec3 p3 = vec3(b1.zw + floor(b1.zw)*2.0*sh.ww + sh.ww, h.w);
                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
                p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                return 42.0 * dot(m*m*m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
            }
            void main() {
                float n1 = snoise(vPos * 0.3 + time * 0.4) * 0.5 + 0.5;
                float n2 = snoise(vPos * 1.5 - time * 0.8) * 0.5 + 0.5;
                float fire = (n1 + n2 * 0.5) / 1.5;
                vec3 cBase = vec3(${new THREE.Color(baseHex).r}, ${new THREE.Color(baseHex).g}, ${new THREE.Color(baseHex).b});
                vec3 cBright = vec3(${new THREE.Color(brightHex).r}, ${new THREE.Color(brightHex).g}, ${new THREE.Color(brightHex).b});
                vec3 cExtra = vec3(${new THREE.Color(extraHex).r}, ${new THREE.Color(extraHex).g}, ${new THREE.Color(extraHex).b});
                vec3 finalColor = mix(cBase, cBright, smoothstep(0.1, 0.8, fire));
                finalColor = mix(finalColor, cExtra, smoothstep(0.8, 1.2, fire));
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `
    });
};
const sunShaderMat = createStarShaderMat(0xff1500, 0xffaa00, 0xffffff); // 红橙太阳
const blueStarShaderMat = createStarShaderMat(0x0044ff, 0x44aaff, 0xeeffff); // 湛蓝巨星

// 双星物质虹吸等离子流着色器
const streamUniforms = { time: { value: 0 } };
const plasmaStreamMat = new THREE.ShaderMaterial({
    uniforms: streamUniforms,
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
        uniform float time; varying vec2 vUv;
        void main() { 
            float flow = fract(vUv.x * 2.0 - time * 1.5); 
            float intensity = sin(vUv.x * 3.1415) * pow(flow, 2.0); 
            gl_FragColor = vec4(0.2, 0.6, 1.0, intensity * 2.5); 
        }
    `,
    transparent: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false
});

const solarSystem = new THREE.Group();
scene.add(solarSystem);
const interactableObjects = [];
export const planetsMap = new Map();

// 宇宙奇景：规模宏大的小行星带 (Asteroid Belts - 极致性能的InstancedMesh)
const instancedAsteroidsData = []; // 保存自转与公转数据
const createAsteroidBelt = (innerR, outerR, amount, systemParent, offsetX=0, offsetY=0, offsetZ=0) => {
    const rockGeo = new THREE.DodecahedronGeometry(0.3, 0); // 细分度降为0
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 1.0 }); // 剔除高昂的 BumpMap 提升万倍性能
    const iMesh = new THREE.InstancedMesh(rockGeo, rockMat, amount);
    const dummy = new THREE.Object3D();
    
    for(let i=0; i<amount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = innerR + Math.pow(Math.random(), 1.5) * (outerR - innerR);
        const y = (Math.random() - 0.5) * 8 * ((outerR - r) / (outerR - innerR) + 0.2);
        dummy.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
        dummy.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
        const scale = Math.random() * 1.5 + 0.5; // 放大小行星体积以补偿总数量的减少
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        iMesh.setMatrixAt(i, dummy.matrix);
    }
    
    const container = new THREE.Group();
    container.position.set(offsetX, offsetY, offsetZ);
    container.add(iMesh);
    systemParent.add(container);
    instancedAsteroidsData.push({ container: container, speed: 0.0005 - Math.random() * 0.0002 });
};

// 遍历生成星系天体
planetsData.forEach(data => {
    const geometry = new THREE.SphereGeometry(data.radius, 64, 64);
    let material;
    
    if (data.isBlackHole || data.isPulsar) {
        material = new THREE.MeshBasicMaterial({ color: 0x000000 }); 
    } else if (data.isGalaxyCenter) {
        // 关键修复：加入 depthWrite: false 防止这颗隐形的碰撞检测球遮挡星系的透明发光粒子
        material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }); 
    } else if (data.isStar && data.isDonor) {
        material = blueStarShaderMat; // 湛蓝巨星
    } else if (data.isStar && data.textures) {
        material = new THREE.MeshBasicMaterial({ map: textureLoader.load(data.textures.map), color: 0xffffdd }); 
    } else if (data.isStar) {
        material = sunShaderMat; // 兼容备用方案
    } else if (data.textures && data.id === 'earth') {
        material = new THREE.MeshPhongMaterial({
            map: textureLoader.load(data.textures.map),
            bumpMap: textureLoader.load(data.textures.bumpMap), bumpScale: 0.05,
            specularMap: textureLoader.load(data.textures.waterMap), specular: new THREE.Color('grey'), shininess: 40
        });
    } else if (data.textures) {
        material = new THREE.MeshStandardMaterial({
            map: textureLoader.load(data.textures.map), roughness: 0.7, metalness: 0.1
        });
        if(data.textures.bumpMap) { material.bumpMap = textureLoader.load(data.textures.bumpMap); material.bumpScale = 0.05; }
    } else {
        // 利用程序化纹理赋予其他类地/气态行星地质细节
        material = new THREE.MeshStandardMaterial({
            color: data.color, roughness: 0.65, metalness: 0.1, 
            bumpMap: proceduralBumpTex, bumpScale: 0.15 
        });
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = data;

    // 地外云层
    if (data.textures?.clouds) {
        const cloudMesh = new THREE.Mesh(
            new THREE.SphereGeometry(data.radius * 1.015, 64, 64),
            new THREE.MeshStandardMaterial({
                map: textureLoader.load(data.textures.clouds), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
            })
        );
        mesh.add(cloudMesh);
        mesh.userData.cloudMesh = cloudMesh; 
    }

    // 星环
    if (data.hasRings) {
        const ringMatConfig = { color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.9 };
        if (data.textures && data.textures.ringMap) {
            ringMatConfig.map = textureLoader.load(data.textures.ringMap);
        } else {
            ringMatConfig.color = 0xcca988;
            ringMatConfig.bumpMap = proceduralBumpTex;
            ringMatConfig.roughness = 0.8;
            ringMatConfig.opacity = 0.8;
        }
        const rings = new THREE.Mesh(
            new THREE.RingGeometry(data.radius * 1.5, data.radius * 2.8, 128),
            new THREE.MeshStandardMaterial(ringMatConfig)
        );
        // 对于THREE.RingGeometry使用贴图时，UV会映射成一个正方形，导致直线条纹贴图无法成环
        // 为了简便并保持完美环形视觉，如果用普通条纹贴图，我们需要手写极坐标UV贴图或者通过自定义Shader。
        // 为了保证性能，我们依旧使用原生Material，只需调整UV数据：
        if (data.textures && data.textures.ringMap) {
            const pos = rings.geometry.attributes.position;
            const uvs = rings.geometry.attributes.uv;
            for(let i=0; i<uvs.count; i++) {
                const length = new THREE.Vector2(pos.getX(i), pos.getY(i)).length();
                const radiusNorm = (length - (data.radius * 1.5)) / (data.radius * 2.8 - data.radius * 1.5);
                // 大部分星环贴图是水平长条形，左边是内环，右边是外环
                uvs.setXY(i, radiusNorm, 0.5); 
            }
            rings.geometry.attributes.uv.needsUpdate = true;
        }
        
        rings.rotation.x = Math.PI / 2.2; 
        mesh.add(rings);
    }

    // 大气与光晕
    if (data.atmoColor || data.isStar) {
        const atmosphere = new THREE.Mesh(
            new THREE.SphereGeometry(data.isStar ? data.radius * 1.4 : data.radius * 1.25, 64, 64),
            new THREE.ShaderMaterial({
                vertexShader: `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
                fragmentShader: data.isStar ? `
                    varying vec3 vNormal; void main() { float int = 1.05 - dot(vNormal, vec3(0,0,1)); gl_FragColor = vec4(vec3(${new THREE.Color(data.atmoColor||data.color).r}, ${new THREE.Color(data.atmoColor||data.color).g}, ${new THREE.Color(data.atmoColor||data.color).b}) * pow(int, 1.5), 1.0); }
                ` : `
                    varying vec3 vNormal; void main() { float int = pow(0.65 - dot(vNormal, vec3(0,0,1)), 3.5); gl_FragColor = vec4(${new THREE.Color(data.atmoColor||data.color).r}, ${new THREE.Color(data.atmoColor||data.color).g}, ${new THREE.Color(data.atmoColor||data.color).b}, 1.0) * int; }
                `,
                blending: THREE.AdditiveBlending, side: THREE.BackSide, transparent: true, depthWrite: false
            })
        );
        mesh.add(atmosphere);
    }
    
    const ringMesh = new THREE.Mesh(
        new THREE.RingGeometry(data.radius * 1.35, data.radius * 1.4, 64),
        new THREE.MeshBasicMaterial({ color: 0x00e5ff, side: THREE.DoubleSide, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    ringMesh.rotation.x = Math.PI / 2;
    mesh.add(ringMesh);
    mesh.userData.ringMesh = ringMesh;

    // ======= 史诗级黑洞专属吸积盘与引力透镜 ========
    if (data.isBlackHole) {
        const diskGeom = new THREE.RingGeometry(data.radius * 1.6, data.radius * 4.5, 256);
        const diskMat = new THREE.ShaderMaterial({
            vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
            fragmentShader: `
                varying vec2 vUv;
                void main() {
                    float r = distance(vUv, vec2(0.5));
                    float normalizedR = clamp((r - 0.177) / (0.5 - 0.177), 0.0, 1.0); // mapped inner to outer
                    float glow = pow(1.0 - normalizedR, 1.8); 
                    float intenseRing = smoothstep(0.0, 0.1, normalizedR) * smoothstep(0.25, 0.05, normalizedR);
                    vec3 color = vec3(1.0, 0.5, 0.1) * glow + vec3(1.0, 0.9, 0.5) * intenseRing * 2.5;
                    gl_FragColor = vec4(color, glow);
                }
            `,
            side: THREE.DoubleSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
        });
        const disk = new THREE.Mesh(diskGeom, diskMat);
        disk.rotation.x = Math.PI / 2.1; 
        mesh.add(disk);
        
        const bendMat = new THREE.ShaderMaterial({
            vertexShader: `varying vec3 vNormal; varying vec3 vViewDir; void main() { vNormal = normalize(normalMatrix * normal); vViewDir = normalize(- (modelViewMatrix * vec4(position, 1.0)).xyz); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
            fragmentShader: `varying vec3 vNormal; varying vec3 vViewDir; void main() { float rim = pow(1.0 - abs(dot(vNormal, vViewDir)), 8.0); gl_FragColor = vec4(vec3(1.0, 0.7, 0.3) * rim * 1.8, rim); }`,
            blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, side: THREE.FrontSide
        });
        mesh.add(new THREE.Mesh(new THREE.SphereGeometry(data.radius * 2.6, 64, 64), bendMat));
        mesh.add(new THREE.PointLight(0xffaa55, 3.5, 0, 0)); // 剔除物理衰减，防止米勒星过曝
    }

    // ======= 奇景 2: 脉冲星双子星物质虹吸及光束喷流 ========
    if (data.isPulsar) {
        const jetGeo = new THREE.CylinderGeometry(0.1, 4.5, 200, 32, 1, true);
        const jetMat = new THREE.ShaderMaterial({
            vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
            fragmentShader: `varying vec2 vUv; void main() { float fade = pow(vUv.y, 3.0); gl_FragColor = vec4(0.2, 0.8, 1.0, 1.0 - fade); }`,
            transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
        });
        const jetTop = new THREE.Mesh(jetGeo, jetMat); jetTop.position.y = 100;
        const jetBottom = new THREE.Mesh(jetGeo, jetMat); jetBottom.rotation.x = Math.PI; jetBottom.position.y = -100;
        mesh.add(jetTop); mesh.add(jetBottom);

        const accretionDisk = new THREE.Mesh(
            new THREE.RingGeometry(data.radius * 1.5, data.radius * 4, 128),
            new THREE.MeshBasicMaterial({ color: 0x0077ff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })
        );
        accretionDisk.rotation.x = Math.PI / 2; mesh.add(accretionDisk);
        mesh.add(new THREE.PointLight(0x0088ff, 4.0, 0, 0)); // 脉冲致命蓝光
    }

    // 轨道分配
    const orbitGroup = new THREE.Group();
    if (data.isSatelliteOf) {
        const parentInfo = planetsMap.get(data.isSatelliteOf);
        if (parentInfo) {
            mesh.position.x = data.distance;
            orbitGroup.add(mesh);
            parentInfo.mesh.add(orbitGroup); 
            planetsMap.set(data.id, { mesh, orbitGroup, data });
        }
    } else {
        mesh.position.x = data.distance;
        orbitGroup.add(mesh);
        
        if (data.isDonor) {
            const curve = new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(data.distance - data.radius, 0, 0), 
                new THREE.Vector3(data.distance * 0.5, 0, data.distance * 0.4), 
                new THREE.Vector3(6, 0, 0)
            );
            const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 1.5, 12, false), plasmaStreamMat);
            orbitGroup.add(tube);
        }

        if (data.systemOffset) orbitGroup.position.set(data.systemOffset[0], data.systemOffset[1], data.systemOffset[2]);
        
        if (data.isGalaxyCenter) {
            scene.add(orbitGroup); // 必须在顶级场景系，避免被下面 solarSystem 的倾斜干扰导致物理拾取球错位
        } else {
            solarSystem.add(orbitGroup);
        }

        planetsMap.set(data.id, { mesh, orbitGroup, data });
    }
    interactableObjects.push(mesh);
});

// 构建太阳系的小行星带 (火星到木星之间)
createAsteroidBelt(60, 75, 4000, solarSystem);
// 构建黑洞系统的陨石环
createAsteroidBelt(28, 35, 2000, solarSystem, 500, 100, -800);

solarSystem.rotation.x = Math.PI / 18; 


// ---- 4. 镜头跟踪系统 ----
let trackedMesh = null;
let isAnimatingToPlanet = false;
let trackingProxy = { ox: 0, oy: 0, oz: 0, lx: 0, ly: 0, lz: 0 };
let previousWorldPos = new THREE.Vector3();

export const trackPlanetById = (id) => {
    const targetPlanet = planetsMap.get(id);
    if (!targetPlanet || !window.gsap) return;
    trackedMesh = targetPlanet.mesh;
    isAnimatingToPlanet = true;
    
    const r = targetPlanet.data.radius;
    const currentPos = new THREE.Vector3();
    trackedMesh.getWorldPosition(currentPos);
    previousWorldPos.copy(currentPos);
    
    const startOffset = camera.position.clone().sub(currentPos);
    const endOffset = new THREE.Vector3(r * 4, r * 1.5, r * 5); 
    const startLook = controls.target.clone().sub(currentPos);
    
    // 动态跳跃时间自适应系统
    const dist = camera.position.distanceTo(currentPos);
    let jumpDuration = Math.max(2.5, dist / 250); 
    if(jumpDuration > 6.0) jumpDuration = 6.0;

    if (dist > 1000 && window.gsap) {
        warpEngine.active = true;
        warpEngine.mesh.visible = true;
        gsap.to(warpEngine.mat, { opacity: 0.9, duration: 0.5, yoyo: true, repeat: 1, repeatDelay: jumpDuration - 1.0 });
        setTimeout(() => { warpEngine.active = false; warpEngine.mesh.visible = false; }, jumpDuration * 1000 + 500); 
    }

    trackingProxy = { ox: startOffset.x, oy: startOffset.y, oz: startOffset.z, lx: startLook.x, ly: startLook.y, lz: startLook.z };
    gsap.killTweensOf(trackingProxy);
    gsap.to(trackingProxy, {
        ox: endOffset.x, oy: endOffset.y, oz: endOffset.z, lx: 0, ly: 0, lz: 0,
        duration: jumpDuration, ease: 'power3.inOut', onComplete: () => isAnimatingToPlanet = false
    });
};


// ---- 5. UI 事件绑定机制 ----
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredObject = null;
let currentPulseTween = null;

window.addEventListener('mousemove', (e) => { mouse.x = (e.clientX / window.innerWidth) * 2 - 1; mouse.y = -(e.clientY / window.innerHeight) * 2 + 1; });
document.querySelector('.explore-btn').addEventListener('click', () => { if (hoveredObject) trackPlanetById(hoveredObject.userData.id); });
initSPA_Navigation(trackPlanetById, (enabled) => controls.enabled = enabled);


// ---- 6. 随机慢速流星事件引擎 ----
const meteors = [];
const createMeteor = () => {
    const startPoint = camera.position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 600, (Math.random() - 0.5) * 300 + 100, (Math.random() - 0.5) * -400));
    const geometry = new THREE.CylinderGeometry(0.1, 0.4, 40, 6);
    geometry.rotateX(Math.PI / 2); 
    const material = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0x00e5ff : 0xffcc44, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
    const meteor = new THREE.Mesh(geometry, material);
    meteor.position.copy(startPoint);
    // 减缓流星速度，变得优雅和神秘
    const velocity = new THREE.Vector3((Math.random() - 0.5) * 6, Math.random() * -3 - 1, (Math.random() - 0.5) * 6).normalize().multiplyScalar(3.5 + Math.random() * 2);
    meteor.lookAt(meteor.position.clone().add(velocity)); 
    scene.add(meteor);
    meteors.push({ mesh: meteor, velocity, life: 350, maxLife: 350 }); // 增加生命周期
};


// ---- 7. 核心渲染大循环 ----
const clock = new THREE.Clock();
const animate = () => {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    starUniforms.time.value = time; // 驱动太阳风暴
    streamUniforms.time.value = time; // 驱动伴星虹吸
    starsGroup.rotation.y = time * 0.002; // 让背景星系极缓慢流转
    
    // 让所有的无尽星空星系群拥有缓慢独特的自转
    galaxiesList.forEach((g, idx) => { g.rotation.y -= (0.0003 + idx * 0.0001); });

    instancedAsteroidsData.forEach(belt => belt.container.rotation.y += belt.speed);

    planetsMap.forEach((obj) => {
        obj.mesh.rotation.y += obj.data.rotationSpeed;
        if (obj.data.distance > 0 && !obj.data.isSatelliteOf) obj.orbitGroup.rotation.y += obj.data.speed;
        if (obj.mesh.userData.cloudMesh) obj.mesh.userData.cloudMesh.rotation.y += obj.data.rotationSpeed * 0.5; 
        if (obj.mesh.userData.ringMesh) obj.mesh.userData.ringMesh.lookAt(camera.position); 
    });

    if (Math.random() < 0.008) createMeteor(); 
    for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.mesh.position.add(m.velocity);
        m.life--;
        m.mesh.material.opacity = Math.sin((m.life / m.maxLife) * Math.PI) * 0.85; 
        if (m.life <= 0) {
            scene.remove(m.mesh); m.mesh.geometry.dispose(); m.mesh.material.dispose(); meteors.splice(i, 1);
        }
    }

    if (trackedMesh) {
        const currentWorldPos = new THREE.Vector3();
        trackedMesh.getWorldPosition(currentWorldPos);
        if (isAnimatingToPlanet) {
            camera.position.set(currentWorldPos.x + trackingProxy.ox, currentWorldPos.y + trackingProxy.oy, currentWorldPos.z + trackingProxy.oz);
            controls.target.set(currentWorldPos.x + trackingProxy.lx, currentWorldPos.y + trackingProxy.ly, currentWorldPos.z + trackingProxy.lz);
        } else {
            const delta = new THREE.Vector3().subVectors(currentWorldPos, previousWorldPos);
            camera.position.add(delta); controls.target.add(delta);
        }
        previousWorldPos.copy(currentWorldPos);
    }

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableObjects, false);
    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (hoveredObject !== object) {
            if (hoveredObject) resetHover(hoveredObject);
            hoveredObject = object; document.body.style.cursor = 'pointer';
            if (hoveredObject.userData.ringMesh && window.gsap) {
                gsap.killTweensOf([hoveredObject.scale, hoveredObject.userData.ringMesh.material]);
                gsap.to(hoveredObject.scale, { x: 1.05, y: 1.05, z: 1.05, duration: 0.5, ease: 'back.out(2)' });
                gsap.to(hoveredObject.userData.ringMesh.material, { opacity: 0.8, duration: 0.4 });
                currentPulseTween = gsap.to(hoveredObject.userData.ringMesh.scale, { x: 1.15, y: 1.15, z: 1.15, repeat: -1, yoyo: true, duration: 1.5, ease: "sine.inOut" });
            }
            updateHoverUI(hoveredObject.userData);
        }
    } else {
        if (hoveredObject) {
            resetHover(hoveredObject); hoveredObject = null; document.body.style.cursor = 'crosshair'; hideHoverUI();
        }
    }
    controls.update(); 
    
    // 渲染摄像机跟随超光速流光
    if (warpEngine.active) {
        const p = warpEngine.mesh.geometry.attributes.position.array;
        for(let i=0; i<1500; i++) {
            p[i*6+2] += 250; 
            p[i*6+5] += 250; 
            if (p[i*6+2] > 200) { 
                p[i*6+2] -= 3500;
                p[i*6+5] -= 3500;
            }
        }
        warpEngine.mesh.geometry.attributes.position.needsUpdate = true;
    }

    // 采用电影级后期泛光叠加渲染管线替代原生 Renderer
    composer.render(); 
};

const resetHover = (obj) => {
    if(!window.gsap) return;
    gsap.killTweensOf(obj.scale); gsap.to(obj.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
    if (obj.userData.ringMesh) {
        gsap.killTweensOf(obj.userData.ringMesh.material); gsap.to(obj.userData.ringMesh.material, { opacity: 0, duration: 0.3 });
        if(currentPulseTween) { currentPulseTween.kill(); currentPulseTween = null; }
        obj.userData.ringMesh.scale.set(1, 1, 1);
    }
};

window.addEventListener('resize', () => { 
    camera.aspect = window.innerWidth / window.innerHeight; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(window.innerWidth, window.innerHeight); 
    composer.setSize(window.innerWidth, window.innerHeight); // 同步后期缩放
});
animate();

if(window.gsap) gsap.from(camera.position, { x: 100, y: 80, z: 200, duration: 4, ease: "power3.out" });
