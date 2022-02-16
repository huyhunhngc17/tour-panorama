function generatePaginationWidget() {

	var widget, MAX_PAGE = 5, dots = [], dot, gap = 10;

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
		dot.addEventListener('hoverenter', function () {
			SOUND_OVER.play();
			if (widget.selection === this) { return; }
			this.tweens['scaleup'].start();
		});
		dot.addEventListener('hoverleave', function () {
			SOUND_OVER.stop();
			if (widget.selection === this) { return; }
			this.tweens['scaledown'].start();
		});
		dot.addEventListener('click', function () {
			SOUND_CLICK.stop(); SOUND_CLICK.play();
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

	widget.update = function (array) {

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
	widget.addEventListener('hoverenter', function () {
		SOUND_OVER.play();
		message.tweens['fadeOut'].stop();
		message.tweens['fadeIn'].start();
	});
	widget.addEventListener('hoverleave', function () {
		SOUND_OVER.stop();
		message.tweens['fadeIn'].stop();
		message.tweens['fadeOut'].start();
	});
	widget.update = function (date) {

		var _day, _month, _year;

		_year = date.split('-')[0];
		_month = date.split('-')[1];
		_day = date.split('-')[2];

		switch (_month) {
			case '01': _month = 'JAN'; break;
			case '02': _month = 'FEB'; break;
			case '03': _month = 'MAR'; break;
			case '04': _month = 'APR'; break;
			case '05': _month = 'MAY'; break;
			case '06': _month = 'JUN'; break;
			case '07': _month = 'JUL'; break;
			case '08': _month = 'AUG'; break;
			case '09': _month = 'SEP'; break;
			case '10': _month = 'OCT'; break;
			case '11': _month = 'NOV'; break;
			case '12': _month = 'DEC'; break;
			default: _month = 'N/A';
		}

		day.update({ text: _day });
		month.update({ text: _month });
		year.update({ text: _year });

	};

	return widget;

}

function generateRatingWidget(total, score, innerRadius, outerRadius) {

	var rating, eachRadian, gapRadian, geometry, material, mesh, edge, text, segments = [], fills = [], delay = 150, duration = 1500, initialScale = 1.5, message, activateArea;

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

	rating.update = function (opt) {

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

	rating.reset = function () {
		segments.map(function (segment, index) {
			segment.traverse(function (child) {
				child.fadeInAnimation && child.fadeInAnimation.stop();
				child.scaleDownAnimation && child.scaleDownAnimation.stop();
				child.material && (child.material.opacity = 0);
				child.scale.set(initialScale, initialScale, initialScale);
			});
		});

		fills.map(function (fill) {
			fill.parent.remove(fill);
			fill.geometry.dispose();
			fill.material.dispose();
		});

		fills.length = 0;
	};

	rating.fadeIn = function () {
		segments.map(function (segment, index) {
			segment.traverse(function (child) {
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

	activateArea.addEventListener('hoverenter', function () {
		SOUND_OVER.play();
		message.tweens['fadeOut'].stop();
		message.tweens['fadeIn'].start();
		for (var i = 0; i < Math.ceil(score); i++) {
			segments[i].scaleDownAnimation.stop();
			segments[i].scaleUpAnimation.start();
		}
	});
	activateArea.addEventListener('hoverleave', function () {
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
	button.addEventListener('click-entity', function () {
		SOUND_CLICK.stop(); SOUND_CLICK.play();
		this.ripple();
	});
	button.addEventListener('pressstart-entity', function () {
		this.tweens['translateFront'].stop();
		this.tweens['translateBack'].start();
	});
	button.addEventListener('pressstop-entity', function () {
		this.tweens['translateBack'].stop();
		this.tweens['translateFront'].start();
	});
	button.addEventListener('hoverenter', function () {
		SOUND_OVER.play();
		button.tweens['fadeIn'].start();
		poster.tweens['fadeIn'].start();
		title.tweens['fadeIn'].start();
	});
	button.addEventListener('hoverleave', function () {
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

	var MAX_BACKDROPS = 50, backdrops, backdrop, edge, gap, wrapAmount, vector, easing, duration;

	wrapAmount = 6;
	easing = TWEEN.Easing.Cubic.Out;
	duration = 1000;
	backdrops = new THREE.Object3D();
	gap = tileLength * 0.05;
	vector = new THREE.Vector3(0, 0, radius);

	for (var i = 0; i < MAX_BACKDROPS; i++) {

		backdrop = new PANOLENS.Tile(tileLength * 1.78, tileLength);
		backdrop.material.opacity = 0.5;
		backdrop.position.set(
			-tileLength * 4.7 + (i % wrapAmount) * tileLength * 1.78 + (2 * (i % wrapAmount) + 1) * gap,
			-tileLength * 2 - tileLength * parseInt(i / wrapAmount) - (2 * parseInt(i / wrapAmount) + 1) * gap,
			0
		);
		backdrop.tween('moveFront', backdrop.position, { x: 0, y: -radius / 3, z: radius / 1.5 }, duration, easing, 0, null, lookAtVector.bind(backdrop, vector), setOpaque.bind(backdrop));
		backdrop.tween('moveBack', backdrop.position, { x: backdrop.position.x, y: backdrop.position.y, z: backdrop.position.z }, duration, easing, 0, null, null, setSemiTransparent.bind(backdrop));
		backdrop.tween('rotateBack', backdrop.rotation, { x: 0, y: 0, z: 0 }, duration, easing);

		backdrop.addEventListener('hoverenter', function () {
			this.edge.fadeOutAnimation.stop();
			this.edge.fadeInAnimation.start();
			this.material.opacity = 1;
		});
		backdrop.addEventListener('hoverleave', function () {
			this.edge.fadeOutAnimation.start();
			this.edge.fadeInAnimation.stop();
			if (this !== backdrops.selection) {
				this.material.opacity = 0.5;
			}
		});
		backdrop.addEventListener('click', function () {
			SOUND_CLICK.stop(); SOUND_CLICK.play();
			var scope = this;
			if (backdrops.selection === this) {
				backdrops.reset();
				return;
			}
			else if (backdrops.selection) {
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
	backdrops.reset = function (instant) {
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

	viewer.addEventListener('mode-change', function (event) {

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

	viewer.addUpdateCallback(function () {
		if (viewer.mode === PANOLENS.Modes.NORMAL) {
			renderer.render(scene, viewer.getCamera());
		} else {
			stereorenderer.render(stereoscene, viewer.getCamera());
		}
	});

	viewer.addEventListener('window-resize', function () {
		renderer.setSize(window.innerWidth, window.innerHeight);
		stereorenderer.setSize(window.innerWidth, window.innerHeight);

	});

	widget.paused = true;
	widget.load = function (url) {

		if (!!navigator.userAgent.match(/iPad|iPhone|iPod/i)) {
			url = addMovieDBImagePrefix(moviePanorama.movie.backdrop_path).replace('/w185/', '/w1280/');
		}

		moviePanorama && moviePanorama.placeholder && moviePanorama.placeholder.reset(url.indexOf('www.youtube.com') >= 0 ? false : true);

		this.pause();
		object.element.src = stereoobject.elementL.src = stereoobject.elementR.src = url;
		stereoobject.elementR.src += "&mute=1";
	};
	widget.reset = function () {
		this.pause();
		this.paused = true;
		this.currentTime = 0;
		object.element.src = stereoobject.elementL.src = stereoobject.elementR.src = '';
	};
	widget.pause = function (mode) {
		if (mode === PANOLENS.Modes.NORMAL) {
			sendYTCommand(object.element, "pauseVideo");
		} else {
			sendYTCommand(stereoobject.elementL, "pauseVideo");
			sendYTCommand(stereoobject.elementR, "pauseVideo");
			syncYT();
		}
	};
	widget.play = function (mode) {
		if (mode === PANOLENS.Modes.NORMAL) {
			sendYTCommand(object.element, "playVideo");
		} else {
			sendYTCommand(stereoobject.elementL, "playVideo");
			sendYTCommand(stereoobject.elementR, "playVideo");
			syncYT();
		}
	};
	widget.update = function () {
		if (this.paused) {
			sendYTCommand(object.element, "pauseVideo");
			sendYTCommand(stereoobject.elementL, "pauseVideo");
			sendYTCommand(stereoobject.elementR, "pauseVideo");
		} else {
			this.play(viewer.mode);
		}
	};

	window.addEventListener("message", function (event) {

		var data;

		data = JSON.parse(event.data);

		if (data && data.info && data.info.currentTime && data.info.currentTime > widget.currentTime) {

			widget.currentTime = data.info.currentTime;

		}

		if (data && data.event === 'onReady') {

			syncYT();

		}

	}, false);

	object.element.addEventListener('load', function () {
		object.element.contentWindow.postMessage('{"event":"listening"}', '*');
	});

	stereoobject.elementL.addEventListener('load', function () {
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
