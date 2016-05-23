var container = document.getElementById('container');
var containerInnerWidth = container.offsetWidth;
var containerInnerHeight = container.offsetHeight;

var composer;
var postprocessing;
var clock = new THREE.Clock();
var effectRGB, effectBloom, effectFilm;

var camera, scene, renderer, group;

//used by mouse tracking
var windowHalfX = containerInnerWidth / 2;
var windowHalfY = containerInnerHeight / 2;

var SHADOW_MAP_WIDTH = 2048,
	SHADOW_MAP_HEIGHT = 2048;
var NEAR = 10,
	FAR = 999.05;

init();
update();

function init() {

	//-----------------------------------------------------------------------------//  
	//setup camara
	//-----------------------------------------------------------------------------//  

	camera = new THREE.PerspectiveCamera(75, containerInnerWidth / containerInnerHeight, 0.1, 10000);
	camera.position.z = 4;
	camera.position.y = 2;
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	//-----------------------------------------------------------------------------//
	//init scene
	//-----------------------------------------------------------------------------//

	scene = new THREE.Scene();
	group = new THREE.Object3D();

	initDebug();

	initMouse();

	window.addEventListener('resize', onWindowResize, false);

	//-----------------------------------------------------------------------------//
	//load geometry 
	//-----------------------------------------------------------------------------//

	//simple generated primitive with custom shader
	//-----------------------------------------------//
	//material = new CustomMat("textures/texture.jpg", THREE.SimpleShader);
	var colorMat = new THREE.Vector3(1, 1, 1);
	material = new CustomMat("textures/boucle.jpg", THREE.DisplacementShader, colorMat);
	geometry = new THREE.SphereGeometry(1, 128, 128);
	mesh = new THREE.Mesh(geometry, material);
	group.add(mesh);


	// FLOOR
	var floorMaterial = new THREE.MeshPhongMaterial({
		color: 0xe6e6e6,
		wireframe: false
	});

	var floorGeometry = new THREE.PlaneBufferGeometry(200, 100, 10, 10);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.position.y = -5;
	floor.rotation.x = -(Math.PI / 2);
	floor.receiveShadow = true;
	scene.add(floor);

	//-----------------------------------------------------------------------------//
	//setup scene
	//-----------------------------------------------------------------------------//

	//scene graph (group.add(mesh); is in the loaders)
	scene.add(group);

	// fog
	scene.fog = new THREE.FogExp2(0xe6e6e6, 0.04);

	//-----------------------------------------------------------------------------//
	//setup renderer
	//-----------------------------------------------------------------------------//

	//  renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
	renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	renderer.setSize(containerInnerWidth, containerInnerHeight);

	renderer.setClearColor(0xe6e6e6, 1);
	//  renderer.autoClear = false;

	renderer.shadowMap.enabled = true;
	//renderer.shadowMapType = THREE.PCFShadowMap;
	//soft shadowmap version
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	container.appendChild(renderer.domElement);

	// POSTPROCESSING
	renderer.autoClear = false;

	var renderModel = new THREE.RenderPass(scene, camera);
	effectBloom = new THREE.BloomPass();
	effectFilm = new THREE.FilmPass(0.5, 0.125, 2048, false);
	effectFilm.renderToScreen = true;

	var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
	effectCopy.renderToScreen = true;
	effectRGB = new THREE.ShaderPass(THREE.RGBShiftShader);
	//effectRGB.uniforms.amount.value = 0.008; // 0.01
	//effectRGB.renderToScreen = true;

	var effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
	var width = window.innerWidth || 2,
		height = window.innerHeight || 2;
	effectFXAA.uniforms['resolution'].value.set(1 / width, 1 / height);

	composer = new THREE.EffectComposer(renderer);

	composer.addPass(effectCopy);
	composer.addPass(renderModel);
	//composer.addPass(effectFXAA);
	composer.addPass(effectBloom);
	composer.addPass(effectFilm);
	composer.addPass(effectRGB);

	// gui BLOOMPASS
	effectBloom.copyUniforms['opacity'].value = .6;
	//effectBloom.convolutionUniforms['uImageIncrement'].value.x = 0;
	//effectBloom.convolutionUniforms['uImageIncrement'].value.y = 0;

	effectFilm.uniforms['nIntensity'].value = 0;
	effectFilm.uniforms['sIntensity'].value = 0;
	effectFilm.uniforms['sCount'].value = 0;
	effectFilm.uniforms['grayscale'].value = 0;

	//-----------------------------------------------------------------------------//
	//setup lights
	//-----------------------------------------------------------------------------//
	//region
	light = new THREE.SpotLight(0xe6e6e6, 1, 0, Math.PI / 2, 1);
	light.position.set(0.5, 3, 3);
	light.target.position.set(0, 0, 0);

	// cast shadow
	light.castShadow = true;
	light.shadowCameraNear = 1;
	light.shadowCameraFar = 10;
	light.shadowCameraFov = 50;
	//show light camera frustrum
	//THREE.CameraHelper( light.shadow );

	light.shadowBias = 0.0001;
	light.shadowDarkness = 0.5;

	light.shadowMapWidth = SHADOW_MAP_WIDTH;
	light.shadowMapHeight = SHADOW_MAP_HEIGHT;
	scene.add(light);

	//secondary light
	light = new THREE.DirectionalLight(0xe6e6e6, 1);
	light.position.set(-1, -1, -1);
	scene.add(light);

	//ambient light
	light = new THREE.AmbientLight(0x222222);
	scene.add(light);
	//endregion
}

function onWindowResize() {
	
	// make sure to updtate the container proportions on window resize
	containerInnerWidth = container.offsetWidth;
	containerInnerHeight = container.offsetHeight;

	windowHalfX = containerInnerWidth / 2;
	windowHalfY = containerInnerHeight / 2;

	camera.aspect = containerInnerWidth / containerInnerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(containerInnerWidth, containerInnerHeight);
	composer = new THREE.EffectComposer(renderer);
	
}

var frame = 0;

function update() {

	//
	if (audioResult != undefined && audioResult != 0) {
		mesh.material.uniforms.scale.value = audioResult;
		//effectRGB.uniforms.amount.value = audioResult / 100;
		effectBloom.copyUniforms['opacity'].value = audioResult / 2;
		//effectFilm.uniforms['nIntensity'].value = audioResult / 4;
	} else {
		mesh.material.uniforms.scale.value = (Math.sin(frame) + 1) / 2;
		//effectRGB.uniforms.amount.value = Math.sin(frame) / 100;
		effectBloom.copyUniforms['opacity'].value = Math.sin(frame) / 2;
		//effectFilm.uniforms['nIntensity'].value = Math.sin(frame) / 4;
		frame += 0.01;
	}
	//

	requestAnimationFrame(update);

	//update mouse tracking
	updateMouse();

	renderer.clear();
	composer.render(0.05);
	//renderer.render(scene, camera);
	stats.update();

}