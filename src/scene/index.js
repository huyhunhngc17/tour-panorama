import Hint from './hint/hint'


var progressElement = document.querySelector('#progress');

var tweeningDelay = 300,
    typeStartDelay = 1000,
    typeSpeed = 50;

var paragraphs = {
    welcome: ['Panolens Presents', 'A Journey to a <strong>Train</strong>', 'Here we go'],
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

function delayExecute(func, delay) {
    setTimeout(func, delay);
}

function onLoad() {
    type(paragraphs.welcome, onWelcomeComplete, 2000);
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
    delayExecute(meterInfospot.focus.bind(meterInfospot), tweeningDelay);
    type(paragraphs.meter, onMeterTourComplete);
}

function onMeterTourComplete() {
    delayExecute(valveInfospot.focus.bind(valveInfospot), tweeningDelay);
    type(paragraphs.valve, onValveTourComplete);
}

function onValveTourComplete() {
    delayExecute(seatInfospot.focus.bind(seatInfospot), tweeningDelay);
    type(paragraphs.seat, onSeatTourComplete);
}

function onSeatTourComplete() {
    delayExecute(topboxInfospot.focus.bind(topboxInfospot), tweeningDelay);
    type(paragraphs.box, onTopboxTourComplete);
}

function onTopboxTourComplete() {
    delayExecute(endingInfospot.focus.bind(endingInfospot), tweeningDelay);
    type(paragraphs.ending, function() { viewer.OrbitControls.enabled = true; });
}

function type(stringArray, onComplete, startDelay) {
    onComplete = onComplete || function() {};
    startDelay = startDelay >= 0 ? startDelay : typeStartDelay;

    typed = new Typed("#typed", {
        strings: stringArray,
        typeSpeed: typeSpeed,
        showCursor: false,
        startDelay: startDelay,
        onComplete: onComplete
    });
}

meterInfospot = new PANOLENS.Infospot();
valveInfospot = new PANOLENS.Infospot();
seatInfospot = new PANOLENS.Infospot();
topboxInfospot = new PANOLENS.Infospot();
endingInfospot = new PANOLENS.Infospot(10e-7);

meterInfospot.position.set(4610.04, 1280.07, 1431.29);
valveInfospot.position.set(4637.61, -798.12, -1671.24);
seatInfospot.position.set(1934.61, -2611.69, -3792.91);
topboxInfospot.position.set(-3348.82, 3705.92, 45.54);
endingInfospot.position.set(-3461.4, -3592.37, -241.38);

meterInfospot.addHoverElement(document.getElementById('desc-meter'), 200)
valveInfospot.addHoverText('Valve', 50);
seatInfospot.addHoverText('Seat', 50);
topboxInfospot.addHoverText('Box', 50);

// Panorama
panorama = new PANOLENS.ImagePanorama('../../../asset/StreetView360.jpg');
panorama.addEventListener('progress', onProgress);
panorama.addEventListener('load', onLoad);
panorama.addEventListener('enter', onEnter);
panorama.add(meterInfospot, valveInfospot, seatInfospot, topboxInfospot, endingInfospot);

// Viewer
viewer = new PANOLENS.Viewer({ initialLookAt: new THREE.Vector3(0, 0, 5000) });
viewer.OrbitControls.enabled = false;
viewer.add(panorama);