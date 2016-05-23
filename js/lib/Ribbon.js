//////////////////////////////////
//RIBBON OBJECT
//////////////////////////////////

// Ribbon is composed of a head and a tail - 2 3D vectors.
// the head is moved around via a 4D noise field. The tail follows it one frame later.
// The visible ribbon is a custom built mesh. Each frame the left and right edges
// of the ribbon are constructed by using the normals on the vector between the head
// and tail. The mesh is constructed by copying the edge vertices back along the
// tail of the mesh. This way no new vector3s are created each frame, only copying
// between vectors, preventing memory thrashing. Temp vectors are used for calculations.

// TODO : Move comput to shader (vs fs) ?

// RIBBONS	
var BOUNDS = 250; //bounded space goes from - BOUNDS to +BOUNDS
var RIBBON_COUNT = 250;
var ribbons = [];
var EMITTER_COUNT = 1;
var emitters = [];
var noise = new SimplexNoise();
var noiseTime = Math.random() * 1000;
var worldHolder;
var boundsMesh;
//temp vars for calcs
var up = new THREE.Vector3(0, 1, 0);
var vec = new THREE.Vector3();
var tangent = new THREE.Vector3();
var normal = new THREE.Vector3();
var col = new THREE.Color();

var guiParams = {
	//noiseSpeed: 0.001,
	noiseScale: 20,
	noiseSeparation: 0.1,
	ribbonSpeed: 0.05,

	ribbonWidth: 0.5,
	startRange: 100,
	clumpiness: 0.1

};

var Ribbon = function () {



};

Ribbon.prototype.init = function () {

	this.LEN = 40; //number of spine points

	this.velocity = new THREE.Vector3();
	this.speed = ATUtil.randomRange(5, 20);
	//this.ribbonWidth = ATUtil.randomRange(2, 12);
	this.ribbonWidth = guiParams.ribbonWidth;

	//head is the thing that moves, tail follows behind
	this.head = new THREE.Vector3();
	this.tail = new THREE.Vector3();

	//ADD MESH
	this.meshGeom = this.createMeshGeom();
	this.reset();
	this.meshMaterial = new THREE.MeshBasicMaterial({
		side: THREE.DoubleSide,
		//vertexColors: THREE.FaceColors,
		color: 0xcccccc,
		blending: THREE.AdditiveBlending,
		depthTest: true,
		transparent: true,
		//wireframe: true
	});

	this.mesh = new THREE.Mesh(this.meshGeom, this.meshMaterial);

};

Ribbon.prototype.createMeshGeom = function () {

	//make geometry, faces & colors for a ribbon
	var i;
	var geom = new THREE.Geometry();
	geom.vertexColors = [];

	//create verts + colors
	for (i = 0; i < this.LEN; i++) {
		geom.vertices.push(new THREE.Vector3());
		geom.vertices.push(new THREE.Vector3());
		geom.vertexColors.push(new THREE.Color());
		geom.vertexColors.push(new THREE.Color());
	}

	//create faces
	for (i = 0; i < this.LEN - 1; i++) {
		geom.faces.push(new THREE.Face3(i * 2, i * 2 + 1, i * 2 + 2));
		geom.faces.push(new THREE.Face3(i * 2 + 1, i * 2 + 3, i * 2 + 2));
	}
	return geom;
};

Ribbon.prototype.reset = function () {

	//reset a ribbon back to an emitter
	var i;
	this.id = Math.random() * guiParams.noiseSeparation;

	//move head and tail to an emitter or randomly in bounds
	if (Math.random() < guiParams.clumpiness) {
		var emitterId = ATUtil.randomInt(0, EMITTER_COUNT - 1);
		this.head.addVectors(emitters[emitterId], ATUtil.randomVector3(guiParams.startRange));
	} else {
		this.head.copy(ATUtil.randomVector3(BOUNDS));
	}

	//reset tail position
	this.tail.copy(this.head);

	//reset mesh geom
	for (i = 0; i < this.LEN; i++) {
		this.meshGeom.vertices[i * 2].copy(this.head);
		this.meshGeom.vertices[i * 2 + 1].copy(this.head);
	}

	//init colors for this ribbon
	//hue is set by start x position
	var hue = (this.head.x / (BOUNDS / 2)) / 2 + 0.5;
	if (Math.random() < 0.1) hue = Math.random();
	var sat = ATUtil.randomRange(0.6, 1);
	var lightness = ATUtil.randomRange(0.2, 0.6);

	for (i = 0; i < this.LEN - 1; i++) {
		//add lightness gradient based on spine position
		col.setHSL(hue, sat, (1 - i / this.LEN) * lightness / 4 + lightness * 3 / 4);
		this.meshGeom.faces[i * 2].color.copy(col);
		this.meshGeom.faces[i * 2 + 1].color.copy(col);
	}

	this.meshGeom.verticesNeedUpdate = true;
	this.meshGeom.colorsNeedUpdate = true;

};

Ribbon.prototype.update = function () {

	//MOVE HEAD

	this.tail.copy(this.head);

	//move head via noisefield
	//3 noisefields one for each axis (using offset of 50 to create new field)
	//3D noisefield is a greyscale 3D cloud with values varying from -1 to 1
	//4th dimension is time to make cloud change over time

	vec.copy(this.head).divideScalar(guiParams.noiseScale);

	this.velocity.x = noise.noise4d(vec.x, vec.y, vec.z, 0 + noiseTime + this.id) * this.speed * guiParams.ribbonSpeed;
	this.velocity.y = noise.noise4d(vec.x, vec.y, vec.z, 50 + noiseTime + this.id) * this.speed * guiParams.ribbonSpeed;
	this.velocity.z = noise.noise4d(vec.x, vec.y, vec.z, 100 + noiseTime + this.id) * this.speed * guiParams.ribbonSpeed;

	this.head.add(this.velocity);

	// ========
	// TODO : Choose Bounds for X, Y, Z not the same at the time
	// ========

	//reset if Out Of Bounds
	if (this.head.x > BOUNDS || this.head.x < -BOUNDS ||
		this.head.y > BOUNDS - 50 || this.head.y < -BOUNDS + 220 ||
		this.head.z > BOUNDS || this.head.z < -BOUNDS) {
		this.reset();
	}

	//UPDATE MESH GEOM

	//add 2 new verts onto the end of the mesh geometry
	//rather than push and pop we copy each vert into the previous one
	//to prevent memory thrashing

	//calc new L + R edge positions from tangent between head and tail
	tangent.subVectors(this.head, this.tail).normalize();
	vec.crossVectors(tangent, up).normalize();
	normal.crossVectors(tangent, vec);
	normal.multiplyScalar(this.ribbonWidth);

	//shift each 2 verts down one posn
	//e.g. copy verts (0,1) -> (2,3)
	for (var i = this.LEN - 1; i > 0; i--) {
		this.meshGeom.vertices[i * 2].copy(this.meshGeom.vertices[(i - 1) * 2]);
		this.meshGeom.vertices[i * 2 + 1].copy(this.meshGeom.vertices[(i - 1) * 2 + 1]);
	}

	//populate 1st 2 verts with left and right edges
	this.meshGeom.vertices[0].copy(this.head).add(normal);
	this.meshGeom.vertices[1].copy(this.head).sub(normal);

	this.meshGeom.verticesNeedUpdate = true;

};