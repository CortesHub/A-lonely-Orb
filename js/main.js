/*
 * Audio reactions with three.js
 * @author Aureaboros <http://aureaboros.com>
 */

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var group, mesh, ground, particleSystem;
var finalResult;
var texture2;

'use strict';

var Aureaboros = Aureaboros || {};

// TODO : trier ce bordel

Aureaboros = function (options) {

	var self = this;

	// General
	this.nom = options.nom;
	this.error = false;
	this.glowColor = options.glowColor != undefined ? options.glowColor : new THREE.Vector3(1, 0, 0);
	this.colorDark = 0x151515;
	this.loader = new THREE.TextureLoader();
	this.container = options.container;
	//this.container.id = options.container.id == undefined ? '#container' : options.container.id;
	this.containerInnerWidth = window.innerWidth;
	this.containerInnerHeight = window.innerHeight;
	this.timer = document.querySelector('.musicTime');
	this.dataURL = '';

	// Ribbon
	//	this.Bounds = 250; //bounded space goes from - BOUNDS to +BOUNDS
	//	this.ribbonCount = options.ribbonCount == undefined ? options.ribbonCount : 600;
	//	this.ribbons = [];
	//	this.emitterCount = options.emitterCount == undefined ? options.emitterCount : 3;
	//	this.emitters = [];
	//	this.noise = new SimplexNoise();
	//	this.noiseTime = Math.random() * 1000;

	// Performance ( Lower possible if not def. )
	// - quality
	this.quality = options.quality !== undefined ? options.quality : 1;
	// - particles
	this.nbParticles = options.nbParticles !== undefined ? options.nbParticles : 50;
	// - ground vertices
	this.nbVertices = options.nbVertices !== undefined ? options.nbVertices : 100;

	// Time
	this.time = 0;
	this.delta = 0;
	this.oldTime = 0;
	this.optimalDivider = 0;
	this.smoothing = 0;

	// Mouse
	this.mouse = new THREE.Vector2(-0.5, 0.5);

}

//

Aureaboros.prototype.animate = function () {

	requestAnimationFrame(this.animate.bind(this));
	this.render();
	this.stats.update();

}

Aureaboros.prototype.render = function () {

	///////////
	// MUSIC //

	if (btnPlay.classList.contains('running')) {

		currentTime = ctxAudio.currentTime - timeSpend;
		var timeScale = currentTime / totalTime;
		this.timer.style.transform = 'scale3d(' + timeScale + ', 1, 1)';

	} else {
		timeSpend = ctxAudio.currentTime;
	}
	if (totalTime != 0 && currentTime >= totalTime && audioAverage === 0) {
		playerFinish(this.timer);
	}

	///////////
	// SCENE //

	// Camera movements based on mouse
	this.time = Date.now();
	this.delta = this.time - this.oldTime;
	this.oldTime = this.time;
	if (isNaN(this.delta) || this.delta > 1000 || this.delta === 0) {
		this.delta = 1000 / 60;
	}
	this.optimalDivider = this.delta / 16;
	this.smoothing = Math.max(5, (30 / this.optimalDivider));

	this.camera.position.x += ((this.mouse.x * 170 + Math.sin(this.time * 0.0001) * 70) - this.camera.position.x) / this.smoothing;
	if (this.camera.position.y <= 0) {
		this.camera.position.y += (this.mouse.y + Math.abs(Math.cos(this.time * 0.0001))) / this.smoothing;
	} else {
		this.camera.position.y += ((this.mouse.y * 90 + Math.cos(this.time * 0.0001) * 30) - this.camera.position.y) / this.smoothing;
	}
	this.camera.lookAt(mesh.position);


	// Uniforms Update
	if (audioAverage === undefined || audioBass === undefined || audioMedium === undefined || audioTreble === undefined) {
		// if song is not loaded
		audioAverage = 0;
		audioBass = 0;
		audioMedium = 0;
		audioTreble = 0;
	}
	mesh.material.uniforms.scale.value = audioTreble;
	mesh.material.uniforms.globalTime.value = currentTime * 0.1;
	ground.material.uniforms.scale.value = audioBass;
	ground.material.uniforms.globalTime.value = currentTime * 1000;
	particleSystem.material.uniforms.scale.value = audioTreble;
	particleSystem.material.uniforms.globalTime.value = currentTime * 0.1;


	// Ribbons update
	//  noiseTime = currentTime * 0.1;
	//	for (var i = 0; i < RIBBON_COUNT; i++) {
	//		ribbons[i].update();
	//	}


	// Post-Processing Update
	if (this.quality === 2) {

		// custom curve (thx GeoGebra)
		var x = audioAverage;
		var modifiedResult = (0.9 * Math.pow(x, 20)) / 0.9
		finalResult = modifiedResult * Math.exp(x / 1000);
		finalResult /= 20;

		// RGB shift
		if (finalResult >= 0.05) {
			this.effectRGB.uniforms.amount.value = 0.05; // 0.0025
		} else {
			this.effectRGB.uniforms.amount.value = finalResult;
		}

		// TiltShift
		this.effectHblur.uniforms['h'].value = (audioTreble * 1.5) / this.containerInnerWidth;
		this.effectVblur.uniforms['v'].value = (audioTreble * 1.5) / this.containerInnerHeight;

	}

	if (this.quality === 1 || this.quality === 2) {

		// Bloom
		this.effectBloom.copyUniforms.opacity.value = .75 + (audioTreble) * 0.3;
		// Dirty Lens
		this.effectDirtyLens.uniforms.scale.value = audioTreble;
		this.effectDirtyLens.uniforms.tVideo.value = this.videoTexture;

	}


	// Render
	if (this.quality >= 1) {
		//this.renderer.clear();
		this.composer.render();
	} else {
		this.renderer.clear();
		this.renderer.render(this.scene, this.camera);
	}

}

//

Aureaboros.prototype.initScene = function () {

	////////////
	// RENDER //
	//region
	this.renderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true
	});
	this.renderer.setClearColor(this.colorDark, 1);
	this.renderer.setPixelRatio(window.devicePixelRatio);
	this.renderer.setSize(this.containerInnerWidth, this.containerInnerHeight);
	this.container.appendChild(this.renderer.domElement);

	this.renderer.gammaInput = true;
	this.renderer.gammaOutput = true;
	this.renderer.physicallyBasedShading = true;
	//endregion


	///////////
	// SCENE //
	//region
	this.camera = new THREE.PerspectiveCamera(70, this.containerInnerWidth / this.containerInnerHeight, 0.1, 60000);
	this.camera.position.set(0, 100, 100);
	this.camera.lookAt(new THREE.Vector3(0, 70, 0));

	this.scene = new THREE.Scene();
	group = new THREE.Object3D();
	//endregion


	/////////
	// ENV //
	//region
	var skyGeo = new THREE.BoxGeometry(500, 500, 500, 1, 1, 1);
	var skybox = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({
		color: 0x030303,
		side: THREE.BackSide,
		fog: false
	}));
	group.add(skybox);
	//endregion


	/////////
	// OBJ //
	//region

	// - SPHERE //
	//region
	var Suniforms = THREE.UniformsUtils.clone(THREE.OrbShader.uniforms);
	var Smaterial = new THREE.ShaderMaterial({
		fragmentShader: THREE.OrbShader.fragmentShader,
		vertexShader: THREE.OrbShader.vertexShader,
		uniforms: Suniforms,
	});
	var Sgeometry = new THREE.IcosahedronGeometry(15, 4);
	mesh = new THREE.Mesh(Sgeometry, Smaterial);
	mesh.material.uniforms.fresnelBias.value = 0; // 0.1
	mesh.material.uniforms.fresnelScale.value = .5; // 1
	mesh.material.uniforms.fresnelPower.value = 1.5; // 2
	mesh.position.y = 20;
	group.add(mesh);
	//endregion

	// - GROUND //
	//region
	var Gmaterial = new THREE.ShaderMaterial({
		fragmentShader: THREE.GroundShader.fragmentShader,
		vertexShader: THREE.GroundShader.vertexShader,
		uniforms: THREE.GroundShader.uniforms,
		wireframe: true,
		transparent: true
	});
	var Ggeometry = new THREE.PlaneGeometry(500, 500, this.nbVertices, this.nbVertices);
	ground = new THREE.Mesh(Ggeometry, Gmaterial);
	ground.rotateX(-Math.PI / 2);
	ground.rotateZ(-Math.PI / 2);
	ground.position.set(0, -22, 0);
	group.add(ground);
	//endregion

	// - PARTICLES //
	//region
	var particles = this.nbParticles; // MAX : 1000
	var radius = 200;
	var positions = new Float32Array(particles * 3);
	var colors = new Float32Array(particles * 3);
	var sizes = new Float32Array(particles);
	var color = new THREE.Color();

	for (var i = 0, i3 = 0; i < particles; i++, i3 += 3) {

		positions[i3 + 0] = (Math.random() * 2 - 1) * radius;
		positions[i3 + 1] = (Math.random() * 2 + 1) * (radius * .2);
		positions[i3 + 2] = (Math.random() * 2 - 1) * radius;

		color.setHSL(i / particles, 1.0, 0.5);

		colors[i3 + 0] = color.r;
		colors[i3 + 1] = color.g;
		colors[i3 + 2] = color.b;

		sizes[i] = 20;

	}

	var Bgeometry = new THREE.BufferGeometry();
	Bgeometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
	Bgeometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
	Bgeometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));

	var loader = new THREE.TextureLoader();
	var texture = loader.load("textures/OBJ/sparks/fluffy.png");
	var uniforms = THREE.UniformsUtils.clone(THREE.ParticleShader.uniforms);
	uniforms["texture1"].value = texture;

	var particleMat = new THREE.ShaderMaterial({
		fragmentShader: THREE.ParticleShader.fragmentShader,
		vertexShader: THREE.ParticleShader.vertexShader,
		uniforms: uniforms,
		blending: THREE.AdditiveBlending,
		//blending: THREE.NormalBlending,
		depthTest: true,
		transparent: true,
		side: THREE.DoubleSide
	});


	particleSystem = new THREE.Points(Bgeometry, particleMat);
	group.add(particleSystem);
	//endregion

	// - RIBBONS //
	//region
	// emitters
	//	for (var i = 0; i < EMITTER_COUNT; i++) {
	//		emitters[i] = ATUtil.randomVector3(BOUNDS / 2);
	//	}
	//
	//	// ribbons
	//	for (i = 0; i < RIBBON_COUNT; i++) {
	//		var r = new Ribbon();
	//		r.init();
	//		group.add(r.mesh);
	//		ribbons.push(r);
	//	}
	//	//endregion

	this.scene.add(group);
	//endregion


	//////////////
	// CONTROLS //
	//region
	//	this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
	//	this.controls.enableZoom = false;
	//	this.controls.enablePan = false;
	//	this.controls.enableDamping = false;
	//	this.controls.minDistance = 100;
	//	this.controls.maxDistance = 200;
	//	this.controls.minPolarAngle = 0;
	//	this.controls.maxPolarAngle = Math.PI * 0.5;
	//endregion


	////////////////////
	// POSTPROCESSING //
	//region
	if (this.quality === 2) {

		console.log('hight quality');
		this.renderer.autoClear = false;
		this.renderModel = new THREE.RenderPass(this.scene, this.camera);

		// Bloom
		this.effectBloom = new THREE.BloomPass(1.5, 25, 5, 256);

		// RGB
		this.effectRGB = new THREE.ShaderPass(THREE.RGBShiftShader);
		this.effectRGB.uniforms['amount'].value = 0.0015;
		//this.effectRGB.uniforms['angle'].value = 1.57;

		// TiltShift
		this.effectHblur = new THREE.ShaderPass(THREE.HorizontalTiltShiftShader);
		this.effectVblur = new THREE.ShaderPass(THREE.VerticalTiltShiftShader);
		var bluriness = 3;
		this.effectHblur.uniforms['h'].value = bluriness / this.containerInnerWidth;
		this.effectVblur.uniforms['v'].value = bluriness / this.containerInnerHeight;
		this.effectHblur.uniforms['r'].value = this.effectVblur.uniforms['r'].value = 0.5;

		// Black Vignette
		this.effectVignette = new THREE.ShaderPass(THREE.VignetteShader);
		this.effectVignette.uniforms['darkness'].value = 1;
		this.effectVignette.uniforms['offset'].value = 1.2;

		// Dirty Lens
		var loader2 = new THREE.TextureLoader();
		texture2 = loader.load("textures/dirty/zoom.jpg");
		this.effectDirtyLens = new THREE.ShaderPass(THREE.DirtyLensShader);
		this.effectDirtyLens.uniforms.size.value = 1024.0 * (this.containerInnerWidth / 1024);
		this.effectDirtyLens.uniforms.tHex.value = texture2;
		this.effectDirtyLens.uniforms.color.value = new THREE.Color(0xffffff);
		if (texture2.image) {
			this.effectDirtyLens.uniforms.aspectRatio2.value = texture2.image.width / texture2.image.height;
		}

		// Anti Alliasing
		this.effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
		var width = window.innerWidth || 2,
			height = window.innerHeight || 2;
		this.effectFXAA.uniforms['resolution'].value.set(1 / width, 1 / height);

		// Final Pass
		this.effectCopy = new THREE.ShaderPass(THREE.CopyShader);
		this.effectCopy.renderToScreen = true;

		// Composer
		this.composer = new THREE.EffectComposer(this.renderer);
		this.composer.addPass(this.renderModel);
		this.composer.addPass(this.effectBloom);
		this.composer.addPass(this.effectRGB);
		this.composer.addPass(this.effectHblur);
		this.composer.addPass(this.effectVblur);
		this.composer.addPass(this.effectVignette);
		this.composer.addPass(this.effectDirtyLens);
		this.composer.addPass(this.effectFXAA);
		this.composer.addPass(this.effectCopy);

	}

	if (this.quality === 1) {

		console.log('medium quality');
		this.renderer.autoClear = false;
		this.renderModel = new THREE.RenderPass(this.scene, this.camera);

		// Bloom
		this.effectBloom = new THREE.BloomPass(1.5, 25, 5, 256);

		// Black Vignette
		this.effectVignette = new THREE.ShaderPass(THREE.VignetteShader);
		this.effectVignette.uniforms['darkness'].value = 1;
		this.effectVignette.uniforms['offset'].value = 1.2;

		// Dirty Lens
		var loader2 = new THREE.TextureLoader();
		texture2 = loader.load("textures/dirty/zoom.jpg");
		this.effectDirtyLens = new THREE.ShaderPass(THREE.DirtyLensShader);
		this.effectDirtyLens.uniforms.size.value = 1024.0 * (this.containerInnerWidth / 1024);
		this.effectDirtyLens.uniforms.tHex.value = texture2;
		this.effectDirtyLens.uniforms.color.value = new THREE.Color(0xffffff);
		if (texture2.image) {
			this.effectDirtyLens.uniforms.aspectRatio2.value = texture2.image.width / texture2.image.height;
		}

		// Final Pass
		this.effectCopy = new THREE.ShaderPass(THREE.CopyShader);
		this.effectCopy.renderToScreen = true;

		// Composer
		this.composer = new THREE.EffectComposer(this.renderer);
		this.composer.addPass(this.renderModel);
		this.composer.addPass(this.effectBloom);
		this.composer.addPass(this.effectVignette);
		this.composer.addPass(this.effectDirtyLens);
		this.composer.addPass(this.effectCopy);

	}

	if (this.quality === 0) {
		console.log('low quality : no post-process');
	}
	//endregion

}

Aureaboros.prototype.initSound = function () {

	if (url != '') {
		setupAudioNodes();
		loadSound(url);

		javascriptNode.onaudioprocess = function () {
			var array = new Uint8Array(analyser.frequencyBinCount);
			analyser.getByteFrequencyData(array);
			// ==================================
			// Bass   : 20  <-> 250 (0 <-> 15)
			// Medium : 250 <-> 2k	(15 <-> 57)
			// Treble : 2k  <-> 13k (57 <-> 313)
			// ==================================
			var aAverage = getAverageVolume(array, 0, array.length, true, 200);
			var aBass = getAverageVolume(array, 0, 15, false, 200);
			var aMedium = getAverageVolume(array, 15, 57, false, 200);
			var aTreble = getAverageVolume(array, 57, 313, false, 200);

			audioAverage = aAverage;
			audioBass = aBass;
			audioMedium = aMedium;
			audioTreble = aTreble;

			// ========== DEBUG Audio
			//			(function () {
			//				document.getElementById('Bass').innerHTML = 'Bass : ' + audioBass.toPrecision(2);
			//				document.getElementById('Medium').innerHTML = 'Medium : ' + audioMedium.toPrecision(2);
			//				document.getElementById('Treble').innerHTML = 'Treble : ' + audioTreble.toPrecision(2);
			//			})();

		}

	}
}

Aureaboros.prototype.initVideoStart = function () {

	// Basic
	this.video = document.createElement('video');
	this.video.width = this.containerInnerWidth;
	this.video.height = this.containerInnerHeight;
	//this.video.autoplay = false;

	this.sourceWM = document.createElement('source');
	this.sourceMP = document.createElement('source');
	this.sourceWM.setAttribute('src', "video/Composition.webm");
	this.sourceWM.setAttribute('type', "video/webm");
	this.sourceMP.setAttribute('src', "video/Composition.mp4");
	this.sourceMP.setAttribute('type', "video/mp4");

	this.video.appendChild(this.sourceWM);
	this.video.appendChild(this.sourceMP);

	// THREE
	this.videoTexture = new THREE.VideoTexture(this.video);
	this.videoTexture.minFilter = THREE.LinearFilter;
	this.videoTexture.magFilter = THREE.LinearFilter;
	this.videoTexture.format = THREE.RGBFormat;


	console.log('started');

}

Aureaboros.prototype.initDebug = function () {
	this.stats = new Stats();
	document.querySelector('.debug').appendChild(this.stats.domElement);
}

//

Aureaboros.prototype.onResize = function () {

	this.containerInnerWidth = window.innerWidth;
	this.containerInnerHeight = window.innerHeight;
	this.windowHalfX = this.containerInnerWidth / 2;
	this.windowHalfY = this.containerInnerHeight / 2;

	this.camera.aspect = this.containerInnerWidth / this.containerInnerHeight;
	this.camera.updateProjectionMatrix();

	if (this.quality.id >= 1) {
		//this.renderer.setSize(this.containerInnerWidth, this.containerInnerHeight);
		// ffxa 
		this.effectFXAA.uniforms['resolution'].value.set(1 / (this.containerInnerWidth), 1 / (this.containerInnerHeight));
		this.composer.setSize(this.containerInnerWidth, this.containerInnerHeight);
	} else {
		this.renderer.setSize(this.containerInnerWidth, this.containerInnerHeight);
	}

}

Aureaboros.prototype.onMouseMove = function (ev) {
	ev.preventDefault();
	this.mouse.x = (ev.clientX / this.containerInnerWidth) * 2 - 1;
	this.mouse.y = -(ev.clientY / this.containerInnerWidth) * 2 + 1;
}

Aureaboros.prototype.onClick = function (ev) {
	// TODO : PLAYTIME BITCH !
	//	mouse.x = (ev.clientX / screenWidth) * 2 - 1;
	//	mouse.y = -(ev.clientY / screenHeight) * 2 + 1;
	//
	//	raycaster.setFromCamera(mouse, camera);
	//	intersects = raycaster.intersectObjects(scene.children);
	//	for (var i = 0; i < intersects.length; i++) {
	//		console.log(intersects[i].object);
	//		if (intersects[i].object.name === 'floor') {
	//			//intersects[i].object.material.color.set(Math.random() * 0xffffff);
	//		}
	//	}
}

Aureaboros.prototype.onError = function (err) {
	// TODO : Add differents error based on the param !
}

Aureaboros.prototype.onScreenShot = function () {
	this.render();
	this.dataURL = this.renderer.domElement.toDataURL('png');
	window.open(this.dataURL);
}

//

Aureaboros.prototype.init = function () {

	if (Detector.webgl) {
		// ok webgl
		this.initVideoStart();
		this.initScene();
		this.initSound();
		this.initDebug();
		this.animate();

		window.onresize = this.onResize.bind(this);
		window.onmousemove = this.onMouseMove.bind(this);
		//window.onclick = this.onClick.bind(this);

	} else {
		// error
		//this.onError();
	}
}



// HANDLE START


var passion, params;
var handleStart = function () {

	var btnQ = document.querySelectorAll('.button');
	var droppingArea = document.querySelector('.loading-song');
	var droppingInfo = document.querySelector('.infoDropping');
	var el;
	var qualityDrop;

	// launcher
	function initStart(ev) {
		ev.preventDefault();
		el = ev.target;
		qualityDrop = el.classList[1];

		// prepare quality params
		switch (qualityDrop) {
		case 'Qlow':
			params = {
				nom: 'green',
				container: document.querySelector('#container'),
				quality: 0,
				nbParticles: 100,
				nbVertices: 100
			};
			break;
		case 'Qmed':
			params = {
				nom: 'orange',
				container: document.querySelector('#container'),
				quality: 1,
				nbParticles: 250,
				nbVertices: 200
			};
			break;
		case 'Qhgt':
			params = {
				nom: 'Rapunzel', // yeah i love this movie
				container: document.querySelector('#container'),
				quality: 2,
				nbParticles: 500,
				nbVertices: 300
			};
			break;
		default:
			params = {
				nom: 'green',
				container: document.querySelector('#container'),
				quality: 0,
				nbParticles: 100,
				nbVertices: 100
			};
			break;
		}

		// active state
		for (var i = 0; i < btnQ.length; i++) {
			if (btnQ[i].classList.contains('active')) {
				btnQ[i].classList.remove('active');
			}
		}
		el.classList.add('active');

		// Dropping area
		var arrSt = '';
		switch (qualityDrop) {
		case 'Qlow':
			droppingInfo.innerHTML = '<p>La Basse qualité est faite pour les mobiles, tablettes, Macbook et tout les appareils sans (bonne) carte graphique (GPU).';
			break;
		case 'Qmed':
			droppingInfo.innerHTML = '<p>La Moyenne qualité est faite pour les bon ordinateurs portables et les ordinateurs fixe possédant une configuration basique.';
			break;
		case 'Qhgt':
			droppingInfo.innerHTML = 'La qualité Maximum est faite pour les ordinateurs portables optimisés pour les jeux vidéo et les ordinateurs fixes possédant une bonne configuration ( bon CPU et GPU ).';
			break;
		}
		droppingArea.style.display = 'block';
	}

	// Screeshot
	function keyDown(e) {
		var keyCode = e.keyCode;
		console.log(e.target.classList.contains);
		console.log(e.keyCode);
		if (keyCode == 80) {
			passion.onScreenShot();
		}
		if (keyCode == 32) {
			btnPlay.onclick();
		}
		if (e.target.classList.contains('fa')) {
			e.preventDefault();
			e.stopImmediatePropagation();
			passion.onScreenShot();
		}

	}

	// INIT AFTER UI__MAIN

	function initAfterStart(ev) {
		ev.preventDefault();
		var el = ev.target;
		// hide ui--starting
		var uiS = document.querySelector('.ui--starting');
		var uiChildOne = uiS.children;
		var controlsAudio = document.getElementById('controlsAudio');
		var freezer = document.querySelector('.freezer');

		if (el.classList.contains('activated')) {
			// let's do webgl
			// init webgl 
			//passion.initSound();
			setTimeout(function () {
				passion.init();
				setTimeout(function () {
					passion.video.play();
					freezer.style.display = 'none';
					// event 2 
					var screeS = document.querySelector('.screenShot');
					document.addEventListener("keydown", keyDown);
					screeS.addEventListener("click", keyDown, false);
				}, 1000);
			}, 500);

			uiS.classList.add('fadeOut');
			freezer.style.display = 'block';
			for (var i = 0; i < uiChildOne.length; i++) {
				uiChildOne[i].classList.remove('fadeIn');
				uiChildOne[i].classList.add('fadeOut');
			}
			setTimeout(function () {
				uiS.style.display = 'none';
				controlsAudio.style.display = 'block';
			}, 1500);

		} else {
			return false;
		}
	}

	// Events
	var dropSong = document.querySelector('.loading-song');
	window.addEventListener('drop', stopEvent, false);
	dropSong.addEventListener('dragover', stopEvent, false);
	dropSong.addEventListener('dragenter', stopEvent, false);
	dropSong.addEventListener('drop', dropAudio, false);

	//	$('.loading-song')
	//		.on('dragover', stopEvent)
	//		.on('dragenter', stopEvent)
	//		.on('drop', dropAudio);

	for (var i = 0; i < btnQ.length; i++) {
		btnQ[i].addEventListener("click", initStart, false);
	}
	document.querySelector('.confirmQ').addEventListener("click", initAfterStart, false);

	console.log('app started');
}();