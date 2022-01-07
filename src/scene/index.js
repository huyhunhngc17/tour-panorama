progressElement = document.querySelector('#progress');
paragraphs = [
    ['DUT Presents', 'A Journey to a <strong>University</strong>', 'Here we go'],
    ['One of the common meter that you can see on a train', 'it is not specially eye-catching but it just can get your attention', 'it indicates how fast the train is currently going', 'Let us continue'],
    ['A Valve', 'solid looking and quite decent color', 'here shows the evidence that time would leaves marks on everything', 'same thing applies to our face...'],
    ['Alright. Here we have a seat. The green pad looks quite comfortable', 'when you are on a train', 'OK. Move on to next one'],
    ['There is a box over there', 'probably some fuse or electronic devices', 'Hmmmm............', 'Anyway', 'Let\'s keep moving'],
    ['This is our last stop', 'Please continue your journey with this wonder train...']
];

infospot = [
    new Hint("hallASpot", 4610.04, 1280.07, 1431.29, 0, "w"),
    new Hint("hallBSpot", 4637.61, -798.12, -1671.24, 1, "w"),
    new Hint("hallCSpot", 1934.61, -2611.69, -3792.91, 1, "w"),
    new Hint("hallFSpot", -3348.82, 3705.92, 45.54, 1, "w"),
    new Hint("hallEndSpot", -3461.4, -3592.37, -241.38, 1, "w"),
]

spotList = [];

function onEnter(event) {
    //DeviceMotionEvent.requestPermission;
    progressElement.style.width = 0;
    progressElement.classList.remove('finish');
}

function onProgress(event) {
    var progress = event.progress.loaded / event.progress.total * 100;
    progressElement.style.width = progress + '%';
    if (progress === 100) {
        progressElement.classList.add('finish');
    }
}

// Panorama
panorama = new PANOLENS.ImagePanorama('../../../asset/StreetView360.jpg');
panorama.addEventListener('progress', onProgress);
panorama.addEventListener('load', onInit);
panorama.addEventListener('enter', onEnter);

// Viewer
viewer = new PANOLENS.Viewer({ initialLookAt: new THREE.Vector3(0, 0, 5000), autoRotateSpeed: 1, autoRotateActivationDuration: 5000 });
viewer.OrbitControls.enabled = false;
viewer.add(panorama);

//add compat
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

function onInit() {
    if (screen.width < 760) {
        $(document).ready(function() {
            $("#floor-plan").hide();
        });
    }

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

    console.log(screen.width)
    typer(paragraphs[startId], onLoadTour, 2000);
}

startId = 0;

function onLoadTour() {
    $("#spin-loading").hide();
    if (startId < infospot.length) {
        delayExecute(spotList[startId].focus.bind(spotList[startId]), tweeningDelay);
        typer(paragraphs[startId + 1], onLoadTour);
        startId = startId + 1;
    } else {
        //
        viewer.OrbitControls.enabled = true;
        $("#controls").show();
    }
}

function onChangePanorama(panorama) {

}
$(".btn").click(function() {
    $(".input").toggleClass("active").focus;
    $(this).toggleClass("animate");
    $(".input").val("");
});