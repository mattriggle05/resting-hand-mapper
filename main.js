const canvas = document.getElementById('canvas');
const activeTouches = new Map();
let ctx;

// MAKE THE CANVAS THE FULL PAGE

function scaleCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
}

scaleCanvas();
window.addEventListener('resize', scaleCanvas);



// TOUCH STUFF

function draw() {
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    for (const touch of activeTouches.values()) {
        ctx.beginPath();
        ctx.arc(touch.pageX, touch.pageY, 40, 0, 2 * Math.PI);
        ctx.lineWidth = 2;
        ctx.strokeStyle = `#00FF00`;
        ctx.stroke();
    }
}

function changeTouch(e) {
    e.preventDefault();
    for (const touch of e.changedTouches) {
        activeTouches.set(touch.identifier, {
            pageX: touch.pageX,
            pageY: touch.pageY,
        });
    }
    draw();
}

function removeTouch(e) {
    e.preventDefault();
    for (const touch of e.changedTouches) {
        activeTouches.delete(touch.identifier);
    }
    draw();
}


canvas.addEventListener('touchstart', changeTouch, { passive: false });
canvas.addEventListener('touchmove', changeTouch, { passive: false });
canvas.addEventListener('touchend', removeTouch, { passive: false });
canvas.addEventListener('touchcancel', removeTouch, { passive: false });