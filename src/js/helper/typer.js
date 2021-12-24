var typer = function(stringArray, onComplete, startDelay) {
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