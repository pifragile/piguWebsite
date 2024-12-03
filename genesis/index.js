let pg;
let cs = 1000;

let hueBase;
let hueStep;

let hue;
let depth;
let spread;
function drawArt(r) {
    pg.clear();
    let b = new Box(0, 0, cs, cs);

    pg.background(99);
    let [c, c2] = getColors();
    pg.noStroke();
    pg.drawingContext.globalAlpha = 1;
    fillGradient(getCircleGradient(b.c.x, b.c.y, b.w * r * 2, [c, c2]));
    b.circle(r * 2);
    pg.noStroke();

    pg.drawingContext.globalAlpha = 1;
    pg.drawingContext.globalCompositeOperation = "hard-light";
    makeFleck(b, r, 0, 0.4, 0, 1, depth);
}

function makeFleck(b, r, rMin, rAdd, circMin, circAdd, depth) {
    for (let i = 0; i < depth; i++) {
        let [c, c2] = getColors();

        let a = (random() * circAdd + circMin) * TWO_PI;
        let s = (random() * rAdd + rMin) * r * b.w;
        let p = createVector(b.c.x + cos(a) * s, b.c.y + sin(a) * s);
        let newD = r * spread * b.w * random();
        fillGradient(getCircleGradient(p.x, p.y, newD * 0.5, [c, c2]));
        pg.circle(p.x, p.y, newD);
    }
}

function getColors() {
    c = pg.color(hue, 100, 100);
    //c = pg.color(random() * hueShift + hueBase, 100, 100)
    hue = (hue + hueStep) % 360;
    pg.colorMode(RGB);
    c2 = pg.color(c.levels);
    c2.setAlpha(0);
    pg.colorMode(HSB);
    return [c, c2];
}
function getCircleGradient(x, y, r, steps) {
    gradient = pg.drawingContext.createRadialGradient(x, y, 0, x, y, r);

    s = 1 / (steps.length - 1);
    for (let i = 0; i < steps.length; i++) {
        gradient.addColorStop(i * s, steps[i]);
    }

    return gradient;
}

function setup() {
    is = min(windowHeight, windowWidth);
    createCanvas(is, is);
    pg = createGraphics(cs, cs);
    pg.colorMode(HSB);
    pg.pixelDensity(1);
}

function setImage() {
    clear();
    is = min(windowHeight, windowWidth);
    resizeCanvas(is, is);
    copy(pg, 0, 0, cs, cs, 0, 0, is, is);
}

function draw() {
    hueBase = m0 * 360;
    hueStep = m1 * 1.5 + 1;
    hue = hueBase;
    depth = 70;
    spread = m3 * 1 + 2;
    randomSeed(m2 * 9999999);

    pg.clear();
    clear();

    noLoop();
    drawArt(m4 * 0.4 + 0.1);
    setImage();
}

function keyPressed() {
    if (keyCode === LEFT_ARROW) {
        save();
    }
}

function windowResized() {
    setImage();
}

function fillGradient(g) {
    pg.drawingContext.fillStyle = g;
}

Box = class {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.c = createVector(x + w * 0.5, y + h * 0.5);
        this.tl = createVector(x, y);
        this.tr = createVector(x + w, y);
        this.br = createVector(x + w, y + h);
        this.bl = createVector(x, y + h);
        this.tc = createVector(x + w * 0.5, y);
        this.rc = createVector(x + w, y + h * 0.5);
        this.bc = createVector(x + w * 0.5, y + h);
        this.lc = createVector(x, y + h * 0.5);
    }
    gridify(gridWidth, gridHeight) {
        let grid = [];
        let boxWidth = this.w / gridWidth;
        let boxHeight = this.h / gridHeight;

        for (let i = 0; i < gridWidth; i++) {
            grid.push([]);
            for (let j = 0; j < gridHeight; j++) {
                grid[i].push(
                    new Box(
                        this.x + boxWidth * i,
                        this.y + boxHeight * j,
                        boxWidth,
                        boxHeight
                    )
                );
            }
        }
        return grid;
    }
    randomPoint() {
        return createVector(
            this.x + random() * this.w,
            this.y + random() * this.h
        );
    }

    coords(xRatio, yRatio) {
        return [this.xc(xRatio), this.yc(yRatio)];
    }

    xc(ratio) {
        return this.x + this.w * ratio;
    }

    yc(ratio) {
        return this.y + this.h * ratio;
    }

    mirrorH() {
        let img = pg.get(this.x, this.y, this.w, this.h);
        pg.push();
        pg.scale(-1, 1);
        pg.translate(-(2 * this.x + this.w), 0);
        pg.image(img, this.x, this.y, this.w, this.h);
        pg.pop();
    }

    mirrorV() {
        let img = pg.get(this.x, this.y, this.w, this.h);
        pg.push();
        pg.scale(1, -1);
        pg.translate(0, -(2 * this.y + this.h));
        pg.image(img, this.x, this.y, this.w, this.h);
        pg.pop();
    }

    rotate(rotation) {
        let img = pg.get(this.x, this.y, this.w, this.h);
        pg.push();
        pg.translate(this.c.x, this.c.y);
        pg.rotate(rotation * PI * 0.5);
        pg.translate(-this.c.x, -this.c.y);
        pg.image(img, this.x, this.y, this.w, this.h);
        pg.pop();
    }

    rect() {
        pg.rect(this.x, this.y, this.w, this.h);
    }

    triangle2(oriantation) {
        switch (oriantation) {
            case "tl":
                vecTriangle(this.tl, this.tr, this.bl);
                break;
            case "tr":
                vecTriangle(this.tl, this.tr, this.br);
                break;
            case "br":
                vecTriangle(this.br, this.tr, this.bl);
                break;
            case "bl":
                vecTriangle(this.bl, this.tl, this.br);
                break;
        }
    }

    triangle4(oriantation) {
        switch (oriantation) {
            case "l":
                vecTriangle(this.tl, this.bl, this.c);
                break;
            case "t":
                vecTriangle(this.tl, this.tr, this.c);
                break;
            case "r":
                vecTriangle(this.tr, this.br, this.c);
                break;
            case "b":
                vecTriangle(this.bl, this.br, this.c);
                break;
        }
    }

    circle(r) {
        pg.circle(this.c.x, this.c.y, r * Math.min(this.w, this.h));
    }
};
