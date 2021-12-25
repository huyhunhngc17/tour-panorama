var progressElement = document.querySelector('#progress');
var paragraphs = {
    welcome: ['DUT Presents', 'A Journey to a <strong>University</strong>', 'Here we go'],
    meter: ['One of the common meter that you can see on a train', 'it is not specially eye-catching but it just can get your attention', 'it indicates how fast the train is currently going', 'Let us continue'],
    valve: ['A Valve', 'solid looking and quite decent color', 'here shows the evidence that time would leaves marks on everything', 'same thing applies to our face...'],
    seat: ['Alright. Here we have a seat. The green pad looks quite comfortable', 'when you are on a train', 'OK. Move on to next one'],
    box: ['There is a box over there', 'probably some fuse or electronic devices', 'Hmmmm............', 'Anyway', 'Let\'s keep moving'],
    ending: ['This is our last stop', 'Please continue your journey with this wonder train...']
};

var Infospot = [Hint("hallASpot", 1, 1, 1, 1, "w")]

for (let section in paragraphs) {
    if (paragraphs.hasOwnProperty(section)) {
        paragraphs[section].unshift('');
        paragraphs[section].push('');
    }
}

function onLoad() {
    typer(paragraphs.welcome, onWelcomeComplete, 2000);
}

function onEnter(event) {
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

function onWelcomeComplete() {
    delayExecute(hallAInfospot.focus.bind(hallAInfospot), tweeningDelay);
    typer(paragraphs.meter, onMeterTourComplete);
}

function onMeterTourComplete() {
    delayExecute(hallBInfospot.focus.bind(hallBInfospot), tweeningDelay);
    typer(paragraphs.valve, onValveTourComplete);
}

function onValveTourComplete() {
    delayExecute(hallCInfospot.focus.bind(hallCInfospot), tweeningDelay);
    typer(paragraphs.seat, onSeatTourComplete);
}

function onSeatTourComplete() {
    delayExecute(hallFInfospot.focus.bind(hallFInfospot), tweeningDelay);
    typer(paragraphs.box, onTopboxTourComplete);
}

function onTopboxTourComplete() {
    delayExecute(endingInfospot.focus.bind(endingInfospot), tweeningDelay);
    typer(rparagraphs.ending, function() { viewer.OrbitControls.enabled = true; });
}

function onLoadTour() {

}

hallAInfospot = new PANOLENS.Infospot(400, '../../../asset/location_point.gif');
hallBInfospot = new PANOLENS.Infospot(400, '../../../asset/location_point.gif');
hallCInfospot = new PANOLENS.Infospot(400, '../../../asset/location_point.gif');
hallFInfospot = new PANOLENS.Infospot(400, '../../../asset/location_point.gif');
endingInfospot = new PANOLENS.Infospot(10e-7);

hallAInfospot.position.set(4610.04, 1280.07, 1431.29);
hallBInfospot.position.set(4637.61, -798.12, -1671.24);
hallCInfospot.position.set(1934.61, -2611.69, -3792.91);
hallFInfospot.position.set(-3348.82, 3705.92, 45.54);
endingInfospot.position.set(-3461.4, -3592.37, -241.38);

hallAInfospot.addHoverElement(document.getElementById('desc-meter'), 200)
hallBInfospot.addHoverText('Valve', 50);
hallCInfospot.addHoverText('Seat', 50);
hallFInfospot.addHoverText('Box', 50);

// Panorama
panorama = new PANOLENS.ImagePanorama('../../../asset/StreetView360.jpg');
panorama.addEventListener('progress', onProgress);
panorama.addEventListener('load', onLoad);
panorama.addEventListener('enter', onEnter);
panorama.add(hallAInfospot, hallBInfospot, hallCInfospot, hallFInfospot, endingInfospot);

// Viewer
viewer = new PANOLENS.Viewer({ initialLookAt: new THREE.Vector3(0, 0, 5000) });
viewer.OrbitControls.enabled = true;
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
    console.log(dy)
    $("#compassplace").css('transform', 'rotate(' + dy + 'deg)');
});