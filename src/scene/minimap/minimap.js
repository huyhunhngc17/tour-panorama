let map = L.map('floor-plan', {
    crs: L.CRS.Simple,
    minZoom: -2,
    attributionControl: false
});

let lngLat = L.latLng;

function latLng(x, y) {
    if (L.Util.isArray(x)) {
        return lngLat(x[1], x[0]);
    }
    return lngLat(y, x);
}

function onChangePanorama(viewer, targetPanorama) {
	viewer.setPanorama(targetPanorama); 
}

function floorPlan(ground, panoramaViewer, panoramas) {
    this.points = [];
    this.map = ground;
	this.panoramaViewer = panoramaViewer;
	this.panoramas = panoramas;

    this.Init = () => {
        this.points = [
            new mapPoint({ cx: 550, cy: 80 }, false),
            new mapPoint({ cx: 500, cy: 250 }, false),
            new mapPoint({ cx: 300, cy: 80 }, false),
            new mapPoint({ cx: 80, cy: 300 }, false)
        ]
        this.draw();
    }

    this.clicked = function(location) {
        this.points.forEach(point => {
            point.clicked(location)
        })
    }

    this.draw = function() {
        let bounds = [latLng(0, 0), latLng(800, 800)];
        L.imageOverlay(this.map, bounds).addTo(map);
        this.points.forEach(point => {
			point.setOnClicked(() => {
				onChangePanorama(this.panoramaViewer, panoramas[1])
			})
			point.drawPoint()
        })
        map.setView(latLng(550, 120), 0);
    }
}

function mapPoint(position, isInside) {
    this.position = position
    this.isInside = isInside
	this.clicked
	this.markIcon = L.icon({
		iconUrl: `${ORIGIN_ASSET_PATH}/ping_location.png`,
		iconSize: [40, 40],
		iconAnchor: [22, 40],
		popupAnchor: [-3, -30]
	});

    this.Init = () => {
        this.drawPoint()
    }

	this.setOnClicked = (click) => {
		this.clicked = click
	}

    this.drawPoint = function() {
        let sol = latLng(this.position.cx, this.position.cy);
        L.marker(sol, { icon: this.markIcon }).addTo(map).bindPopup('Mizar').on('click', (e) => {
            this.clicked();
        });
    }
}