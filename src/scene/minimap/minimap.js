let map = L.map('floor-plan', {
    crs: L.CRS.Simple,
    minZoom: -2,
    attributionControl: false
});
let greenIcon = L.icon({
    iconUrl: '../../../../asset/ping_location.png',
    iconSize: [40, 40],
    iconAnchor: [22, 40],
    popupAnchor: [-3, -30]
});
let lngLat = L.latLng;

function latLng(x, y) {
    if (L.Util.isArray(x)) { // When doing xy([x, y]);
        return lngLat(x[1], x[0]);
    }
    return lngLat(y, x); // When doing xy(x, y);
}

var bounds = [latLng(0, 0), latLng(800, 800)];
var image = L.imageOverlay('../../../../asset/Sodo2.png', bounds).addTo(map);


function floorPlan() {
    this.points = [];
    this.background = new Image();
    this.Init = (map) => {
        this.points = [
            new mapPoint({ cx: 550, cy: 80 }, false),
            new mapPoint({ cx: 500, cy: 250 }, false),
            new mapPoint({ cx: 300, cy: 80 }, false),
            new mapPoint({ cx: 80, cy: 300 }, false)
        ]
        this.draw();
        this.background.src = map
    }

    this.clicked = function(location) {
        this.points.forEach(point => {
            point.clicked(location)
        })
    }

    this.draw = function() {
        this.points.forEach(point => {
            point.drawPoint()
        })
        map.setView(latLng(550, 120), 0);
    }
}

function mapPoint(position, isInside) {
    this.position = position
    this.isInside = isInside

    this.Init = () => {
        this.drawPoint()
    }

    this.drawPoint = function() {
        let sol = latLng(this.position.cx, this.position.cy);
        L.marker(sol, { icon: greenIcon }).addTo(map).bindPopup('Mizar');
    }
}

minimap = new floorPlan();
minimap.Init("../../../../asset/SodoGiangduong.gif");


// let canvas = document.getElementById("floor-plan")
// let ctx = canvas.getContext('2d')
// let size = 250
// let cameraOffset = { x: 250 / 2, y: 250 / 2 }
// let cameraZoom = 1
// let MAX_ZOOM = 5
// let MIN_ZOOM = 0.5
// let SCROLL_SENSITIVITY = 0.0005
// let isDragging = false
// let dragStart = { x: 0, y: 0 }
// let initialPinchDistance = null
// let lastZoom = cameraZoom

// function getEventLocation(e) {
//     if (e.touches && e.touches.length == 1) {
//         return { x: e.touches[0].clientX, y: e.touches[0].clientY }
//     } else if (e.clientX && e.clientY) {
//         return { x: e.clientX, y: e.clientY }
//     }
// }

// function drawRect(x, y, width, height) {
//     ctx.fillRect(x, y, width, height)
// }

// function drawText(text, x, y, size, font) {
//     ctx.font = `${size}px ${font}`
//     ctx.fillText(text, x, y)
// }

// function onPointerDown(e) {
//     isDragging = true
//     dragStart.x = getEventLocation(e).x / cameraZoom - cameraOffset.x
//     dragStart.y = getEventLocation(e).y / cameraZoom - cameraOffset.y
// }

// function onPointerUp(e) {
//     isDragging = false
//     initialPinchDistance = null
//     lastZoom = cameraZoom
// }

// function onPointerMove(e) {
//     if (isDragging) {
//         cameraOffset.x = getEventLocation(e).x / cameraZoom - dragStart.x
//         cameraOffset.y = getEventLocation(e).y / cameraZoom - dragStart.y
//     }
// }

// function handleTouch(e, singleTouchHandler) {
//     if (e.touches.length == 1) {
//         singleTouchHandler(e)
//     } else if (e.type == "touchmove" && e.touches.length == 2) {
//         isDragging = false
//         handlePinch(e)
//     }
// }

// function handlePinch(e) {
//     e.preventDefault()

//     let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY }
//     let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY }

//     let currentDistance = (touch1.x - touch2.x) ** 2 + (touch1.y - touch2.y) ** 2

//     if (initialPinchDistance == null) {
//         initialPinchDistance = currentDistance
//     } else {
//         adjustZoom(null, currentDistance / initialPinchDistance)
//     }
// }

// function adjustZoom(zoomAmount, zoomFactor) {
//     if (!isDragging) {
//         if (zoomAmount) {
//             cameraZoom += zoomAmount
//         } else if (zoomFactor) {
//             console.log(zoomFactor)
//             cameraZoom = zoomFactor * lastZoom
//         }

//         cameraZoom = Math.min(cameraZoom, MAX_ZOOM)
//         cameraZoom = Math.max(cameraZoom, MIN_ZOOM)

//         console.log(zoomAmount)
//     }
// }

// canvas.addEventListener('mousedown', onPointerDown)
// canvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown))
// canvas.addEventListener('mouseup', onPointerUp)
// canvas.addEventListener('touchend', (e) => handleTouch(e, onPointerUp))
// canvas.addEventListener('mousemove', onPointerMove)
// canvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove))
// canvas.addEventListener('wheel', (e) => adjustZoom(e.deltaY * SCROLL_SENSITIVITY))



// let blurColor = "#FF8C00";
// let hoverColor = "red";

// function mapPoint(position, isInside) {
//     this.position = position
//     this.isInside = isInside

//     this.Init = () => {
//         this.drawPoint()
//     }

//     this.clicked = function(location) {
//         console.log(location.x)
//         console.log(location.y)
//             //console.log(this.position.cx)
//         if ((location.x < this.position.cx + 5 && location.x > this.position.cx - 5) && (location.y < this.position.cy + 5 && location.y > this.position.cy - 5)) {
//             alert(position.x)
//         }
//     }

//     this.drawPoint = function() {
//         ctx.beginPath();
//         ctx.arc(this.position.cx, this.position.cy, 10 / cameraZoom, 0, 2 * Math.PI);
//         ctx.fillStyle = isInside ? hoverColor : blurColor;
//         ctx.fill();
//         ctx.lineWidth = 1 / cameraZoom;
//         ctx.strokeStyle = '#2d2d2d';
//         ctx.stroke();
//     }
// }

// minimap = new floorPlan();
// minimap.Init("../../../../asset/SodoGiangduong.gif");

// canvas.addEventListener('click', (e) => {
//     let cx = getEventLocation(e).x / cameraZoom - cameraOffset.x
//     let cy = getEventLocation(e).y / cameraZoom - cameraOffset.y
//     minimap.clicked({ x: cx, y: cy })
// }, false);