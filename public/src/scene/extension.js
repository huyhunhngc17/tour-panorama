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

function onChangePanorama(panorama) {

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