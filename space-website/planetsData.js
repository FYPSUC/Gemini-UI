export const TEXTURES = {
    earth: {
        map: 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
        bumpMap: 'https://unpkg.com/three-globe/example/img/earth-topology.png',
        waterMap: 'https://unpkg.com/three-globe/example/img/earth-water.png',
        clouds: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
    },
    moon: {
        map: 'https://unpkg.com/three-globe/example/img/earth-water.png', // backup texture for moon until requested
    },
    mercury: { map: 'textures/mercury.jpg' },
    venus: { map: 'textures/venus.jpg' },
    earth: {
        map: 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
        bumpMap: 'https://unpkg.com/three-globe/example/img/earth-topology.png',
        waterMap: 'https://unpkg.com/three-globe/example/img/earth-water.png',
        clouds: 'https://unpkg.com/three-globe/example/img/earth-clouds.png'
    },
    mars: {
        map: 'textures/mars.jpg',
    },
    jupiter: { map: 'textures/jupiter.jpg' },
    saturn: { map: 'textures/saturn.jpg', ringMap: 'textures/saturn_ring.png' },
    neptune: { map: 'textures/neptune.jpg' },
    sun: { map: 'textures/sun.jpg' }
};

export const planetsData = [
    {
        name: 'Sun',
        zhName: '太阳 - Sun',
        id: 'sun',
        radius: 8,
        distance: 0,
        speed: 0,
        rotationSpeed: 0.001,
        desc: '太阳系的中心恒星，是一颗黄矮星。它提供了太阳系绝大部分的能量。',
        mass: '1.989 × 10³⁰ kg',
        gravity: '274 m/s²',
        color: 0xffaa00,
        isStar: true,
        atmoColor: 0xff4400,
        textures: TEXTURES.sun
    },
    {
        name: 'Mercury',
        zhName: '水星 - Mercury',
        id: 'mercury',
        radius: 1.2,
        distance: 18,
        speed: 0.004,
        rotationSpeed: 0.002,
        desc: '距离太阳最近的行星，表面布满环形山，温差极大。',
        mass: '3.30 × 10²³ kg',
        gravity: '3.7 m/s²',
        color: 0x888888,
        textures: TEXTURES.mercury
    },
    {
        name: 'Venus',
        zhName: '金星 - Venus',
        id: 'venus',
        radius: 3,
        distance: 28,
        speed: 0.003,
        rotationSpeed: 0.0015,
        desc: '拥有浓厚温室气体大气层的类地行星，表面温度可达约462°C。',
        mass: '4.87 × 10²⁴ kg',
        gravity: '8.87 m/s²',
        color: 0xe3bb76,
        atmoColor: 0xffaa00,
        textures: TEXTURES.venus
    },
    {
        name: 'Earth',
        zhName: '地球 - Earth',
        id: 'earth',
        radius: 3.5,
        distance: 42, 
        speed: 0.002,
        rotationSpeed: 0.002,
        desc: '被称为"蓝色弹珠"，是目前已知唯一孕育生命的星球。拥有丰富的液态水、含氧大气层以及强烈的磁场。',
        mass: '5.97 × 10²⁴ kg',
        gravity: '9.807 m/s²',
        atmoColor: 0x0088ff,
        textures: TEXTURES.earth
    },
    {
        name: 'Moon',
        zhName: '月球 - Luna',
        id: 'moon',
        radius: 0.9,
        distance: 7, 
        speed: 0.01,
        rotationSpeed: 0.001,
        desc: '地球唯一的天然卫星。由于同步自转，永远只以一面朝向地球。上面布满了陨石撞击形成的环形山。',
        mass: '7.34 × 10²² kg',
        gravity: '1.62 m/s²',
        isSatelliteOf: 'earth',
        textures: TEXTURES.moon
    },
    {
        name: 'Mars',
        zhName: '火星 - Mars',
        id: 'mars',
        radius: 1.8,
        distance: 55,
        speed: 0.0015,
        rotationSpeed: 0.0018,
        desc: '由于地表密布氧化铁而呈现红色。拥有太阳系最高山峰"奥林帕斯山"和最大峡谷"水手号峡谷"，是人类未来最可能的星际殖民地。',
        mass: '6.39 × 10²³ kg',
        gravity: '3.721 m/s²',
        atmoColor: 0xff3300,
        textures: TEXTURES.mars
    },
    {
        name: 'Jupiter',
        zhName: '木星 - Jupiter',
        id: 'jupiter',
        radius: 6,
        distance: 85,
        speed: 0.0008,
        rotationSpeed: 0.004,
        desc: '太阳系最大的行星，是一颗气态巨行星。其最显著的特征是大红斑——一个存在了数百年的巨大风暴。',
        mass: '1.898 × 10²⁷ kg',
        gravity: '24.79 m/s²',
        color: 0xc88b3a,
        atmoColor: 0xaa6622,
        textures: TEXTURES.jupiter
    },
    {
        name: 'Saturn',
        zhName: '土星 - Saturn',
        id: 'saturn',
        radius: 5,
        distance: 115,
        speed: 0.0005,
        rotationSpeed: 0.0038,
        desc: '太阳系中体积第二大的行星，以其庞大且美丽的冰晶光环系统而闻名遐迩。',
        mass: '5.68 × 10²⁶ kg',
        gravity: '10.44 m/s²',
        color: 0xeaddb9,
        hasRings: true,
        textures: TEXTURES.saturn
    },
    {
        name: 'Neptune',
        zhName: '海王星 - Neptune',
        id: 'neptune',
        radius: 3.8,
        distance: 145,
        speed: 0.0003,
        rotationSpeed: 0.0025,
        desc: '太阳系最遥远的行星，一颗呈现深蓝色的冰巨星，表面肆虐着太阳系中最快的风暴。',
        mass: '1.02 × 10²⁶ kg',
        gravity: '11.15 m/s²',
        color: 0x3366ff,
        atmoColor: 0x2244ff,
        textures: TEXTURES.neptune
    },
    // ============================================
    // 扩展黑洞星系：卡冈图雅 (Gargantua) 独立恒星系统
    // ============================================
    {
        name: 'Gargantua',
        zhName: '黑洞 - Gargantua',
        id: 'blackhole',
        radius: 12, // 深渊本体半径
        distance: 0, 
        systemOffset: [500, 100, -800], // 在宇宙中极其遥远的位置
        speed: 0,
        rotationSpeed: 0.015,
        desc: '一个极度致密的超大质量黑洞。强大的引力使得光都无法逃脱，具有强烈的引力透镜效应，周围环绕着极高温的黄金吸积盘。',
        mass: '1.989 × 10³⁶ kg',
        gravity: '无穷大 / 视界内奇点',
        isBlackHole: true
    },
    {
        name: 'Miller',
        zhName: '米勒星 - Miller',
        id: 'miller',
        radius: 2.5,
        distance: 40,
        speed: 0.005,
        rotationSpeed: 0.002,
        desc: '一颗极其靠近超大质量黑洞的海洋行星。具有数百米的巨浪，由于黑洞引力带来的时间膨胀效应，这里的1小时相当于地球上的7年。',
        mass: '7.82 × 10²⁴ kg',
        gravity: '12.7 m/s²',
        color: 0x225588,
        atmoColor: 0x00aaff,
        isSatelliteOf: 'blackhole' // 受黑洞引力捕获
    },
    {
        name: 'Mann',
        zhName: '曼恩星 - Mann',
        id: 'mann',
        radius: 2.0,
        distance: 65,
        speed: 0.003,
        rotationSpeed: 0.001,
        desc: '一颗寒冷的冰冻星球，地表覆盖着具有欺骗性的氨冰云层，并不太适合人类生存，曾是人类绝望中的伪装灯塔。',
        mass: '4.82 × 10²⁴ kg',
        gravity: '7.8 m/s²',
        color: 0xcccccc,
        atmoColor: 0xffffff,
        isSatelliteOf: 'blackhole'
    },
    // ============================================
    // 扩展深空奇景：双星物质虹吸 (Tidal Disruption Event)
    // ============================================
    {
        name: 'Vampire',
        zhName: '脉冲双星 - Vampire',
        id: 'pulsar',
        radius: 4,
        distance: 0, 
        systemOffset: [-1500, 300, -2000],
        speed: 0,
        rotationSpeed: 0.1, 
        desc: '一颗极其致密且超高速自转的致密中子星。它的超强引力正在残酷地撕裂并吞噬临近的蓝巨星伴星，由于超强的磁场，它在两极爆发出如同利剑般长达光年的璀璨蓝移相对论喷流。',
        mass: '2.8 × 10³⁰ kg',
        gravity: '1.3 × 10¹¹ m/s²',
        isPulsar: true
    },
    {
        name: 'Prey',
        zhName: '受难者 - Prey',
        id: 'donor_star',
        radius: 18,
        distance: 40,
        systemOffset: [-1500, 300, -2000], // 与脉冲星共享物理坐标系
        speed: 0.006, // 围绕脉冲星公转
        rotationSpeed: 0.005,
        desc: '这片暗黑死寂星云中最璀璨的深蓝巨星。由于引力轨道的致命缺陷，它过于靠近脉冲中子星，其表面的高温等离子物质正在被疯狂剥离，形成了一条横跨虚空、无比壮观幽蓝的星际物质虹吸物质桥。',
        mass: '3.5 × 10³¹ kg',
        gravity: '274 m/s²',
        color: 0x4488ff,
        atmoColor: 0x0044ff,
        isStar: true,
        isDonor: true 
    },
    // ============================================
    // 终极性能优化奇景：纯粒子渲染的仙女座旋涡星系 (M31 Andromeda)
    // ============================================
    {
        name: 'Andromeda',
        zhName: '仙女座星系 - M31',
        id: 'andromeda',
        radius: 80, 
        distance: 0,
        systemOffset: [4500, 1500, -6500], 
        speed: 0,
        rotationSpeed: 0, 
        desc: '距离银河系约 250 万光年的庞大旋涡星系。由几千亿颗恒星组成。通过数学指数衰减算法和发光 Additive Blending 构筑，消耗极少性能但如同照片般惊艳。',
        mass: '3 × 10⁴² kg',
        gravity: '整体星系引力场',
        isGalaxyCenter: true
    },
    {
        name: 'Milky Way',
        zhName: '银河系中心 (还原) - Milky Way',
        id: 'milkyway',
        radius: 80,
        distance: 0,
        systemOffset: [-6000, 500, 4500], // 另一片隔离宇宙
        speed: 0,
        rotationSpeed: 0,
        desc: '拥有数千亿颗恒星的棒旋星系，太阳系曾经的故土。此节点模拟了俯瞰整个银河系光辉的上帝视角，中心拥有极其夺目的黄色凸起核球，和向外延展的蓝色旋臂。',
        mass: '2.3 × 10⁴² kg',
        gravity: '整体星系引力场',
        isGalaxyCenter: true
    },
    {
        name: 'Sombrero',
        zhName: '草帽星系 - M104',
        id: 'sombrero',
        radius: 80,
        distance: 0,
        systemOffset: [-3000, -2500, -7000], // 隔离在底部深空
        speed: 0,
        rotationSpeed: 0,
        desc: '这是一个特征极其显著的无棒螺旋星系。它拥有一个非常明亮庞大的全光谱发光核球，并且赤道平面上有着一圈由宇宙冷暗尘埃构成的极黑物质环带，形状宛如一顶墨西哥草帽。',
        mass: '1.6 × 10⁴² kg',
        gravity: '整体星系引力场',
        isGalaxyCenter: true
    }
];
