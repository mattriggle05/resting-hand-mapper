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

function drawText(x, y, text, font, fillColor, strokeColor) {
    ctx.font = font;
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.fillText(text,x,y);
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

function draw() {
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    for (const touch of activeTouches.values()) {
        drawCircleOutline(touch.pageX, touch.pageY, 40, '#000000', 4);
        drawCircleOutline(touch.pageX, touch.pageY, 40, '#00FF00', 2);
    }

    if (activeTouches.size !== 5) return;

    const centroid = getCentroid(activeTouches);
    drawCircleFill(centroid.pageX, centroid.pageY, 22, '#000000');
    drawCircleFill(centroid.pageX, centroid.pageY, 20, '#FF0000');

    const thumb = getFurthestFrom(centroid, activeTouches);
    drawCircleFill(thumb.pageX, thumb.pageY, 40, '#0000FF');
    drawText(thumb.pageX + 55, thumb.pageY - 2.5, "Thumb", "20px Arial", '#0000FF', '#000000')
    // thumbs is always at the origin by convention
    drawText(thumb.pageX + 55, thumb.pageY+22.5, "(0, 0)", "20px Arial", '#0000FF', '#000000')

    const index = getNearestTo(thumb, activeTouches);
    drawCircleFill(index.pageX, index.pageY, 40, '#FF00FF');
    drawText(index.pageX + 55, index.pageY - 2.5, "Index", "20px Arial", '#FF00FF', '#000000')
    // vector from thumb to index marks the Y axis, so the position is always (0, distance)
    var indexThumbDistance = Math.hypot(index.pageX - thumb.pageX, index.pageY - thumb.pageY);
    drawText(index.pageX + 55, index.pageY+22.5, `(0, ${Math.round(indexThumbDistance)})`, "20px Arial", '#FF00FF', '#000000') 
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