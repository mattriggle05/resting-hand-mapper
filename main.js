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



// TOUCH STUFF

const activeTouches = new Map();

function draw() {
    let sumX = 0;
    let sumY = 0;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    for (const touch of activeTouches.values()) {
        sumX += touch.pageX
        sumY += touch.pageY
        ctx.beginPath();
        ctx.arc(touch.pageX, touch.pageY, 40, 0, 2 * Math.PI);
        ctx.lineWidth = 4;
        ctx.strokeStyle = `#000000`;
        ctx.stroke();
        ctx.arc(touch.pageX, touch.pageY, 40, 0, 2 * Math.PI);
        ctx.lineWidth = 2;
        ctx.strokeStyle = `#00FF00`;
        ctx.stroke();
    }

    if (activeTouches.size === 5) {
        const centroid = {
            pageX: sumX / activeTouches.size,
            pageY: sumY / activeTouches.size,
        }

        ctx.beginPath();
        ctx.arc(centroid.pageX, centroid.pageY, 22, 0, 2 * Math.PI);
        ctx.fillStyle = `#000000`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centroid.pageX, centroid.pageY, 20, 0, 2 * Math.PI);
        ctx.fillStyle = `#FF0000`;
        ctx.fill();


        var thumbPosition = NaN;
        var maxDistanceForThumb = -1;
        for (const touch of activeTouches.values()) {
            let currDistance = Math.sqrt((centroid.pageX - touch.pageX)**2 + (centroid.pageY - touch.pageY)**2)
            if (currDistance > maxDistanceForThumb) {
                maxDistanceForThumb = currDistance
                thumbPosition = touch;
            }
        }
        ctx.beginPath();
        ctx.arc(thumbPosition.pageX, thumbPosition.pageY, 50, 0, 2 * Math.PI);
        ctx.fillStyle = `#0000FF`;
        ctx.fill();

        var indexPosition = NaN;
        var minDistanceForIndex = Number.MAX_SAFE_INTEGER;
        for (const touch of activeTouches.values()) {
            let currDistance = Math.sqrt((thumbPosition.pageX - touch.pageX)**2 + (thumbPosition.pageY - touch.pageY)**2)
            if (currDistance < minDistanceForIndex && currDistance > 0) {
                minDistanceForIndex = currDistance
                indexPosition = touch;
            }
        }
        ctx.beginPath();
        ctx.arc(indexPosition.pageX, indexPosition.pageY, 50, 0, 2 * Math.PI);
        ctx.fillStyle = `#FF00FF`;
        ctx.fill();
    }
}

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