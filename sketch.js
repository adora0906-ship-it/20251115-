/*
By Okazz
*/
let palette = ['#ff4d00', '#2abde4', '#fdb50e', '#2864b8', '#EAEDF1'];
let ctx;
let centerX, centerY;
let motions = [];
let restTime = 300;
let rects = [];

// 新增：側選單相關變數與建立函式
let sideMenu;
function createSideMenu() {
    // 若已存在，先移除（避免熱重載重複建立）
    if (sideMenu && sideMenu.parentNode) sideMenu.parentNode.removeChild(sideMenu);

    sideMenu = document.createElement('div');
    sideMenu.id = 'hiddenSideMenu';
    Object.assign(sideMenu.style, {
        position: 'fixed',
        left: '0',
        top: '0',
        height: '100vh',
        width: '260px',
        transform: 'translateX(-100%)', // 預設隱藏在畫面左側
        transition: 'transform 360ms ease',
        backgroundColor: '#111',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingLeft: '28px',
        boxSizing: 'border-box',
        zIndex: '9999',
        fontFamily: 'sans-serif',
        fontSize: '32px' // 選單文字大小 32px
    });

    const items = ['第一單元作品', '第一單元講義', '測驗系統', '測驗卷筆記', '作品筆記', '淡江大學', '回到首頁'];
    items.forEach((txt, idx) => {
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = txt;
        Object.assign(a.style, {
            color: '#fff',
            textDecoration: 'none',
            margin: '12px 0',
            display: 'block',
            fontSize: '32px',
            cursor: 'pointer'
        });

        // 第一個選項：點擊時以 iframe 開啟指定網址
        if (idx === 0) {
            a.addEventListener('click', (ev) => {
                ev.preventDefault();
                openIframe('https://adora0906-ship-it.github.io/20251020/');
            });
        }
        // 第二個選項：第一單元講義（開啟 HackMD）
        if (idx === 1) {
            a.addEventListener('click', (ev) => {
                ev.preventDefault();
                openIframe('https://hackmd.io/@VJcjhMUTQuSJpCvVU9Kaow/SJPgDmAslg');
            });
        }
        // 第三個選項：測驗系統
        if (idx === 2) {
            a.addEventListener('click', (ev) => {
                ev.preventDefault();
                openIframe('https://adora0906-ship-it.github.io/20251103/');
            });
        }
        // 第四個選項：測驗卷筆記
        if (idx === 3) {
            a.addEventListener('click', (ev) => {
                ev.preventDefault();
                openIframe('https://hackmd.io/@VJcjhMUTQuSJpCvVU9Kaow/S1H_msByWx');
            });
        }
        // 第五個選項：作品筆記
        if (idx === 4) {
            a.addEventListener('click', (ev) => {
                ev.preventDefault();
                openIframe('https://hackmd.io/@VJcjhMUTQuSJpCvVU9Kaow/SyhW2TCJbl');
            });
        }
        // 第六個選項：淡江大學（包含子選單）
        if (idx === 5) {
            const container = document.createElement('div');
            container.style.position = 'relative';
            
            a.textContent = '淡江大學';
            a.addEventListener('click', (ev) => {
                ev.preventDefault();
                openIframe('https://www.tku.edu.tw/');
            });
            a.addEventListener('mouseenter', () => {
                submenu.style.display = 'block';
            });
            container.addEventListener('mouseleave', () => {
                submenu.style.display = 'none';
            });

            // 建立子選單
            const submenu = document.createElement('div');
            Object.assign(submenu.style, {
                display: 'none',
                backgroundColor: '#222',
                paddingLeft: '20px',
                marginTop: '8px',
                borderRadius: '4px'
            });

            const subItem = document.createElement('a');
            subItem.href = '#';
            subItem.textContent = '教育科技學系';
            Object.assign(subItem.style, {
                color: '#fff',
                textDecoration: 'none',
                display: 'block',
                fontSize: '24px',
                padding: '8px 0',
                cursor: 'pointer',
                marginLeft: '12px'
            });
            subItem.addEventListener('click', (ev) => {
                ev.preventDefault();
                openIframe('https://www.et.tku.edu.tw/');
            });

            submenu.appendChild(subItem);
            container.appendChild(a);
            container.appendChild(submenu);
            sideMenu.appendChild(container);
            return; // 跳過下方的 sideMenu.appendChild(a)
        }
        // 第七個選項：回到首頁
        if (idx === 6) {
            a.addEventListener('click', (ev) => {
                ev.preventDefault();
                location.reload();
            });
        }
        sideMenu.appendChild(a);
    });

    document.body.appendChild(sideMenu);

    // 監聽滑鼠 / 觸控位置：若滑鼠在 canvas 最左側 100px 範圍內就顯示選單
    function handleMove(e) {
        const canvasElt = document.querySelector('canvas');
        let clientX = 0;
        if (e.touches && e.touches[0]) clientX = e.touches[0].clientX;
        else clientX = e.clientX !== undefined ? e.clientX : 0;

        let trigger = false;
        if (canvasElt) {
            const rect = canvasElt.getBoundingClientRect();
            if (clientX <= rect.left + 100) trigger = true;
        } else {
            // fallback：視窗左側 100px
            if (clientX <= 100) trigger = true;
        }

        if (trigger) sideMenu.style.transform = 'translateX(0)';
        else sideMenu.style.transform = 'translateX(-100%)';
    }

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchstart', handleMove);
    document.addEventListener('touchmove', handleMove);
}

function setup() {
    //createCanvas(900, 900); //設定畫布大小
    // 產生一個全螢幕的畫布
    createCanvas(windowWidth, windowHeight);
    rectMode(CENTER);
    ctx = drawingContext;
    centerX = width / 2;
    centerY = height / 2;
    tiling();

    // 建立側選單
    createSideMenu();
}

function draw() {
    background('#21212b');

    for (let i of motions) {
        i.run();
    }

    // 在主畫面顯示指定文字（置中、放大、浮於背景之上）
    push();
    noStroke();
    fill('#ffffff');
    textStyle(BOLD);
    // 以視窗最小邊為基準動態放大（可自行調整比例）
    textSize(min(width, height) * 0.06);
    textAlign(CENTER, CENTER);

    // 加上陰影讓文字看起來浮起來
    const dc = drawingContext;
    dc.shadowBlur = 28;
    dc.shadowColor = 'rgba(0,0,0,0.6)';
    dc.shadowOffsetX = 0;
    dc.shadowOffsetY = 8;

    text('教育科技學系 414730324 吳采璇', centerX, centerY);

    // 清除 shadow 設定以免影響後續繪製
    dc.shadowBlur = 0;
    dc.shadowOffsetX = 0;
    dc.shadowOffsetY = 0;
    pop();
}

function tiling() {
	let margin = 0;
	let columns = 18;
	let rows = columns;
	let cellW = (width - (margin * 2)) / columns;
	let cellH = (height - (margin * 2)) / rows;
	let emp = columns * rows;
	let grids = [];

	for (let j = 0; j < columns; j++) {
		let arr = []
		for (let i = 0; i < rows; i++) {
			arr[i] = false;
		}
		grids[j] = arr;
	}

	while (emp > 0) {
		let w = random([1, 2]);
		let h = random([1, 2]);
		let x = int(random(columns - w + 1));
		let y = int(random(rows - h + 1));
		let lap = true;
		for (let j = 0; j < h; j++) {
			for (let i = 0; i < w; i++) {
				if (grids[x + i][y + j]) {
					lap = false;
					break;
				}
			}
		}

		if (lap) {
			for (let j = 0; j < h; j++) {
				for (let i = 0; i < w; i++) {
					grids[x + i][y + j] = true;
				}
			}
			let xx = margin + x * cellW;
			let yy = margin + y * cellH;
			let ww = w * cellW;
			let hh = h * cellH;
			rects.push({ x: xx + ww / 2, y: yy + hh / 2, w: ww, h: hh });
			emp -= w * h;
		}
	}

	for (let i = 0; i < rects.length; i++) {
		let r = rects[i];
		if (r.w == r.h) {
			let rnd = int(random(5));

			if (rnd == 0) {
				motions.push(new Motion1_1_01(r.x, r.y, r.w * 0.75));
			} else if (rnd == 1) {
				motions.push(new Motion1_1_02(r.x, r.y, r.w));
			} else if (rnd == 2) {
				motions.push(new Motion1_1_03(r.x, r.y, r.w));
			} else if (rnd == 3) {
				motions.push(new Motion1_1_04(r.x, r.y, r.w));
			} else if (rnd == 4) {
				motions.push(new Motion1_1_05(r.x, r.y, r.w * 0.5));
			}
		} else {
			let rnd = int(random(4));
			if (rnd == 0) {
				motions.push(new Motion2_1_01(r.x, r.y, r.w * 0.9, r.h * 0.9));
			} else if (rnd == 1) {
				motions.push(new Motion2_1_02(r.x, r.y, r.w, r.h));
			} else if (rnd == 2) {
				motions.push(new Motion2_1_03(r.x, r.y, r.w, r.h));
			} else if (rnd == 3) {
				motions.push(new Motion2_1_04(r.x, r.y, r.w, r.h));
			}
		}
	}
}

function easeInOutQuint(x) {
	return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

/*------------------------------------------------------------------------------------------*/

class Motion1_1_01 {
	/*
	円四角モーフィング
	*/
	constructor(x, y, w) {
		this.x = x;
		this.y = y;
		this.w = w;

		this.toggle = int(random(2));
		this.clr = random(palette);
		this.initialize();
		this.duration = 80;
		this.currentW = w;
		this.colors = palette.slice();
		shuffle(this.colors, true);
		this.color1 = color(this.colors[0]);
		this.color2 = color(this.colors[1]);
		this.currentW = this.w;

		if (this.toggle) {
			this.currentColor = this.color1;
			this.corner = this.w;
		} else {
			this.currentColor = this.color2;
			this.corner = 0;
		}
	}

	show() {
		noStroke();
		fill(this.currentColor);
		square(this.x, this.y, this.currentW, this.corner);
	}

	update() {
		if (0 < this.timer && this.timer < this.duration) {
			let nrm = norm(this.timer, 0, this.duration - 1);
			let n = nf(easeInOutQuint(nrm), 0, 4);
			if (this.toggle) {
				this.corner = lerp(this.w, 0, n);
				this.currentColor = lerpColor(this.color1, this.color2, n);
			} else {
				this.corner = lerp(0, this.w, n);
				this.currentColor = lerpColor(this.color2, this.color1, n);
			}
			this.currentW = lerp(this.w, this.w / 2, sin(n * PI));
		}

		if (this.timer > this.duration) {
			if (this.toggle) {
				this.toggle = 0;
			} else {
				this.toggle = 1;
			}
			this.initialize();
		}

		this.timer++;
	}

	initialize() {
		if (this.toggle) {
		} else {
		}
		this.timer = -int(random(restTime));
	}

	run() {
		this.show();
		this.update();
	}
}

class Motion1_1_02 {
	/*
	惑星衛星
	*/
	constructor(x, y, w) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.colors = palette.slice();
		shuffle(this.colors, true);
		this.satelliteSize = this.w * 0.2;
		this.orbitW = this.w * 0.4;
		this.orbitH = this.w * 0.1;
		this.timer = int(-random(100));
		this.currentaAngle = random(10);
		this.angleStep = random([1, -1]) * 0.01;
		this.coin = random([-1, 1])
	}

	show() {
		push();
		translate(this.x, this.y);
		rotate(this.currentaAngle);
		noStroke();
		fill(this.colors[0]);
		circle(0, 0, this.w * 0.5);

		fill(this.colors[1]);
		circle(this.orbitW * cos(this.timer / 50 * this.coin), this.orbitH * sin(this.timer / 50 * this.coin), this.satelliteSize);
		pop();
	}

	update() {
		this.timer++;
		this.currentaAngle += this.angleStep;
	}

	run() {
		this.show();
		this.update();
	}
}

class Motion1_1_03 {
	/*
	チェック＆ポルカドット
	*/
	constructor(x, y, w) {
		this.x = x;
		this.y = y;
		this.w = w;

		this.toggle = int(random(2));
		this.initialize();
		this.duration = 150;
		this.colors = palette.slice();
		shuffle(this.colors, true);



		this.gridCount = 4;
		this.cellW = this.w / this.gridCount;

		this.squareW = 0;
		this.circleD = 0;

		if (this.toggle) {
			this.squareW = this.cellW;
		} else {
			this.circleD = this.cellW * 0.75;
		}
	}

	show() {
		push();
		translate(this.x, this.y);
		noStroke();
		for (let i = 0; i < this.gridCount; i++) {
			for (let j = 0; j < this.gridCount; j++) {
				let cellX = - (this.w / 2) + i * this.cellW + (this.cellW / 2);
				let cellY = - (this.w / 2) + j * this.cellW + (this.cellW / 2);
				if ((i + j) % 2 == 0) {
					fill(this.colors[0]);
					square(cellX, cellY, this.squareW);
				} else {

				}

				fill(this.colors[1]);
				circle(cellX, cellY, this.circleD);
			}
		}
		pop();
	}

	update() {
		if (0 < this.timer && this.timer < this.duration) {
			let nrm = norm(this.timer, 0, this.duration - 1);
			let n = nf(easeInOutQuint(nrm), 0, 4);
			if (this.toggle) {
				this.squareW = lerp(this.cellW, 0, n);
				this.circleD = lerp(0, this.cellW * 0.75, n);

			} else {
				this.squareW = lerp(0, this.cellW, n);

				this.circleD = lerp(this.cellW * 0.75, 0, n);
			}
		}

		if (this.timer > this.duration) {
			if (this.toggle) {
				this.toggle = 0;
			} else {
				this.toggle = 1;
			}
			this.initialize();
		}
		this.timer++;
	}

	initialize() {
		if (this.toggle) {
		} else {
		}
		this.timer = -int(random(restTime));
	}

	run() {
		this.show();
		this.update();
	}
}

class Motion1_1_04 {
	/*
	4半円合体
	*/
	constructor(x, y, w) {
		this.x = x;
		this.y = y;
		this.w = w;

		this.toggle = int(random(2));
		this.initialize();
		this.duration = 80;
		this.colors = palette.slice();
		shuffle(this.colors, true);

		this.arcD = this.w / 2;
		if (this.toggle) {
			this.shiftX = 0;
			this.shiftY = 0;
			this.arcA = 0;
		} else {
			this.shiftX = this.w / 2;
			this.shiftY = this.w / 2;
			this.arcA = PI;
		}

	}

	show() {
		push();
		translate(this.x, this.y);
		noStroke();
		for (let i = 0; i < 4; i++) {
			push();
			translate(this.shiftX, this.shiftY);
			rotate(this.arcA);
			fill(this.colors[i]);
			arc(0, 0, this.arcD, this.arcD, 0, PI / 2);
			pop();
			rotate(TAU / 4);
		}
		pop();
	}

	update() {
		if (0 < this.timer && this.timer < this.duration) {
			let nrm = norm(this.timer, 0, this.duration - 1);
			let n = nf(easeInOutQuint(nrm), 0, 4);
			if (this.toggle) {
				this.shiftX = lerp(0, this.w / 2, n);
				this.shiftY = lerp(0, this.w / 2, n);
				this.arcA = lerp(0, PI, n);
			} else {
				this.shiftX = lerp(this.w / 2, 0, n);
				this.shiftY = lerp(this.w / 2, 0, n);
				this.arcA = lerp(PI, 0, n);
			}
		}

		if (this.timer > this.duration) {
			if (this.toggle) {
				this.toggle = 0;
			} else {
				this.toggle = 1;
			}
			this.initialize();
		}
		this.timer++;
	}

	initialize() {
		if (this.toggle) {
		} else {
		}
		this.timer = -int(random(restTime));
	}

	run() {
		this.show();
		this.update();
	}
}

class Motion1_1_05 {
	/*
	四色四角
	*/
	constructor(x, y, w) {
		this.x = x;
		this.y = y;
		this.w = w;

		this.toggle = int(random(2));
		this.initialize();
		this.duration = 120;
		this.colors = palette.slice();
		shuffle(this.colors, true);
		this.squareW = this.w * 0.4;
		this.counter = 0;
		this.timer++;
	}

	show() {
		push();
		translate(this.x, this.y);
		noStroke();
		fill(this.colors[this.counter % this.colors.length]);
		square(this.w * 0.25, -this.w * 0.25, this.squareW);
		fill(this.colors[(this.counter + 1) % this.colors.length]);
		square(this.w * 0.25, this.w * 0.25, this.squareW);
		fill(this.colors[(this.counter + 2) % this.colors.length]);
		square(-this.w * 0.25, this.w * 0.25, this.squareW);
		fill(this.colors[(this.counter + 3) % this.colors.length]);
		square(-this.w * 0.25, -this.w * 0.25, this.squareW);
		pop();
	}

	update() {
		if (this.timer % 15 == 0) {
			this.counter++
		}
		this.timer++;
	}

	initialize() {
		if (this.toggle) {
		} else {
		}
		this.timer = -int(random(1200));
	}

	run() {
		this.show();
		this.update();
	}
}


/*------------------------------------------------------------------------------------------*/

class Motion2_1_01 {
	/*
	〜
	*/
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.angle = int(random(2)) * PI;
		if (this.w < this.h) {
			this.angle += PI / 2;
		}
		this.minS = min(this.w, this.h);
		this.st = this.minS * 0.15;
		this.color = random(palette);
		this.timer = 0;
		this.speed = 0.025 * random([-1, 1]);
	}

	show() {
		push();
		translate(this.x, this.y);
		rotate(this.angle);
		noFill();
		stroke(this.color);
		strokeWeight(this.st);
		beginShape();
		let num = 100;
		for (let i = 0; i < num; i++) {
			let theta = map(i, 0, num, 0, PI * 5);
			let r = lerp(0, this.minS * 0.4, sin(map(i, 0, num, 0, PI)));
			let xx = map(i, 0, num - 1, -this.minS, this.minS);
			let yy = r * sin(theta + (this.timer * this.speed));
			vertex(xx, yy);
		}
		endShape();
		pop();
	}

	update() {
		this.timer++;
	}
	run() {
		this.show();
		this.update();
	}
}

class Motion2_1_02 {
	/*
	4円背の順
	*/
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.angle = int(random(2)) * PI;
		if (this.w < this.h) {
			this.angle += PI / 2;
		}
		this.minS = min(this.w, this.h);

		this.toggle = int(random(2));
		this.color = random(palette);
		this.initialize();
		this.duration = 120;
		this.targetSize = [];
		this.targetSize[0] = this.minS * 0.5;
		this.targetSize[1] = this.minS * 0.4;
		this.targetSize[2] = this.minS * 0.3;
		this.targetSize[3] = this.minS * 0.2;

		this.circleD = [];
		if (this.toggle) {
			this.circleD[0] = this.targetSize[0];
			this.circleD[1] = this.targetSize[1];
			this.circleD[2] = this.targetSize[2];
			this.circleD[3] = this.targetSize[3];
		} else {
			this.circleD[0] = this.targetSize[3];
			this.circleD[1] = this.targetSize[2];
			this.circleD[2] = this.targetSize[1];
			this.circleD[3] = this.targetSize[0];
		}

	}

	show() {
		push();
		translate(this.x, this.y);
		rotate(this.angle);
		noStroke();
		fill(this.color);
		circle(this.minS / 4 * 3, 0, this.circleD[0]);
		circle(this.minS / 4, 0, this.circleD[1]);
		circle(-this.minS / 4, 0, this.circleD[2]);
		circle(-this.minS / 4 * 3, 0, this.circleD[3]);
		pop();
	}

	update() {
		if (0 < this.timer && this.timer < this.duration) {
			let nrm = norm(this.timer, 0, this.duration - 1);
			let n = nf(easeInOutQuint(nrm), 0, 4);
			if (this.toggle) {
				this.circleD[0] = lerp(this.targetSize[0], this.targetSize[3], n);
				this.circleD[1] = lerp(this.targetSize[1], this.targetSize[2], n);
				this.circleD[2] = lerp(this.targetSize[2], this.targetSize[1], n);
				this.circleD[3] = lerp(this.targetSize[3], this.targetSize[0], n);
			} else {
				this.circleD[0] = lerp(this.targetSize[3], this.targetSize[0], n);
				this.circleD[1] = lerp(this.targetSize[2], this.targetSize[1], n);
				this.circleD[2] = lerp(this.targetSize[1], this.targetSize[2], n);
				this.circleD[3] = lerp(this.targetSize[0], this.targetSize[3], n);
			}
		}

		if (this.timer > this.duration) {
			if (this.toggle) {
				this.toggle = 0;
			} else {
				this.toggle = 1;
			}
			this.initialize();
		}

		this.timer++;
	}

	initialize() {
		this.timer = int(-random(restTime));
	}

	run() {
		this.show();
		this.update();
	}
}

class Motion2_1_03 {
	/*
	←←←
	*/
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.angle = int(random(2)) * PI;
		if (this.w < this.h) {
			this.angle += PI / 2;
		}
		this.minS = min(this.w, this.h);
		this.toggle = int(random(2));
		this.colors = palette.slice();
		shuffle(this.colors, true);
		this.initialize();
		this.duration = 150;
		this.shift = 0;
	}

	show() {
		push();
		translate(this.x, this.y);
		rotate(this.angle);
		stroke(0);
		strokeWeight(0);
		noFill();
		rect(0, 0, this.minS * 2, this.minS);
		ctx.clip();
		fill(this.colors[1]);

		for (let i = 0; i < 8; i++) {
			let xx = map(i, 0, 8, -this.minS, this.minS * 2.5);
			this.tri(xx - this.shift, 0, this.minS * 0.5);
		}

		pop();
	}

	update() {
		if (0 < this.timer && this.timer < this.duration) {
			let nrm = norm(this.timer, 0, this.duration - 1);
			let n = nf(easeInOutQuint(nrm), 0, 4);
			this.shift = lerp(0, this.minS * 1.3125, n);
			if (this.toggle) {
			} else {
			}
		}

		if (this.timer > this.duration) {
			if (this.toggle) {
				this.toggle = 0;
			} else {
				this.toggle = 1;
			}
			this.initialize();
		}

		this.timer++;
	}

	initialize() {
		this.timer = int(-random(restTime));
	}

	run() {
		this.show();
		this.update();
	}

	tri(x, y, w) {
		beginShape();
		vertex(x, y);
		vertex(x + (w / 2), y - (w / 2));
		vertex(x + (w / 2), y + (w / 2));
		endShape();
	}
}

class Motion2_1_04 {
	/*
	ボール
	*/
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.angle = int(random(2)) * PI;
		if (this.w < this.h) {
			this.angle += PI / 2;
		}
		this.minS = min(this.w, this.h);
		this.toggle = int(random(2));
		this.colors = palette.slice();
		shuffle(this.colors, true);
		this.initialize();
		this.duration = 30;

		this.circleW = this.minS / 4;
		this.circleH = this.minS / 2;

		if (this.toggle) {
			this.shift = -(this.minS - this.circleW / 2);
		} else {
			this.shift = (this.minS - this.circleW / 2);
		}
	}

	show() {
		push();
		translate(this.x, this.y);
		rotate(this.angle);
		stroke(0);
		strokeWeight(0);
		fill(this.colors[0]);
		fill(this.colors[1]);
		ellipse(this.shift, 0, this.circleW, this.circleH);

		pop();
	}

	update() {
		if (0 < this.timer && this.timer < this.duration) {
			let nrm = norm(this.timer, 0, this.duration - 1);
			let n = nf(easeInOutQuint(nrm), 0, 4);
			this.circleW = lerp(this.minS / 4, this.minS / 2, sin(n * PI));
			this.circleH = lerp(this.minS / 2, this.minS / 4, sin(n * PI));
			if (this.toggle) {
				this.shift = lerp(-(this.minS - this.circleW / 2), (this.minS - this.circleW / 2), n);
			} else {
				this.shift = lerp((this.minS - this.circleW / 2), -(this.minS - this.circleW / 2), n);
			}

		}

		if (this.timer > this.duration) {
			if (this.toggle) {
				this.toggle = 0;
			} else {
				this.toggle = 1;
			}
			this.initialize();
		}

		this.timer++;
	}

	initialize() {
		this.timer = int(-random(restTime));
	}

	run() {
		this.show();
		this.update();
	}
}
/*------------------------------------------------------------------------------------------*/

// 新增：以 overlay + iframe 顯示外部頁面（寬 70% 視窗、高 85% 視窗）
function openIframe(url) {
    // 移除已存在的 overlay（若有）
    const existing = document.getElementById('iframeOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'iframeOverlay';
    Object.assign(overlay.style, {
        position: 'fixed',
        left: '0',
        top: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '10000',
        padding: '20px',
        boxSizing: 'border-box'
    });

    const wrapper = document.createElement('div');
    Object.assign(wrapper.style, {
        width: '70vw',   // 寬為視窗 70%
        height: '85vh',  // 高為視窗 85%
        backgroundColor: '#000',
        position: 'relative',
        borderRadius: '6px',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.6)'
    });

    const btn = document.createElement('button');
    btn.textContent = '關閉';
    Object.assign(btn.style, {
        position: 'absolute',
        right: '10px',
        top: '10px',
        zIndex: '10001',
        padding: '8px 12px',
        fontSize: '16px',
        cursor: 'pointer',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#fff'
    });
    btn.addEventListener('click', () => overlay.remove());

    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.allow = 'fullscreen';
    Object.assign(iframe.style, {
        width: '100%',
        height: '100%',
        border: 'none',
        display: 'block',
        backgroundColor: '#fff'
    });

    wrapper.appendChild(btn);
    wrapper.appendChild(iframe);
    overlay.appendChild(wrapper);
    document.body.appendChild(overlay);
}
