let cols, rows;  // 定义网格的列和行
let resolution = 10;  // 定义每个网格单元的大小
let flowfield;  // 存储每个网格点的向量
let particles = [];  // 存储所有粒子的数组
let noiseScale = 0.05;  // 噪声函数的缩放系数，影响噪声的粒度，这个就是那个洋流的效果的关键

// 初始化函数，设置画布和粒子
function setup() {
    createCanvas(windowWidth, windowHeight);  // 创建一个画布，尺寸为浏览器窗口大小
    cols = floor(width / resolution);  // 计算列数
    rows = floor(height / resolution);  // 计算行数
    flowfield = new Array(cols * rows);  // 创建一个数组来存储每个网格点的向量
    noiseDetail(40, 0.5);  // 设置噪声的细节级别

    for (let i = 0; i < 10000; i++) {  // 创建1000个粒子，要注意，太多了的话会运行不动
        particles.push(new Particle(random(width), random(height)));  // 每个粒子在随机位置初始化
    }
    background(0);  // 设置背景色为黑色
}

// 每帧执行一次，更新画布上的内容
function draw() {
    // 更新流场向量
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            let index = x + y * cols;  // 计算当前网格的索引
            let angle = noise(x * noiseScale, y * noiseScale, frameCount * 0.01) * TWO_PI * 4;  // 根据噪声函数生成角度
            flowfield[index] = p5.Vector.fromAngle(angle);  // 根据角度创建向量
            flowfield[index].setMag(0.1);  // 设置向量的大小
        }
    }

    // 创建半透明背景以实现拖尾效果
    fill(0, 10);  // 设置填充色为半透明的黑色
    rect(0, 0, width, height);  // 绘制覆盖整个画布的矩形

    // 动态根据噪声函数的结果添加或删除粒子
    if (particles.length < 1000) {
        let newParticle = new Particle(random(width), random(height));
        if (noise(newParticle.pos.x * noiseScale, newParticle.pos.y * noiseScale) > 0.5) {
            particles.push(newParticle);  // 如果噪声值较高，则添加新粒子
        }
    }
    
    // 随机删除粒子
    if (particles.length > 0 && random(1) < 0.05) {
        particles.splice(floor(random(particles.length)), 1);  // 随机删除一个粒子
    }

    // 更新所有粒子的状态
    for (let i = 0; i < particles.length; i++) {
        particles[i].follow(flowfield);  // 粒子根据流场移动
        particles[i].update();  // 更新粒子状态
        particles[i].show();  // 绘制粒子
        particles[i].edges();  // 处理粒子边缘行为
    }
}

// 粒子类定义
class Particle {
    constructor(x, y) {
        this.pos = createVector(x, y);  // 粒子的位置
        this.vel = createVector(0, 0);  // 粒子的速度
        this.acc = createVector(0, 0);  // 粒子的加速度
        this.maxSpeed = 2;  // 粒子的最大速度
        this.hue = random(200,150,50);  // 随机生成粒子颜色的色调
    }

follow(vectors) {
    let x = floor(this.pos.x / resolution); // 计算粒子当前位置对应的流场网格的列
    let y = floor(this.pos.y / resolution); // 计算粒子当前位置对应的流场网格的行
    let index = x + y * cols; // 计算在流场数组中的索引位置
    let force = vectors[index]; // 获取该位置的流场向量
    this.applyForce(force); // 将流场向量作为力应用到粒子上
}

  applyForce(force) {
    this.acc.add(force); // 将外部力加到粒子的加速度上
}

  update() {
    this.vel.add(this.acc); // 加速度影响速度
    this.vel.limit(this.maxSpeed); // 限制速度以防止粒子速度过快
    this.pos.add(this.vel); // 速度改变位置
    this.acc.mult(0); // 清除加速度，为下一帧计算做准备
}

  show() {
    colorMode(HSB); // 设置颜色模式为HSB
    stroke(this.hue, 255, 255, 50); // 设置绘制颜色，使用HSL颜色模型，其中颜色随机
    strokeWeight(2); // 设置线宽，也就是粒子的大小
    point(this.pos.x, this.pos.y); // 在粒子的位置绘制一个点
}

  edges() {
    if (this.pos.x > width) this.pos.x = 0; // 如果粒子移出右边界，从左边界重新进入
    if (this.pos.x < 0) this.pos.x = width; // 如果粒子移出左边界，从右边界重新进入
    if (this.pos.y > height) this.pos.y = 0; // 如果粒子移出下边界，从上边界重新进入
    if (this.pos.y < 0) this.pos.y = height; // 如果粒子移出上边界，从下边界重新进入
}
}
