//create viewer
container = document.querySelector ( '#container');
let viewer = new PANOLENS.Viewer({ container: container, initialLookAt: new THREE.Vector3(0, 0, 5000), autoRotateSpeed: 1, autoRotateActivationDuration: 5000 });
viewer.OrbitControls.enabled = false;

//adding controller
let controlItemFloorPlan = {
    style: {
        backgroundImage: `url(${ORIGIN_ASSET_PATH}/floor_plan_control.png)`
    },
    onTap: () => {
        toggleFloorPlan(!isShowFloorPlan);
    }
};
let controlItemSound = {
    style: {
        backgroundImage: `url(${ORIGIN_ASSET_PATH}/sound_control.png)`
    },
    onTap: function() {

    }
};
let controlItemAutoRoll = {
    style: {
        backgroundImage: `url(${ORIGIN_ASSET_PATH}/auto_roll_control.png)`
    },
    onTap: function() {
        makeAutoRotate(!stoprotate)
    }
};
let controlItemHelp = {
    style: {
        backgroundImage: `url(${ORIGIN_ASSET_PATH}/help_control.png)`
    },
    onTap: function() {

    }
};
viewer.appendControlItem(controlItemFloorPlan);
viewer.appendControlItem(controlItemSound);
viewer.appendControlItem(controlItemAutoRoll);
viewer.appendControlItem(controlItemHelp);

//add compass
northposition_start = 90;
viewer.getControl().addEventListener('change', () => {
    y = viewer.getCamera().rotation.y;
    if (y < 0) {
        dy = THREE.Math.radToDeg(y + (2 * Math.PI));
    } else {
        dy = THREE.Math.radToDeg(y);
    }
    dy = Math.round(dy) - northposition_start;
    $("#compassplace").css('transform', 'rotate(' + dy + 'deg)');
});

let paragraphs = [
    ['DUT Presents', 'A Journey to a <strong>University</strong>', 'Here we go'],
    ['Quyết định số 66/QĐ ngày 15/07/1975 thành lập Viện Đại học Đà Nẵng - là tiền thân của Trường Đại học Bách khoa Đà Nẵng', 'it is not specially eye-catching but it just can get your attention', 'it indicates how fast the train is currently going', 'Let us continue'],
    ['AAA', 'BBB', 'CCC', 'DDD'],
    ['AAA', 'BBB', 'CCC'],
    ['AAA', 'Hmmmm............', 'Anyway', 'Let\'s keep moving'],
    ['AAA', 'AAA']
];

let infospot = [
    new Hint("hallASpot", 4610.04, 1280.07, 1431.29, 0, "w"),
    new Hint("hallBSpot", 4637.61, -798.12, -1671.24, 1, "w"),
    new Hint("hallCSpot", 1934.61, -2611.69, -3792.91, 1, "w"),
    new Hint("hallFSpot", -3348.82, 3705.92, 45.54, 1, "w"),
    new Hint("hallEndSpot", -3461.4, -3592.37, -241.38, 1, "w"),
]

let spotList = [];

function onEnter(event) {
    progressElement.style.width = 0;
    progressElement.classList.remove('finish');
}

let progressElement = document.querySelector('#progress');
let isShowFloorPlan = true;

function onProgress(event) {
    let progress = event.progress.loaded / event.progress.total * 100;
    progressElement.style.width = progress + '%';
    if (progress === 100) {
        progressElement.classList.add('finish');
    }
}

// Panorama
panorama = new PANOLENS.ImagePanorama(`${ORIGIN_ASSET_PATH}/${PANORAMA_PATH}/yallView.jpg`);
panorama.addEventListener('progress', onProgress);
panorama.addEventListener('load', onInit);
panorama.addEventListener('enter', onEnter);

panoramaAreaA = new PANOLENS.ImagePanorama(`${ORIGIN_ASSET_PATH}/${PANORAMA_PATH}/khua.jpg`);
panoramaAreaA.addEventListener('progress', onProgress);

panoramaAreaB = new PANOLENS.ImagePanorama(`${ORIGIN_ASSET_PATH}/${PANORAMA_PATH}/khub1.jpg`);
panoramaAreaB.addEventListener('progress', onProgress);

panoramaAreaTTHL = new PANOLENS.ImagePanorama(`${ORIGIN_ASSET_PATH}/${PANORAMA_PATH}/trungtamhoclieu.jpg`);
panoramaAreaTTHL.addEventListener('progress', onProgress);

panoramaAreaKD = new PANOLENS.ImagePanorama(`${ORIGIN_ASSET_PATH}/${PANORAMA_PATH}/khudien.jpg`);
panoramaAreaKD.addEventListener('progress', onProgress);

panoramas = [panorama, panoramaAreaA, panoramaAreaB, panoramaAreaTTHL, panoramaAreaKD]

// Viewer
viewer.add(panorama, panoramaAreaA, panoramaAreaB, panoramaAreaTTHL, panoramaAreaKD);
let minimap = new floorPlan(`${ORIGIN_ASSET_PATH}/${FLOOR_PLAN_PATH_IMAGE}`, viewer, panoramas)
minimap.Init()

function onInit() {
    for (let section in paragraphs) {
        if (paragraphs.hasOwnProperty(section)) {
            paragraphs[section].unshift('');
            paragraphs[section].push('');
        }
    }
    for (let i = 0; i < infospot.length; i++) {
        var item = infospot[i];
        var spot = i != (infospot.length - 1) ? new PANOLENS.Infospot(400) : new PANOLENS.Infospot(10e-7);
        spot.position.set(item.positionX, item.positionY, item.positionZ)
        if (item.infoType == 1) {
            spot.addHoverElement(document.getElementById('desc-meter'), 400)
        } else {
            spot.addHoverText(item.name)
        }
        panorama.add(spot)
        spotList.push(spot)
    }
    typer(paragraphs[startId], onLoadTour, 2000);
}

$(".btn").click(function() {
    $(".input").toggleClass("active").focus;
    $(this).toggleClass("animate");
    $(".input").val("");
});