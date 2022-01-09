let startId = 0;

function onLoadTour() {
    $("#spin-loading").hide();
    if (startId < infospot.length) {
        delayExecute(spotList[startId].focus.bind(spotList[startId]), tweeningDelay);
        typer(paragraphs[startId + 1], onLoadTour);
        startId = startId + 1;
    } else {
        viewer.OrbitControls.enabled = true;
        $("#controls").show();
    }
}

function onChangePanorama(viewer, targetPanorama) {
	viewer.setPanorama(targetPanorama); 
}

function toggleFloorPlan(isShow) {
    if (isShow) {
        $(document).ready(function() {
            $("#floor-plan").show();
        });
    } else {
        $(document).ready(function() {
            $("#floor-plan").hide();
        });
    }
    isShowFloorPlan = isShow;
}

let stoprotate = true

function makeAutoRotate(isStopRotate) {
    viewer.OrbitControls.autoRotate = !isStopRotate;
    stoprotate = isStopRotate;
}

function generateMenuItem(text, textLength, width, height, tiles) {

	var item, title, menu_color, duration, left_hs_geo, right_hs_geo, left_hs_matrix, right_hs_matrix;

	menu_color = 0x34495e;
	duration = 500;

	item = new PANOLENS.Tile(width, height);
	item.name = text;
	item.tween('colorEnter', item.material.color, { r: 24 / 256, g: 39 / 256, b: 53 / 256 }, duration);
	item.tween('colorLeave', item.material.color, { r: 52 / 256, g: 73 / 256, b: 94 / 256 }, duration);
	item.tween('translateFront', item.position, { z: tiles.position.z });
	item.tween('translateBack', item.position, { z: tiles.position.z - 2 });
	item.material.color.set(menu_color);

	left_hs_geo = new THREE.CircleGeometry(3, 32, Math.PI / 2, Math.PI);
	left_hs_matrix = new THREE.Matrix4().makeTranslation(-width / 2, 0, 0);
	right_hs_geo = new THREE.CircleGeometry(3, 32, -Math.PI / 2, Math.PI);
	right_hs_matrix = new THREE.Matrix4().makeTranslation(width / 2, 0, 0);
	item.geometry.merge(left_hs_geo, left_hs_matrix);
	item.geometry.merge(right_hs_geo, right_hs_matrix);

	item.addEventListener('hoverenter', function() {
		SOUND_OVER.play();
		if (entryPanorama.selection === this) { return; }
		this.tweens['colorLeave'].stop();
		this.tweens['colorEnter'].start();
	});
	item.addEventListener('hoverleave', function() {
		SOUND_OVER.stop();
		if (entryPanorama.selection === this) { return; }
		this.tweens['colorEnter'].stop();
		this.tweens['colorLeave'].start();
	});
	item.addEventListener('pressstart', function() {
		this.tweens['translateFront'].stop();
		this.tweens['translateBack'].start();
	});
	item.addEventListener('pressstop', function() {
		this.tweens['translateBack'].stop();
		this.tweens['translateFront'].start();
	});
	item.addEventListener('click-entity', function() {
		SOUND_CLICK.stop();
		SOUND_CLICK.play();
	});

	title = new PANOLENS.SpriteText(text, textLength);
	title.setEntity(item);
	title.passThrough = true;
	title.position.set(1, 2, 1);
	title.scale.multiplyScalar(1.2);
	title.rotation.y = Math.PI;
	title.renderOrder = 2;
	item.add(title);

	return item;
}