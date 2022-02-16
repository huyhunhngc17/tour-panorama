var theater = function() {

    'use strict';

    var tileLength = 30,
        border = 1,
        radius = 100,
        movies = { 'All': { 'results': [] } },
        loaded = {},
        css3dWidget;
    var progressManager, entryPanorama, moviePanorama, viewer, videoWall, renderer, SOUND_OVER, SOUND_CLICK;

    var categories = [
        { id: 28, size: '1x1', position: { x: -2.5, y: 0.5 }, name: "Action" },
        { id: 12, size: '1x1', position: { x: -2.5, y: -0.5 }, name: "Adventure" },
        { id: -1, size: '2x2', position: { x: -1, y: 0 }, name: "Popular" },
        { id: 35, size: '1x1', position: { x: 0.5, y: 0.5 }, name: "Comedy" },
        { id: 14, size: '1x1', position: { x: 0.5, y: -0.5 }, name: "Fantasy" },
        { id: 878, size: '2x1', position: { x: 2, y: 0.5 }, name: "Science Fiction" },
        { id: 10770, size: '2x1', position: { x: 2, y: -0.5 }, name: "TVMovie" },
        { id: -1, size: '2x1', position: { x: -2, y: -1.5 }, name: "Now Playing" },
        { id: -1, size: '2x1', position: { x: 0, y: -1.5 }, name: "Upcoming" },
        { id: -1, size: '1x1', position: { x: 1.5, y: -1.5 }, name: "Top Rated" },
        { id: 80, size: '1x1', position: { x: 2.5, y: -1.5 }, name: "Crime" }
    ];

    progressManager = generateProgressManager();

    function loadFont() {

        // Load bmfont
        PANOLENS.Utils.loadBMFont({
            font: 'asset/fnt/Lato-Regular-64.fnt',
            image: 'asset/fnt/lato.png'
        }, init);

    }

    function init() {

        SOUND_OVER = new Audio('asset/audio/over.mp3');
        SOUND_OVER.stop = function() {
            this.currentTime = 0;
            this.pause();
        };
        SOUND_CLICK = new Audio('asset/audio/click.mp3');
        SOUND_CLICK.stop = function() {
            this.currentTime = 0;
            this.pause();
        };

        // Initialize Viewer
        viewer = new PANOLENS.Viewer();

        css3dWidget = generateCSS3DVideoElement();
        entryPanorama = getEntryPanorama();
        moviePanorama = getMoviePanorama();
        videoWall = getSpiralMovieWall();

        entryPanorama.add(videoWall);

        viewer.add(entryPanorama, moviePanorama);
        viewer.getContainer().style.position = 'fixed';
        viewer.getContainer().style.top = 0;
        viewer.getContainer().style.background = 'transparent';
    }

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

    function getEntryPanorama() {

        var panorama, tiles, tile, text, shade, shadeHeight, menu_classified, menu_all;

        shadeHeight = 5;

        panorama = new PANOLENS.EmptyPanorama();

        progressManager.addTotal(categories.length);
        tiles = generateClassifiedWall(categories);
        panorama.tiles = tiles;
        panorama.add(tiles);

        menu_classified = generateMenuItem('CLASSIFIED', 360, 28, 6, tiles);
        menu_classified.position.set(-18, tiles.position.y + 38, tiles.position.z);
        menu_classified.addEventListener('click-entity', function() {
            if (panorama.selection === this) { return; }
            tiles.show();
            videoWall.hide();
            panorama.selection.tweens['colorLeave'].start();
            panorama.selection = this;
        });
        panorama.add(menu_classified);

        menu_all = generateMenuItem('ALL', 140, 11, 6, tiles);
        menu_all.position.set(15, tiles.position.y + 38, tiles.position.z);
        menu_all.addEventListener('click-entity', function() {
            if (panorama.selection === this) { return; }
            tiles.hide();
            if (!videoWall.finished) {
                new TWEEN.Tween(this)
                    .to({}, (tiles.children.length + 5) * 50)
                    .onComplete(function() {
                        videoWall.finished = true;
                        videoWall.animation.start();
                        videoWall.show();
                    })
                    .start();
            } else {
                videoWall.show();
            }
            panorama.selection.tweens['colorLeave'].start();
            panorama.selection = this;
        });

        panorama.add(menu_all);
        panorama.selection = menu_classified;
        menu_classified.tweens['colorEnter'].start();

        return panorama;

    }

    function getMoviePanorama() {

        var panorama, poster, still, placeholder, overview, title, movie, release, release_edge, rating, pagination, backButton, backText, rightButton, leftButton, backdrops, noImageURL, gap = 8;

        panorama = new PANOLENS.EmptyPanorama();
        panorama.movieIndex = 0;

        noImageURL = 'asset/textures/no-image.jpg';

        // Go back button
        backButton = new PANOLENS.Tile(6, 6);
        backButton.rotation.y = Math.PI;
        backButton.scale.multiplyScalar(1 / 2);
        backButton.position.set(28, 5, 0);
        backButton.material.transparent = true;
        backButton.tween('translateBack', backButton.position, { z: 2 });
        backButton.tween('translateFront', backButton.position, { z: 0 });
        backButton.addEventListener('hoverenter', function() {
            SOUND_OVER.play();
        });
        backButton.addEventListener('hoverleave', function() {
            SOUND_OVER.stop();
        });
        backButton.addEventListener('pressstart', function() {
            this.tweens['translateFront'].stop();
            this.tweens['translateBack'].start();
        });
        backButton.addEventListener('pressstop', function() {
            this.tweens['translateBack'].stop();
            this.tweens['translateFront'].start();
        });
        backButton.addEventListener('click', function() {
            SOUND_CLICK.stop();
            SOUND_CLICK.play();
            this.ripple();
            back();
        });

        backText = new PANOLENS.SpriteText('back', 300);
        backText.rotation.y = Math.PI;
        backText.scale.multiplyScalar(1.5);
        backText.position.set(18, 3.5, 0);
        backText.addEventListener('click', back);
        backButton.add(backText);

        PANOLENS.Utils.TextureLoader.load('asset/textures/back.png', setClampTexture.bind(backButton));

        // Movie poster
        poster = new PANOLENS.Tile(tileLength * 1.2 / 1.5, tileLength * 1.2);
        poster.material.opacity = 0;
        poster.position.set(0, -20, -30);
        poster.scale.multiplyScalar(1 / 2);
        poster.rotation.y = Math.PI;
        poster.tween('fadeIn', poster.material, { opacity: 1 }, 1000);
        poster.tween('translateTop', poster.position, { y: 10, z: 0 }, 2000, TWEEN.Easing.Cubic.Out, 1000, null, null, function() { loadVideoSource(panorama.movie && panorama.movie.trailer && panorama.movie.trailer.youtube && panorama.movie.trailer.youtube[0] && panorama.movie.trailer.youtube[0].source); });
        poster.moveTop = function() {
            this.tweens['fadeIn'].start();
            this.tweens['translateTop'].start();
        };
        poster.reset = function() {
            this.ripple();
            this.material.opacity = 0;
            this.position.set(0, -20, -30);
        };

        // Movie mask for movie trailer
        still = new PANOLENS.Tile(tileLength * 4, tileLength * 2);
        still.position.set(radius * Math.cos(Math.PI / 2), 0, -radius * Math.sin(Math.PI / 2));
        still.material.color = new THREE.Color(0x000000);
        still.material.opacity = 0;
        still.material.blending = THREE.NoBlending;
        still.addEventListener('click-entity', function(e) {
            SOUND_CLICK.stop();
            SOUND_CLICK.play();
            css3dWidget.paused = !css3dWidget.paused;
            css3dWidget.update();
            if (!css3dWidget.paused) {
                placeholder.tweens['fadeOut'].start();
            } else {
                placeholder.tweens['fadeIn'].start();
            }
        });

        // Video play icon placeholder
        placeholder = new PANOLENS.Tile(tileLength / 2, tileLength / 2);
        placeholder.material.opacity = 0;
        placeholder.setEntity(still);
        placeholder.passThrough = true;
        placeholder.position.set(0, 0, 1);
        placeholder.reset = function(hide) {
            hide ? placeholder.tweens['fadeOut'].start() : placeholder.tweens['fadeIn'].start();
        };
        placeholder.tween('fadeOut', placeholder.material, { opacity: 0 });
        placeholder.tween('fadeIn', placeholder.material, { opacity: 1 });
        PANOLENS.Utils.TextureLoader.load('asset/textures/video-play.png', setClampTexture.bind(placeholder));
        still.add(placeholder);

        // Navigation buttons
        rightButton = generateNavigationButton();
        rightButton.position.set(tileLength * 2.5, 0, 0);
        rightButton.addEventListener('click-entity', function() {
            panorama.movieIndex = panorama.movieIndex + 1 > movies[panorama.category].results.length - 1 ?
                0 :
                panorama.movieIndex + 1;
            panorama.updateMovie(movies[panorama.category].results[panorama.movieIndex]);
        });
        rightButton.poster.position.set(tileLength, 0, 0);

        leftButton = generateNavigationButton();
        leftButton.position.set(-tileLength * 2.5, 0, 0);
        leftButton.addEventListener('click-entity', function() {
            panorama.movieIndex = panorama.movieIndex - 1 < 0 ?
                movies[panorama.category].results.length - 1 :
                panorama.movieIndex - 1;
            panorama.updateMovie(movies[panorama.category].results[panorama.movieIndex]);
        });
        leftButton.poster.position.set(-tileLength, 0, 0);

        PANOLENS.Utils.TextureLoader.load('asset/textures/arrow-right.png', setClampTexture.bind(rightButton));
        PANOLENS.Utils.TextureLoader.load('asset/textures/arrow-left.png', setClampTexture.bind(leftButton));

        // Backdrop wall
        backdrops = generateBackdropWall();
        backdrops.position.z = -radius;

        // Movie title
        title = new PANOLENS.SpriteText('title', tileLength * 4 * 10);
        title.rotation.y = Math.PI;
        title.scale.multiplyScalar(2);
        title.position.set(0, 38, 1);

        // Movie release date widget
        release = generateDateWidget(10, 12);
        release.scale.multiplyScalar(1 / 2);
        release.rotation.y = Math.PI;
        release.position.set(-18, 5, 0);
        release_edge = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.PlaneGeometry(10, 12, 1, 1)),
            new THREE.LineBasicMaterial({ color: 0xffffff })
        );

        release.add(release_edge);

        // Movie rating widget
        rating = generateRatingWidget(10, 10, 5, 6);
        rating.scale.multiplyScalar(1 / 2);
        rating.position.set(-26, 5, 0);

        // Movie overview
        overview = new PANOLENS.SpriteText('overview', tileLength * 4 * 24.8);
        overview.rotation.y = Math.PI;
        overview.scale.multiplyScalar(0.8);
        overview.position.set(0, -35, 1);

        // Movie trailer pagination
        pagination = generatePaginationWidget();
        pagination.position.set(0, -33, 1);

        title.add(poster, backButton, release, rating);
        still.add(title, overview, pagination, rightButton, leftButton);

        panorama.poster = poster;
        panorama.still = still;
        panorama.backdrops = backdrops;
        panorama.pagination = pagination;
        panorama.placeholder = placeholder;

        panorama.visible = false;
        panorama.add(still, backdrops);

        panorama.updateMovie = function(movie) {

            var rightIndex, leftIndex, lists, posterURL, l_posterURL, r_posterURL;

            // Reset movie components
            this.resetMovie();

            title.update({ text: movie.title });
            overview.update({ text: movie.overview });
            rating.update({ text: movie.vote_average.toFixed(1).toString(), voteCount: movie.vote_count });
            release.update(movie.release_date);

            // Left / Right Posters
            lists = movies[this.category].results;
            rightIndex = this.movieIndex + 1 > lists.length - 1 ? 0 : this.movieIndex + 1;
            leftIndex = this.movieIndex - 1 < 0 ? lists.length - 1 : this.movieIndex - 1;
            rightButton.text.update({ text: lists[rightIndex].title });
            leftButton.text.update({ text: lists[leftIndex].title });

            // Adjustment
            this.adjustComponents();

            // Start entering animation
            poster.moveTop();
            rating.fadeIn();

            // Update textures
            posterURL = movie.poster_path ? addMovieDBImagePrefix(movie.poster_path).replace('/w185/', '/w500/') : noImageURL;
            l_posterURL = lists[rightIndex].poster_path ? addMovieDBImagePrefix(lists[rightIndex].poster_path).replace('/w185/', '/w500/') : noImageURL;
            r_posterURL = lists[leftIndex].poster_path ? addMovieDBImagePrefix(lists[leftIndex].poster_path).replace('/w185/', '/w500/') : noImageURL;
            PANOLENS.Utils.TextureLoader.load(posterURL, setClampTexture.bind(poster));
            PANOLENS.Utils.TextureLoader.load(l_posterURL, setClampTexture.bind(rightButton.poster));
            PANOLENS.Utils.TextureLoader.load(r_posterURL, setClampTexture.bind(leftButton.poster));

            // Get movie information
            getMovieImages(this, { id: movie.id });
            getMovieTrailers(this, { id: movie.id });

            this.movie = movie;

        };

        panorama.adjustComponents = function() {

            title.position.y = leftButton.text.position.y = rightButton.text.position.y = tileLength + gap;
            backdrops.position.y = -5;

            title.position.y += Math.floor(title.getLayout().height / 70) * 5;
            rightButton.text.position.y += Math.floor(rightButton.text.getLayout().height / 70) * 1.8;
            leftButton.text.position.y += Math.floor(leftButton.text.getLayout().height / 70) * 1.8;
            backdrops.position.y -= (Math.floor(overview.getLayout().height / 70) - 2) * 1.5;
        };

        panorama.resetMovie = function() {

            css3dWidget && css3dWidget.reset();
            poster && poster.reset();
            placeholder && placeholder.reset(true);
            backdrops && backdrops.reset();
            rating && rating.reset();

        };

        panorama.addEventListener('enter', function() {

            this.updateMovie(this.movie);

        });

        return panorama;

    }

    function getGenreMovies(target, options) {

        theMovieDb.genres.getMovies(options, getListSuccess.bind(target), error);

    }

    function getPopularMovies(target, options) {

        theMovieDb.movies.getPopular(options, getListSuccess.bind(target), error);

    }

    function getUpcomingMovies(target, options) {

        theMovieDb.movies.getUpcoming(options, getListSuccess.bind(target), error);

    }

    function getNowPlayingMovies(target, options) {

        theMovieDb.movies.getNowPlaying(options, getListSuccess.bind(target), error);

    }

    function getTopRatedMovies(target, options) {

        theMovieDb.movies.getTopRated(options, getListSuccess.bind(target), error);

    }

    function getMovieImages(target, options) {

        theMovieDb.movies.getImages(options, getImagesSuccess.bind(target), error);

    }

    function getMovieTrailers(target, options) {

        theMovieDb.movies.getTrailers(options, getTrailerSuccess.bind(target), error);

    }

    function getMovies(tile) {

        var page = 1,
            pageSize = 20;

        if (movies[tile.category]) {
            page = movies[tile.category].results.length / pageSize + 1;
        }

        if (page > 1) {
            return;
        }

        switch (tile.category) {
            case 'Popular':
                getPopularMovies(tile, { page: page });
                break;
            case 'Now Playing':
                getNowPlayingMovies(tile, { page: page });
                break;
            case 'Upcoming':
                getUpcomingMovies(tile, { page: page });
                break;
            case 'Top Rated':
                getTopRatedMovies(tile, { page: page });
                break;
            case 'Action':
            case 'Adventure':
            case 'Comedy':
            case 'Fantasy':
            case 'Science Fiction':
            case 'TVMovie':
            case 'Crime':
                getGenreMovies(tile, { id: tile.categoryId, page: page });
                break;
        }

    }

    function getListSuccess(result) {

        var scope = this,
            symbolicMovie;

        result = JSON.parse(result);

        if (result) {
            if (movies[this.category]) {
                movies[this.category].results = movies[this.category].results.concat(result.results);
            } else {
                movies[this.category] = result;
                result.results.map(function(movie) {
                    if (!symbolicMovie && !loaded[movie.id] && movie.poster_path) {
                        symbolicMovie = movie;
                        loaded[movie.id] = movie;
                    }
                });
                result.results.splice(result.results.indexOf(symbolicMovie), 1);
                result.results.unshift(symbolicMovie);

                PANOLENS.Utils.TextureLoader.load(addMovieDBImagePrefix(symbolicMovie.poster_path).replace('/w185/', '/w500/'), setImageTexture.bind(this, progressManager.addLoaded.bind(progressManager)), undefined, progressManager.addLoaded.bind(progressManager));

                progressManager.addTotal(result.results.length);
                videoWall.addMovies(result.results);
            }
            movies['All'].results = movies['All'].results.concat(result.results);
        }

    }

    function getImagesSuccess(result) {

        var scope = this,
            imageArray = [],
            theta, vector = new THREE.Vector3();

        this.movie.images = JSON.parse(result);

        for (var i = 0; i < this.backdrops.children.length; i++) {
            if (i < this.movie.images.backdrops.length) {
                this.backdrops.children[i].visible = true;
                this.backdrops.children[i].src = addMovieDBImagePrefix(this.movie.images.backdrops[i].file_path);
                PANOLENS.Utils.TextureLoader.load(this.backdrops.children[i].src, setClampTexture.bind(this.backdrops.children[i]));
            } else {
                this.backdrops.children[i].visible = false;
            }
        }

    }

    function getTrailerSuccess(result) {

        var trailer, source;
        trailer = JSON.parse(result);
        if (trailer && trailer.youtube && trailer.youtube.length > 0) {
            source = trailer.youtube[0].source;
        }

        this.movie.trailer = trailer;
        this.pagination && this.pagination.update(trailer && trailer.youtube || []);

    }

    function error(result) {
        console.log(result);
    }

    function setImageTexture(texture) {
        if (arguments.length > 1) {
            var callback = arguments[0];
            texture = arguments[1];
            callback && callback();
        }
        var ratio = texture.image.width / texture.image.height *
            this.geometry.parameters.height / this.geometry.parameters.width;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, ratio);
        texture.offset.y = 1 - ratio;
        texture.offset._y = texture.offset.y;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        this.material.map = texture;
        this.material.needsUpdate = true;
    }

    function setClampTexture(texture) {
        var callback;
        if (arguments.length > 1) {
            callback = arguments[0];
            texture = arguments[1];
            callback();
        }
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        this.material.visible = true;
        this.material.map = texture;
        this.material.needsUpdate = true;
    }

    function loadVideoSource(videoId) {
        var url, reset;
        if (videoId) {
            url = 'https://www.youtube.com/embed/' + videoId + '?rel=0&autoplay=0&controls=0&showinfo=0&enablejsapi=1&iv_load_policy=3&playsinline=1&webkit-playsinline=1';
        } else {
            url = 'asset/textures/no-video.jpg';
            reset = true;
        }
        css3dWidget.load(url);
        css3dWidget.paused = true;
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

    function generateClassifiedWall(categories) {

        var tiles = new THREE.Object3D(),
            shadeHeight = 5,
            staggering = 50;

        tiles.position.y = 10;
        tiles.position.z = -radius;
        tiles.isHidden = true;
        tiles.show = function() {
            this.children.forEach(function(tile, index) {
                if (tile instanceof PANOLENS.Tile) {
                    tile.tweens['moveBack'].stop();
                    tile.tweens['fadeOut'].stop();
                    tile.shade.tweens['fadeOut'].stop();
                    tile.shade.text.tweens['fadeOut'].stop();
                    tile.tweens['moveFront'].start();
                    tile.tweens['fadeIn'].start();
                    tile.shade.tweens['fadeIn'].start();
                    tile.shade.text.tweens['fadeIn'].onComplete(function() { tiles.isHidden = false; }).start();
                }
            });

        };
        tiles.hide = function() {
            this.children.forEach(function(tile, index) {
                if (tile instanceof PANOLENS.Tile) {
                    tile.tweens['moveFront'].stop();
                    tile.tweens['fadeIn'].stop();
                    tile.shade.tweens['fadeIn'].stop();
                    tile.shade.text.tweens['fadeIn'].stop();
                    tile.edge.fadeInAnimation.stop();
                    tile.tweens['moveBack'].start();
                    tile.tweens['fadeOut'].start();
                    tile.shade.tweens['fadeOut'].start();
                    tile.shade.text.tweens['fadeOut'].start();
                    tile.edge.fadeOutAnimation.start();
                }
            });
            tiles.isHidden = true;
        };

        for (var i = 0; i < categories.length; i++) {

            var wUnit, hUnit, width, height, size, position, tile, text, shade, edge;

            size = categories[i].size.split('x');
            position = categories[i].position;

            wUnit = parseFloat(size[0]);
            hUnit = parseFloat(size[1]);

            width = tileLength * wUnit - 2 * border;
            height = tileLength * hUnit - 2 * border;

            tile = new PANOLENS.Tile(width, height);
            tile.position.set(position.x * tileLength, position.y * tileLength, -30);
            tile.material.opacity = 0;
            tile.category = categories[i].name;
            tile.categoryId = categories[i].id;
            tile.scrollAnimationId = undefined;
            tile.renderOrder = 1;
            tile.tween('moveBack', tile.position, { z: -30 }, 1000, undefined, i * staggering);
            tile.tween('moveFront', tile.position, { z: 0 }, 1000, undefined, i * staggering);
            tile.tween('fadeOut', tile.material, { opacity: 0 }, 1000, undefined, i * staggering, null, null, makeInvisible.bind(tile));
            tile.tween('fadeIn', tile.material, { opacity: 1 }, 1000, undefined, i * staggering, makeVisible.bind(tile), null, null);
            tile.addEventListener('click-entity', function() {
                SOUND_CLICK.stop();
                SOUND_CLICK.play();
                moviePanorama.movieData = movies[this.category];
                moviePanorama.movie = moviePanorama.movieData.results[0];
                moviePanorama.category = this.category;
                moviePanorama.movieIndex = 0;
                viewer.panorama.visible = false;
                setPanorama(moviePanorama);
            });

            edge = new THREE.LineSegments(
                new THREE.EdgesGeometry(tile.geometry),
                new THREE.LineBasicMaterial({ color: 0xffffff })
            );
            edge.material.transparent = true;
            edge.material.opacity = 0;
            edge.matrixAutoUpdate = true;
            edge.fadeOutAnimation = new TWEEN.Tween(edge.material)
                .to({ opacity: 0 }, 1000)
                .easing(TWEEN.Easing.Exponential.Out);
            edge.fadeInAnimation = new TWEEN.Tween(edge.material)
                .to({ opacity: 1 }, 1000)
                .easing(TWEEN.Easing.Exponential.Out);
            tile.edge = edge;
            tile.add(edge);

            shade = new PANOLENS.Tile(width + 2, shadeHeight + 2);
            shade.position.set(0, (shadeHeight - height) / 2, 0.1);
            shade.material.opacity = 0;
            shade.material.color.set(0x000000);
            shade.renderOrder = 2;
            shade.setEntity(tile);
            shade.passThrough = true;
            shade.tween('fadeOut', shade.material, { opacity: 0 }, 1000, undefined, i * staggering, null, null, makeInvisible.bind(shade));
            shade.tween('fadeIn', shade.material, { opacity: 0.7 }, 1000, undefined, i * staggering, makeVisible.bind(shade), null, null);
            tile.shade = shade;
            tile.add(shade);

            text = new PANOLENS.SpriteText(categories[i].name, 500 * wUnit);
            text.mesh.material.uniforms.opacity.value = 0;
            text.rotation.y = Math.PI;
            text.position.set(0, (hUnit < 2 ? 2.2 : 1.2) * hUnit, 0.2);
            text.renderOrder = 3;
            text.setEntity(tile);
            text.passThrough = true;
            text.tween('fadeOut', text.mesh.material.uniforms.opacity, { value: 0 }, 300, undefined, i * staggering, null, null, makeInvisible.bind(text));
            text.tween('fadeIn', text.mesh.material.uniforms.opacity, { value: 1 }, 300, undefined, i * staggering, makeVisible.bind(text), null, null);
            shade.text = text;
            shade.add(text);

            tile.addEventListener('hoverenter', function(event) {

                if (!this.material.map || tiles.isHidden) { return; }

                SOUND_OVER.play();

                var scope = this,
                    offset = this.material.map.offset;

                this.edge.fadeOutAnimation.stop();
                this.edge.fadeInAnimation.start();

                window.cancelAnimationFrame(this.scrollAnimationId);
                scrollDown();

                function scrollDown() {

                    if (offset.y <= 0) {

                        offset.y = 0;

                    } else {

                        offset.y -= (offset.y >= 0.01) ? 0.01 : offset.y;
                        scope.scrollAnimationId = window.requestAnimationFrame(scrollDown);

                    }

                }

            });

            tile.addEventListener('hoverleave', function(event) {

                if (!this.material.map) { return; }

                SOUND_OVER.stop();

                var scope = this,
                    offset = this.material.map.offset;

                this.edge.fadeInAnimation.stop();
                this.edge.fadeOutAnimation.start();

                window.cancelAnimationFrame(this.scrollAnimationId);
                scrollUp();

                function scrollUp() {

                    if (offset.y >= offset._y) {

                        offset.y = offset._y;

                    } else {

                        offset.y += (offset._y - offset.y <= 0.01) ? offset._y - offset.y : 0.01;
                        scope.scrollAnimationId = window.requestAnimationFrame(scrollUp);

                    }

                }

            });

            getMovies(tile);
            tiles.add(tile);

        }

        return tiles;

    }

    function generatePaginationWidget() {

        var widget, MAX_PAGE = 5,
            dots = [],
            dot, gap = 10;

        widget = new THREE.Object3D();
        widget.selection = undefined;

        for (var i = 0; i < MAX_PAGE; i++) {
            dot = new PANOLENS.Tile(1.5, 1.5);
            dot.material.color.set(0xffffff);
            dot.visible = false;
            dot.tween('scaleup', dot.scale, { x: 1.4, y: 1.4, z: 1.4 }, 500, TWEEN.Easing.Elastic.Out);
            dot.tween('scaledown', dot.scale, { x: 1, y: 1, z: 1 }, 500, TWEEN.Easing.Elastic.Out);
            dot.tween('colorIn', dot.material.color, { r: 236 / 256, g: 240 / 256, b: 241 / 256 });
            dot.tween('colorOut', dot.material.color, { r: 52 / 256, g: 73 / 256, b: 94 / 256 });
            dot.addEventListener('hoverenter', function() {
                SOUND_OVER.play();
                if (widget.selection === this) { return; }
                this.tweens['scaleup'].start();
            });
            dot.addEventListener('hoverleave', function() {
                SOUND_OVER.stop();
                if (widget.selection === this) { return; }
                this.tweens['scaledown'].start();
            });
            dot.addEventListener('click', function() {
                SOUND_CLICK.stop();
                SOUND_CLICK.play();
                this.ripple();
                if (this.source) {
                    loadVideoSource(this.source);
                }
                if (widget.selection === this) { return; }
                if (widget.selection) {
                    widget.selection.tweens['scaleup'].stop();
                    widget.selection.tweens['scaledown'].start();
                    widget.selection.tweens['colorIn'].stop();
                    widget.selection.tweens['colorOut'].start();
                }
                widget.selection = this;
                this.tweens['colorIn'].start();
            });
            PANOLENS.Utils.TextureLoader.load('asset/textures/circle.png', setClampTexture.bind(dot));
            dot.tweens['colorOut'].start();
            dots.push(dot);
            widget.add(dot);
        }

        widget.update = function(array) {

            if (this.selection) {
                this.selection.tweens['scaleup'].stop();
                this.selection.tweens['scaledown'].start();
                this.selection.tweens['colorIn'].stop();
                this.selection.tweens['colorOut'].start();
            }

            var count = (array.length <= MAX_PAGE) ? array.length : MAX_PAGE;

            for (var i = 0; i < MAX_PAGE; i++) {
                if (i < count) {
                    dots[i].source = array[i].source;
                    dots[i].visible = true;
                    dots[i].position.x = i * gap - (count - 1) / 2 * gap;
                } else {
                    dots[i].visible = false;
                }
            }

            this.selection = dots[0];
            this.selection.tweens['scaleup'].start();
            this.selection.tweens['colorIn'].start();

        };

        return widget;

    }

    function generateDateWidget(width, height) {

        var widget, day, month, year, message;

        widget = new PANOLENS.Tile(width, height);
        widget.material.visible = false;

        day = new PANOLENS.SpriteText('23', tileLength * 8);
        day.setEntity(widget);
        day.passThrough = true;
        day.rotation.y = Math.PI;
        day.scale.multiplyScalar(1.6);
        day.position.set(6.5, height * 0.5, 0);

        month = new PANOLENS.SpriteText('APR', tileLength * 8);
        month.setEntity(widget);
        month.passThrough = true;
        month.rotation.y = Math.PI;
        month.scale.multiplyScalar(0.9);
        month.position.set(2.7, 0, 0);

        year = new PANOLENS.SpriteText('2016', tileLength * 8);
        year.setEntity(widget);
        year.passThrough = true;
        year.rotation.y = Math.PI;
        year.scale.multiplyScalar(0.7);
        year.position.set(1.5, -height * 0.25, 0);

        message = new PANOLENS.SpriteText('Release Date', tileLength * 13);
        message.rotation.y = Math.PI;
        message.mesh.material.uniforms.opacity.value = 0;
        message.scale.multiplyScalar(0.5);
        message.position.set(0.2, height * 0.75, 0);
        message.tween('fadeIn', message.mesh.material.uniforms.opacity, { value: 1 }, 1000);
        message.tween('fadeOut', message.mesh.material.uniforms.opacity, { value: 0 }, 1000);

        widget.add(day, month, year, message);
        widget.addEventListener('hoverenter', function() {
            SOUND_OVER.play();
            message.tweens['fadeOut'].stop();
            message.tweens['fadeIn'].start();
        });
        widget.addEventListener('hoverleave', function() {
            SOUND_OVER.stop();
            message.tweens['fadeIn'].stop();
            message.tweens['fadeOut'].start();
        });
        widget.update = function(date) {

            var _day, _month, _year;

            _year = date.split('-')[0];
            _month = date.split('-')[1];
            _day = date.split('-')[2];

            switch (_month) {
                case '01':
                    _month = 'JAN';
                    break;
                case '02':
                    _month = 'FEB';
                    break;
                case '03':
                    _month = 'MAR';
                    break;
                case '04':
                    _month = 'APR';
                    break;
                case '05':
                    _month = 'MAY';
                    break;
                case '06':
                    _month = 'JUN';
                    break;
                case '07':
                    _month = 'JUL';
                    break;
                case '08':
                    _month = 'AUG';
                    break;
                case '09':
                    _month = 'SEP';
                    break;
                case '10':
                    _month = 'OCT';
                    break;
                case '11':
                    _month = 'NOV';
                    break;
                case '12':
                    _month = 'DEC';
                    break;
                default:
                    _month = 'N/A';
            }

            day.update({ text: _day });
            month.update({ text: _month });
            year.update({ text: _year });

        };

        return widget;

    }

    function generateRatingWidget(total, score, innerRadius, outerRadius) {

        var rating, eachRadian, gapRadian, geometry, material, mesh, edge, text, segments = [],
            fills = [],
            delay = 150,
            duration = 1500,
            initialScale = 1.5,
            message, activateArea;

        rating = new THREE.Object3D();

        total = total || 10;
        score = score || 0;
        innerRadius = innerRadius || 1;
        outerRadius = outerRadius || 5;
        eachRadian = Math.PI * 2 / (total + 1);
        gapRadian = eachRadian / (total * 2);

        material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, opacity: 0, transparent: true });

        for (var i = 0; i < total; i++) {

            geometry = new THREE.RingGeometry(innerRadius, outerRadius, 32, 8, i * eachRadian + (2 * i + 1) * gapRadian + Math.PI / 2, eachRadian);

            mesh = new THREE.Mesh(geometry, material.clone());

            edge = new THREE.LineSegments(
                new THREE.EdgesGeometry(geometry),
                new THREE.LineBasicMaterial({ color: 0xffffff })
            );
            edge.material.transparent = true;
            edge.material.opacity = 0;
            edge.matrixAutoUpdate = true;
            edge.scale.multiplyScalar(initialScale);
            edge.fadeInAnimation = new TWEEN.Tween(edge.material)
                .to({ opacity: 1 }, duration)
                .easing(TWEEN.Easing.Quadratic.Out);
            edge.scaleUpAnimation = new TWEEN.Tween(edge.scale)
                .to({ x: 1.1, y: 1.1, z: 1.1 }, duration)
                .easing(TWEEN.Easing.Elastic.Out);
            edge.scaleDownAnimation = new TWEEN.Tween(edge.scale)
                .to({ x: 1, y: 1, z: 1 }, duration)
                .easing(TWEEN.Easing.Elastic.Out);

            segments.push(edge);
            rating.add(edge);

        }

        score = score == 10 ? '1 0' : score.toFixed(1);
        text = new PANOLENS.SpriteText(score, tileLength * 4);
        text.scale.multiplyScalar(1.4);
        text.position.set(-1.6, 3.3, 1);
        rating.add(text);

        rating.update = function(opt) {

            var newscore;

            opt = opt || {};
            opt.text = opt.text || 'N/A';
            opt.voteCount = opt.voteCount || 0;
            score = parseFloat(opt.text);
            newscore = Math.floor(score);

            for (var i = 0; i <= newscore; i++) {

                geometry = new THREE.RingGeometry(innerRadius, outerRadius, 32, 8,
                    i * eachRadian + (2 * i + 1) * gapRadian + Math.PI / 2,
                    i === newscore ? eachRadian * (parseFloat(opt.text) - newscore) : eachRadian
                );

                mesh = new THREE.Mesh(geometry, material.clone());
                mesh.fadeInAnimation = new TWEEN.Tween(mesh.material)
                    .to({ opacity: 1 }, duration)
                    .easing(TWEEN.Easing.Quadratic.Out);
                fills.push(mesh);
                segments[i].add(mesh);

            }

            text.update(opt);
            message.update({ text: opt.voteCount + ' votes' });
        };

        rating.reset = function() {
            segments.map(function(segment, index) {
                segment.traverse(function(child) {
                    child.fadeInAnimation && child.fadeInAnimation.stop();
                    child.scaleDownAnimation && child.scaleDownAnimation.stop();
                    child.material && (child.material.opacity = 0);
                    child.scale.set(initialScale, initialScale, initialScale);
                });
            });

            fills.map(function(fill) {
                fill.parent.remove(fill);
                fill.geometry.dispose();
                fill.material.dispose();
            });

            fills.length = 0;
        };

        rating.fadeIn = function() {
            segments.map(function(segment, index) {
                segment.traverse(function(child) {
                    child.fadeInAnimation && child.fadeInAnimation.delay(index * delay).start();
                    child.scaleDownAnimation && child.scaleDownAnimation.delay(index * delay).start();
                });

            });
        };

        activateArea = new PANOLENS.Tile(outerRadius * 2, outerRadius * 2);
        activateArea.rotation.y = Math.PI;
        activateArea.material.visible = false;
        rating.add(activateArea);

        message = new PANOLENS.SpriteText('0 votes', tileLength * 13);
        message.mesh.material.uniforms.opacity.value = 0;
        message.scale.multiplyScalar(0.5);
        message.position.set(-1, outerRadius * 1.5, 0);
        rating.message = message;
        rating.add(message);

        message.tween('fadeIn', message.mesh.material.uniforms.opacity, { value: 1 }, 1000);
        message.tween('fadeOut', message.mesh.material.uniforms.opacity, { value: 0 }, 1000);

        activateArea.addEventListener('hoverenter', function() {
            SOUND_OVER.play();
            message.tweens['fadeOut'].stop();
            message.tweens['fadeIn'].start();
            for (var i = 0; i < Math.ceil(score); i++) {
                segments[i].scaleDownAnimation.stop();
                segments[i].scaleUpAnimation.start();
            }
        });
        activateArea.addEventListener('hoverleave', function() {
            SOUND_OVER.stop();
            message.tweens['fadeIn'].stop();
            message.tweens['fadeOut'].start();
            for (var i = 0; i < Math.ceil(score); i++) {
                segments[i].scaleUpAnimation.stop();
                segments[i].scaleDownAnimation.start();
            }
        });

        return rating;

    }

    function generateNavigationButton() {

        var button, poster, title, gap;

        gap = 8;

        button = new PANOLENS.Tile(tileLength / 4, tileLength / 2);
        button.material.opacity = 0.5;
        button.tween('translateBack', button.position, { z: -5 });
        button.tween('translateFront', button.position, { z: 0 });
        button.tween('fadeOut', button.material, { opacity: 0.5 });
        button.tween('fadeIn', button.material, { opacity: 1 });
        button.addEventListener('click-entity', function() {
            SOUND_CLICK.stop();
            SOUND_CLICK.play();
            this.ripple();
        });
        button.addEventListener('pressstart-entity', function() {
            this.tweens['translateFront'].stop();
            this.tweens['translateBack'].start();
        });
        button.addEventListener('pressstop-entity', function() {
            this.tweens['translateBack'].stop();
            this.tweens['translateFront'].start();
        });
        button.addEventListener('hoverenter', function() {
            SOUND_OVER.play();
            button.tweens['fadeIn'].start();
            poster.tweens['fadeIn'].start();
            title.tweens['fadeIn'].start();
        });
        button.addEventListener('hoverleave', function() {
            SOUND_OVER.stop();
            button.tweens['fadeOut'].start();
            poster.tweens['fadeOut'].start();
            title.tweens['fadeOut'].start();
        });

        poster = new PANOLENS.Tile(tileLength * 4 / 3, tileLength * 2);
        poster.material.opacity = 0.5;
        poster.setEntity(button);
        poster.tween('fadeOut', poster.material, { opacity: 0.5 });
        poster.tween('fadeIn', poster.material, { opacity: 1 });

        title = new PANOLENS.SpriteText('Movie', 800);
        title.mesh.material.uniforms.opacity.value = 0.5;
        title.tween('fadeOut', title.mesh.material.uniforms.opacity, { value: 0.5 });
        title.tween('fadeIn', title.mesh.material.uniforms.opacity, { value: 1 });
        title.position.y = tileLength + gap;
        title.rotation.y = Math.PI;

        poster.add(title);
        button.add(poster);

        button.text = title;
        button.poster = poster;

        return button;

    }

    function generateBackdropWall() {

        var MAX_BACKDROPS = 50,
            backdrops, backdrop, edge, gap, wrapAmount, vector, easing, duration;

        wrapAmount = 6;
        easing = TWEEN.Easing.Cubic.Out;
        duration = 1000;
        backdrops = new THREE.Object3D();
        gap = tileLength * 0.05;
        vector = new THREE.Vector3(0, 0, radius);

        for (var i = 0; i < MAX_BACKDROPS; i++) {

            backdrop = new PANOLENS.Tile(tileLength * 1.78, tileLength);
            backdrop.material.opacity = 0.5;
            backdrop.position.set(-tileLength * 4.7 + (i % wrapAmount) * tileLength * 1.78 + (2 * (i % wrapAmount) + 1) * gap, -tileLength * 2 - tileLength * parseInt(i / wrapAmount) - (2 * parseInt(i / wrapAmount) + 1) * gap,
                0
            );
            backdrop.tween('moveFront', backdrop.position, { x: 0, y: -radius / 3, z: radius / 1.5 }, duration, easing, 0, null, lookAtVector.bind(backdrop, vector), setOpaque.bind(backdrop));
            backdrop.tween('moveBack', backdrop.position, { x: backdrop.position.x, y: backdrop.position.y, z: backdrop.position.z }, duration, easing, 0, null, null, setSemiTransparent.bind(backdrop));
            backdrop.tween('rotateBack', backdrop.rotation, { x: 0, y: 0, z: 0 }, duration, easing);

            backdrop.addEventListener('hoverenter', function() {
                this.edge.fadeOutAnimation.stop();
                this.edge.fadeInAnimation.start();
                this.material.opacity = 1;
            });
            backdrop.addEventListener('hoverleave', function() {
                this.edge.fadeOutAnimation.start();
                this.edge.fadeInAnimation.stop();
                if (this !== backdrops.selection) {
                    this.material.opacity = 0.5;
                }
            });
            backdrop.addEventListener('click', function() {
                SOUND_CLICK.stop();
                SOUND_CLICK.play();
                var scope = this;
                if (backdrops.selection === this) {
                    backdrops.reset();
                    return;
                } else if (backdrops.selection) {
                    backdrops.selection.tweens['moveBack'].start();
                    backdrops.selection.tweens['rotateBack'].start();
                }
                this.tweens['moveFront'].start();
                backdrops.selection = this;
                if (this.src && this.src.indexOf('/w185/') >= 0) {
                    this.src = this.src.replace('/w185/', '/w780/');
                    PANOLENS.Utils.TextureLoader.load(this.src, setClampTexture.bind(this));
                }

            });

            edge = new THREE.LineSegments(
                new THREE.EdgesGeometry(backdrop.geometry),
                new THREE.LineBasicMaterial({ color: 0xffffff })
            );

            edge.material.transparent = true;
            edge.material.opacity = 0;
            edge.matrixAutoUpdate = true;
            edge.fadeOutAnimation = new TWEEN.Tween(edge.material)
                .to({ opacity: 0 }, 1000)
                .easing(TWEEN.Easing.Exponential.Out);
            edge.fadeInAnimation = new TWEEN.Tween(edge.material)
                .to({ opacity: 1 }, 1000)
                .easing(TWEEN.Easing.Exponential.Out);
            backdrop.edge = edge;
            backdrop.add(edge);

            backdrops.add(backdrop);

        }

        function setSemiTransparent() {
            this.material.opacity = 0.5;
        }

        function setOpaque() {
            this.material.opacity = 1;
        }

        backdrops.selection = undefined;
        backdrops.reset = function(instant) {
            if (this.selection) {
                this.selection.tweens['moveFront'].stop();
                if (instant) {
                    this.selection.tweens['moveBack'].update(duration);
                    this.selection.tweens['rotateBack'].update(duration);
                } else {
                    this.selection.tweens['moveBack'].start();
                    this.selection.tweens['rotateBack'].start();
                }
                this.selection = undefined;
            }
        };

        return backdrops;

    }

    function generateCSS3DVideoElement() {

        var widget, scene, stereoscene, renderer, stereorenderer, iframe, object, stereoobject, scale;

        scale = { x: 2 * 16 / 9, y: 2 };
        widget = { currentTime: 0 };
        scene = new THREE.Scene();
        stereoscene = new THREE.Scene();

        renderer = new THREE.CSS3DRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = 0;
        renderer.domElement.style.backgroundColor = '#000';
        document.body.insertBefore(renderer.domElement, document.body.children[0]);

        stereorenderer = new THREE.CSS3DStereoRenderer();
        stereorenderer.setSize(window.innerWidth, window.innerHeight);
        stereorenderer.domElement.style.position = 'absolute';
        stereorenderer.domElement.style.top = 0;
        stereorenderer.domElement.style.backgroundColor = '#000';
        document.body.insertBefore(stereorenderer.domElement, document.body.children[0]);

        iframe = document.getElementsByClassName('yt-iframe')[0];
        iframe.paused = true;

        object = new THREE.CSS3DObject(iframe);
        object.position.z = -radius * 0.8;
        object.scale.x = tileLength * scale.x / window.innerWidth;
        object.scale.y = tileLength * scale.y / window.innerHeight;
        scene.add(object);

        stereoobject = new THREE.CSS3DStereoObject(iframe);
        stereoobject.position.z = -radius * 0.8;
        stereoobject.scale.x = tileLength * scale.x / window.innerWidth;
        stereoobject.scale.y = tileLength * scale.y / window.innerHeight;
        stereoscene.add(stereoobject);

        // Pre-render
        renderer.render(scene, viewer.getCamera());
        stereorenderer.render(stereoscene, viewer.getCamera());

        viewer.addEventListener('mode-change', function(event) {

            if (event.mode === PANOLENS.Modes.NORMAL) {
                widget.pause();
                sendYTCommand(object.element, 'seekTo', [widget.currentTime, true]);
                renderer.domElement.style.display = 'block';
                stereorenderer.domElement.style.display = 'none';

            } else {
                widget.pause(PANOLENS.Modes.NORMAL);
                syncYT();
                renderer.domElement.style.display = 'none';
                stereorenderer.domElement.style.display = 'block';
            }
            widget.update();
        });

        viewer.addUpdateCallback(function() {
            if (viewer.mode === PANOLENS.Modes.NORMAL) {
                renderer.render(scene, viewer.getCamera());
            } else {
                stereorenderer.render(stereoscene, viewer.getCamera());
            }
        });

        viewer.addEventListener('window-resize', function() {
            renderer.setSize(window.innerWidth, window.innerHeight);
            stereorenderer.setSize(window.innerWidth, window.innerHeight);

        });

        widget.paused = true;
        widget.load = function(url) {

            if (!!navigator.userAgent.match(/iPad|iPhone|iPod/i)) {
                url = addMovieDBImagePrefix(moviePanorama.movie.backdrop_path).replace('/w185/', '/w1280/');
            }

            moviePanorama && moviePanorama.placeholder && moviePanorama.placeholder.reset(url.indexOf('www.youtube.com') >= 0 ? false : true);

            this.pause();
            object.element.src = stereoobject.elementL.src = stereoobject.elementR.src = url;
            stereoobject.elementR.src += "&mute=1";
        };
        widget.reset = function() {
            this.pause();
            this.paused = true;
            this.currentTime = 0;
            object.element.src = stereoobject.elementL.src = stereoobject.elementR.src = '';
        };
        widget.pause = function(mode) {
            if (mode === PANOLENS.Modes.NORMAL) {
                sendYTCommand(object.element, "pauseVideo");
            } else {
                sendYTCommand(stereoobject.elementL, "pauseVideo");
                sendYTCommand(stereoobject.elementR, "pauseVideo");
                syncYT();
            }
        };
        widget.play = function(mode) {
            if (mode === PANOLENS.Modes.NORMAL) {
                sendYTCommand(object.element, "playVideo");
            } else {
                sendYTCommand(stereoobject.elementL, "playVideo");
                sendYTCommand(stereoobject.elementR, "playVideo");
                syncYT();
            }
        };
        widget.update = function() {
            if (this.paused) {
                sendYTCommand(object.element, "pauseVideo");
                sendYTCommand(stereoobject.elementL, "pauseVideo");
                sendYTCommand(stereoobject.elementR, "pauseVideo");
            } else {
                this.play(viewer.mode);
            }
        };

        window.addEventListener("message", function(event) {

            var data;

            data = JSON.parse(event.data);

            if (data && data.info && data.info.currentTime && data.info.currentTime > widget.currentTime) {

                widget.currentTime = data.info.currentTime;

            }

            if (data && data.event === 'onReady') {

                syncYT();

            }

        }, false);

        object.element.addEventListener('load', function() {
            object.element.contentWindow.postMessage('{"event":"listening"}', '*');
        });

        stereoobject.elementL.addEventListener('load', function() {
            stereoobject.elementL.contentWindow.postMessage('{"event":"listening"}', '*');
            !widget.paused && syncYT();
        });

        function sendYTCommand(element, command, arg) {
            element.contentWindow.postMessage(JSON.stringify({
                'event': 'command',
                'func': command || '',
                'args': arg || []
            }), "*");

        }

        function syncYT() {
            if (viewer.mode === PANOLENS.Modes.CARDBOARD || viewer.mode === PANOLENS.Modes.STEREO) {
                //sendYTCommand( stereoobject.elementR, "mute" );
                sendYTCommand(stereoobject.elementR, 'seekTo', [widget.currentTime, true]);
                sendYTCommand(stereoobject.elementL, 'seekTo', [widget.currentTime, true]);
            }
        }

        return widget;

    }

    function getSpiralMovieWall() {

        var wall, amount = 36,
            elevation = 1.7,
            scale = 1.5,
            addingCount = 0,
            tile, tiles, title, theta, vector, animation, lastChain, duration, easing, initialOpacity;

        initialOpacity = 0.5;
        duration = 2000;
        easing = TWEEN.Easing.Cubic.Out;
        tiles = [];
        vector = new THREE.Vector3();
        wall = new THREE.Object3D();
        wall.movieIndex = 0;

        animation = new TWEEN.Tween(wall);
        lastChain = animation;
        wall.animation = animation;

        wall.addMovies = function(array) {

            var scope = this;

            addingCount++;

            array = array.constructor === Array ? array : [];

            array.map(function(movie, index) {

                if (movie.poster_path) {

                    theta = Math.PI * 2 / amount * (scope.movieIndex % amount);
                    tile = new PANOLENS.Tile(tileLength / 1.5 * scale, tileLength * scale);
                    tile.material.opacity = initialOpacity;
                    tile.tileIndex = scope.movieIndex;
                    tile.position.set(
                        (Math.random() - 0.5) * radius * 4,
                        (Math.random() - 0.5) * radius * 2,
                        (Math.random()) * radius * 4
                    );
                    tile.spiralPosition = new THREE.Vector3(
                        radius * 2 * Math.sin(theta),
                        scope.movieIndex * elevation, -radius * 2 * Math.cos(theta)
                    );
                    tile.addEventListener('hoverenter', function() {
                        this.material.opacity = 1;
                        this.title.mesh.material.uniforms.opacity.value = 1;
                    });
                    tile.addEventListener('hoverleave', function() {
                        this.material.opacity = initialOpacity;
                        this.title.mesh.material.uniforms.opacity.value = initialOpacity;
                    });
                    tile.addEventListener('click-entity', function() {
                        SOUND_CLICK.stop();
                        SOUND_CLICK.play();
                        moviePanorama.movieData = movies['All'];
                        moviePanorama.movie = movie;
                        moviePanorama.category = 'All';
                        moviePanorama.movieIndex = moviePanorama.movieData.results.indexOf(movie);
                        setPanorama(moviePanorama);
                    });
                    tile.visible = false;
                    tile.tween('show', tile.material, { opacity: initialOpacity }, duration, easing, 0, makeVisible.bind(tile));
                    tile.tween('hide', tile.material, { opacity: 0 }, duration, easing, 0, null, null, makeInvisible.bind(tile));
                    makeTranslationAnimation();
                    PANOLENS.Utils.TextureLoader.load(addMovieDBImagePrefix(movie.poster_path), setClampTexture.bind(tile, progressManager.addLoaded.bind(progressManager)), undefined, progressManager.addLoaded.bind(progressManager));

                    title = new PANOLENS.SpriteText(movie.title, 600);
                    title.rotation.y = Math.PI;
                    title.position.y = -23;
                    title.tween('show', title.mesh.material.uniforms.opacity, { value: initialOpacity }, duration, easing, 0, makeVisible.bind(title));
                    title.tween('hide', title.mesh.material.uniforms.opacity, { value: 0 }, duration, easing, 0, null, null, makeInvisible.bind(title));
                    tile.title = title;
                    tile.add(title);

                    tiles.push(tile);
                    scope.add(tile);
                    scope.movieIndex++;

                } else {

                    progressManager.addLoaded();

                }

            });

            // Added all categories
            if (addingCount === categories.length) {
                this.position.copy(this.getCenter());
                this.position.y += 10;
            }

        };

        wall.getCenter = function() {

            return new THREE.Vector3(0, -this.movieIndex * elevation / 2, 0);

        };

        wall.show = function() {

            tiles.map(function(tile) {
                tile.tweens['hide'].stop();
                tile.tweens['show'].start();
                tile.title.tweens['hide'].stop();
                tile.title.tweens['show'].start();
            });

        };

        wall.hide = function() {

            tiles.map(function(tile) {
                tile.tweens['show'].stop();
                tile.tweens['hide'].start();
                tile.title.tweens['show'].stop();
                tile.title.tweens['hide'].start();
            });

        };

        function makeTranslationAnimation() {
            animation.onStart(function() {
                tiles.map(function(tile) {
                    new TWEEN.Tween(tile.position)
                        .to({
                            x: tile.spiralPosition.x,
                            y: tile.spiralPosition.y,
                            z: tile.spiralPosition.z
                        }, duration * 2)
                        .easing(TWEEN.Easing.Quintic.Out)
                        .onUpdate(function() {
                            vector.set(0, tile.spiralPosition.y, 0);
                            tile.lookAt(vector);
                        })
                        .start();
                });
            });
        }

        return wall;

    }

    function addMovieDBImagePrefix(relativeURL) {

        return theMovieDb.common.images_uri + relativeURL;
    }

    function setPanorama(panorama) {

        viewer.setPanorama(panorama);

    }

    function back() {

        viewer.panorama.visible = false;
        setPanorama(entryPanorama);
        moviePanorama.backdrops && moviePanorama.backdrops.reset(true);
        css3dWidget.reset();

    }

    function dispose(object) {

        object.geometry && object.geometry.dispose();
        object.material && object.material.dispose();

    }

    function makeVisible() {

        this.visible = true;

    }

    function makeInvisible() {

        this.visible = false;

    }

    function lookAtVector(vector) {
        this.lookAt(vector);
    }
};