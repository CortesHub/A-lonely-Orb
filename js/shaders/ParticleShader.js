THREE.ParticleShader = {

	uniforms: {
		"texture1": {
			type: "t",
			value: null
		},
		"scale": {
			type: "f",
			value: 1.0
		},
		"color": {
			type: "v3",
			value: new THREE.Vector3(.5,.5,.5)
		},
		"globalTime": {
			type: "f",
			value: 0
		}
	},

	vertexShader: [

		"attribute float size;",
		"attribute vec3 customColor;",

		"uniform float scale;",
		"uniform float globalTime;",

		"varying vec3 vColor;",

		"void main() {",

			"vColor = customColor;",
			"vec3 pos = position;",

			// time
			"float localTime = globalTime;",
			
			"float velocity = 50.;",
			// ( cos(GT + p.z) * velocity ) + sound
			"pos.x += (cos(globalTime + position.z) * velocity ) + scale * .25; ",
			"pos.y += (sin(globalTime + position.x) * velocity ) + scale * .25; ",
			"pos.z += (sin(globalTime + position.y) * velocity ) + scale * .25; ",
		
			"vec3 animated = vec3( pos.x, pos.y, pos.z);",
			"vec4 mvPosition = modelViewMatrix * vec4( animated , 1.0 );",

			"gl_PointSize = size * ( (21.0 * (scale + 1.)) / length( mvPosition.xyz ) );",
			"gl_Position = projectionMatrix * mvPosition;",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform vec3 color;",
		"uniform sampler2D texture1;",
		"uniform float scale;",

		"varying vec3 vColor;",

		
		"void main( void ) {",
			"gl_FragColor = vec4( 1., 1., 1., scale );",
			"gl_FragColor = gl_FragColor * texture2D( texture1, gl_PointCoord );",
		"}"

	].join("\n")

};