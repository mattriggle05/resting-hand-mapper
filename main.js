const canvas = document.getElementById('canvas');
let ctx;

// MAKE THE CANVAS THE FULL PAGE

function rescale() {
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
}
window.addEventListener('resize', rescale);
rescale();

// DRAWING STUFF

const activeTouches = new Map();

function drawCircleOutline(x, y, radius, color, lineWidth = 2) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.stroke();
}

function drawText(x, y, angle, text, fillColor) {
    ctx.save();
    ctx.font = "25px sans-serif";
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.textAlign = "center"
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillText(text, 0, -50);
    ctx.strokeText(text, 0, -50);
    ctx.restore();
}

function drawCircleFill(x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

function getCentroid(touches) {
    let sumX = 0, sumY = 0;
    for (const t of touches.values()) { sumX += t.pageX; sumY += t.pageY; }
    return { pageX: sumX / touches.size, pageY: sumY / touches.size };
}

function getFurthestFrom(point, touches) {
    let maxDist = -1, result = null;
    for (const t of touches.values()) {
        const d = Math.hypot(point.pageX - t.pageX, point.pageY - t.pageY);
        if (d > maxDist) { maxDist = d; result = t; }
    }
    return result;
}

function getNearestTo(point, touches) {
    let minDist = Infinity, result = null;
    for (const t of touches.values()) {
        const d = Math.hypot(point.pageX - t.pageX, point.pageY - t.pageY);
        if (d > 0 && d < minDist) { minDist = d; result = t; }
    }
    return result;
}

function toHandCoords(touch, thumb, nx, ny) {
    const dx = touch.pageX - thumb.pageX;
    const dy = touch.pageY - thumb.pageY;
    return {
        x: (dx * -ny) + (dy * nx),
        y: (dx * nx) + (dy * ny)
    };
}

function draw() {
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    for (const touch of activeTouches.values()) {
        drawCircleOutline(touch.pageX, touch.pageY, 35, '#000000', 4);
        drawCircleOutline(touch.pageX, touch.pageY, 35, '#00FF00', 2);
    }

    if (activeTouches.size !== 5) return;

    const centroid = getCentroid(activeTouches);
    const thumb = getFurthestFrom(centroid, activeTouches);
    const index = getNearestTo(thumb, activeTouches);

    // vector from thumb to index marks the Y axis, so the position is always (0, distance)
    var indexThumbDiffX = index.pageX - thumb.pageX
    var indexThumbDiffY = index.pageY - thumb.pageY
    var indexThumbDistance = Math.hypot(indexThumbDiffX, indexThumbDiffY);
    

    // draw coordinate grid lines
    const nx = indexThumbDiffX / indexThumbDistance;
    const ny = indexThumbDiffY / indexThumbDistance;

    // y axis
    ctx.setLineDash([10, 6]);
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000000aa";
    ctx.moveTo(thumb.pageX - nx * 10000, thumb.pageY - ny * 10000);
    ctx.lineTo(thumb.pageX + nx * 10000, thumb.pageY + ny * 10000);
    ctx.stroke();
    // x axis
    ctx.beginPath();
    ctx.moveTo(thumb.pageX - ny * 10000, thumb.pageY + nx * 10000);
    ctx.lineTo(thumb.pageX + ny * 10000, thumb.pageY - nx * 10000);
    ctx.stroke();
    ctx.setLineDash([]);

    for (const touch of activeTouches.values()) {
        let angle = Math.atan2(indexThumbDiffY, indexThumbDiffX) + Math.PI / 2;
        let transformed = toHandCoords(touch, thumb, nx, ny)
        drawText(touch.pageX, touch.pageY, angle, `(${Math.round(transformed.x)}, ${Math.round(transformed.y)})`, '#00ff00')
    }


    
}

// EVENT LISTENERS

function changeTouch(e) {
    e.preventDefault();
    for (const touch of e.changedTouches) {
        activeTouches.set(touch.identifier, {
            identifier: touch.identifier,
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