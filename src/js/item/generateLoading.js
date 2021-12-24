function generateProgressManager() {
    var manager = {},
        animationEndEvents, launchElement, subtitleTextElement, maskElement, loadingElement, enterElement, ytElements, progressTextElement;

    animationEndEvents = ['animationend', 'webkitAnimationEnd'];
    launchElement = document.getElementById('launch-page');
    subtitleTextElement = document.getElementById('subtitle-text');
    maskElement = document.getElementById('progress-container-mask');
    loadingElement = document.getElementById('progress-indicator');
    enterElement = document.getElementById('enter-button');
    progressTextElement = document.getElementById('progress-text');

    animationEndEvents.forEach(function(event) {
        subtitleTextElement.addEventListener(event, function() {
            loadingElement.classList.add('ready');
            loadFont();
        });
    });

    manager.total = 0;
    manager.loaded = 0;

    manager.addTotal = function(count) {
        this.total += typeof count === 'number' ? count : 1;
    };

    manager.addLoaded = function(count) {
        this.loaded += typeof count === 'number' ? count : 1;
        this.checkProgress();
    };

    manager.checkProgress = function() {
        // Finish loading
        if (this.total === this.loaded) {
            maskElement.classList.add('ready');
            // Add class to newly generated iframes
            ytElements = document.getElementsByClassName('yt-iframe');
            for (var i = 0; i < ytElements.length; i++) {
                ytElements[i].classList.add('ready');
            }
        }
        progressTextElement.textContent = Math.round(this.loaded / this.total * 100);
    };

    enterElement.addEventListener('mouseenter', function() {
        maskElement.classList.contains('ready') && SOUND_OVER && SOUND_OVER.play();
    }, true);

    enterElement.addEventListener('mouseleave', function() {
        maskElement.classList.contains('ready') && SOUND_OVER && SOUND_OVER.stop();
    }, true);

    enterElement.addEventListener('click', function() {
        if (manager.total === manager.loaded && !launchElement.classList.contains('hide')) {
            SOUND_CLICK.play();
            launchElement.classList.add('hide');
            setTimeout(function() {
                entryPanorama && entryPanorama.tiles && entryPanorama.tiles.show();
            }, 1500);
        }
    }, false);
    return manager;
}