/**
WAGNER.BlendMode = {
	Normal: 1,
	Dissolve: 2,      //
	Darken: 3,        
	Multiply: 4,      
	ColorBurn: 5,     
	LinearBurn: 6,    
	DarkerColor: 7,   //
	Lighten: 8,       
	Screen: 9,        
	ColorDodge: 10,   **
	LinearDodge: 11,  
	LighterColor: 12, //
	Overlay: 13,      
	SoftLight: 14,    *
	HardLight: 15,
	VividLight: 16,   //
	LinearLight: 17,
	PinLight: 18,     //
	HardMix: 19,      //
	Difference: 20,
	Exclusion: 21,
	Substract: 22,    //
	Divide: 23        //
};
**/


THREE.BlendShader = {

	uniforms: {
		tInput: {
			type: "t",
			value: null
		},
		tInput2: {
			type: "t",
			value: null
		},
		resolution: {
			type: "v2",
			value: new THREE.Vector2()
		},
		resolution2: {
			type: "v2",
			value: new THREE.Vector2()
		},
		aspectRatio: {
			type: "f",
			value: 1.0
		},
		aspectRatio2: {
			type: "f",
			value: 1.0
		},
		mode: {
			type: "i",
			value: 1
		},
		sizeMode: {
			type: "i",
			value: 1
		},
		opacity: {
			type: "f",
			value: 1.0
		},
	},

	vertexShader: [

		"varying vec2 vUv;",
		"varying vec3 vNormal;",
		"varying vec3 fNormal;",

		"void main() {",

			"vUv = uv;",
			"vNormal = normalMatrix * normal;",
			"fNormal = normal;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"varying vec2 vUv;",

		"uniform sampler2D tInput;",
		"uniform sampler2D tInput2;",
		"uniform vec2 resolution;",
		"uniform vec2 resolution2;",
		"uniform float aspectRatio;",
		"uniform float aspectRatio2;",
		"uniform int mode;",
		"uniform int sizeMode;",
		"uniform float opacity;",

		"vec2 vUv2;",

		"float applyOverlayToChannel(float base, float blend) {",
					"return (base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend)));",
		"}",

		"float applySoftLightToChannel(float base, float blend) {",
					"return ((blend < 0.5) ? (2.0 * base * blend + base * base * (1.0 - 2.0 * blend)) : (sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend)));",
		"}",

		"float applyColorBurnToChannel(float base, float blend) {",
					"return ((blend == 0.0) ? blend : max((1.0 - ((1.0 - base) / blend)), 0.0));",
		"}",

		"float applyColorDodgeToChannel(float base, float blend) {",
					"return ((blend == 1.0) ? blend : min(base / (1.0 - blend), 1.0));",
		"}",

		"float applyLinearBurnToChannel(float base, float blend) {",
					"return max(base + blend - 1., 0.0);",
		"}",

		"float applyLinearDodgeToChannel(float base, float blend) {",
					"return min(base + blend, 1.);",
		"}",

		"float applyLinearLightToChannel(float base, float blend) {",
					"return (blend < .5) ? applyLinearBurnToChannel(base, 2. * blend) : applyLinearDodgeToChannel(base, 2. * (blend - .5));",
		"}",


		"void main() {",

			"vUv2 = vUv;",


			///////////
			// SCALE //

			"if (sizeMode == 1) {",

				"if (aspectRatio2 > aspectRatio) {",
					"vUv2.x = vUv.x * aspectRatio / aspectRatio2;",
					"vUv2.x += .5 * (1. - aspectRatio / aspectRatio2);",
					"vUv2.y = vUv.y;",
				"}",

				"if (aspectRatio2 < aspectRatio) {",
					"vUv2.x = vUv.x;",
					"vUv2.y = vUv.y * aspectRatio2 / aspectRatio;",
					"vUv2.y += .5 * (1. - aspectRatio2 / aspectRatio);",
				"}",

			"}",


			///////////
			// BLEND //

			"vec4 base = texture2D(tInput, vUv);",
			"vec4 blend = texture2D(tInput2, vUv2);",

			// normal

			"if (mode == 1) { ",

				"gl_FragColor = base;",
				"gl_FragColor.a *= opacity;",
				"return;",

			"}",

			// dissolve

			"if (mode == 2) {",

			"}",

			// darken

			"if (mode == 3) { ",

				"gl_FragColor = min(base, blend);",
				"return;",

			"}",

			// multiply

			"if (mode == 4) {",

				"gl_FragColor = base * blend;",
				"return;",

			"}",

			// color burn

			"if (mode == 5) {",

				"gl_FragColor = vec4(",
					"applyColorBurnToChannel(base.r, blend.r),",
					"applyColorBurnToChannel(base.g, blend.g),",
					"applyColorBurnToChannel(base.b, blend.b),",
					"applyColorBurnToChannel(base.a, blend.a)",
				");",
				"return;",

			"}",

			// linear burn

			"if (mode == 6) {",

				"gl_FragColor = max(base + blend - 1.0, 0.0);",
				"return;",

			"}",

			// darker color

			"if (mode == 7) {",

			"}",

			// lighten

			"if (mode == 8) {",

				"gl_FragColor = max(base, blend);",
				"return;",

			"}",

			// screen

			"if (mode == 9) {",

				"gl_FragColor = (1.0 - ((1.0 - base) * (1.0 - blend)));",
				"gl_FragColor = gl_FragColor * opacity + base * (1. - opacity);",
				"return;",

			"}",

			// color dodge

			"if (mode == 10) {",

				"gl_FragColor = vec4(",
					"applyColorDodgeToChannel(base.r, blend.r),",
					"applyColorDodgeToChannel(base.g, blend.g),",
					"applyColorDodgeToChannel(base.b, blend.b),",
					"applyColorDodgeToChannel(base.a, blend.a)",
				");",
				"return;",

			"}",

			// linear dodge

			"if (mode == 11) {",

				"gl_FragColor = min(base + blend, 1.0);",
				"return;",
			"}",

			// lighter color

			"if (mode == 12) {",

			"}",

			// overlay

			"if (mode == 13) {",

				"gl_FragColor = gl_FragColor = vec4(",
					"applyOverlayToChannel(base.r, blend.r),",
					"applyOverlayToChannel(base.g, blend.g),",
					"applyOverlayToChannel(base.b, blend.b),",
					"applyOverlayToChannel(base.a, blend.a)",
				");",
				"gl_FragColor = gl_FragColor * opacity + base * (1. - opacity);",

				"return;",

			"}",

			// soft light

			"if (mode == 14) {",

				"gl_FragColor = vec4(",
					"applySoftLightToChannel(base.r, blend.r),",
					"applySoftLightToChannel(base.g, blend.g),",
					"applySoftLightToChannel(base.b, blend.b),",
					"applySoftLightToChannel(base.a, blend.a)",
				");",
				"return;",

			"}",

			// hard light

			"if (mode == 15) {",

				"gl_FragColor = vec4(",
					"applyOverlayToChannel(base.r, blend.r),",
					"applyOverlayToChannel(base.g, blend.g),",
					"applyOverlayToChannel(base.b, blend.b),",
					"applyOverlayToChannel(base.a, blend.a)",
				");",
				"gl_FragColor = gl_FragColor * opacity + base * (1. - opacity);",
				"return;",

			"}",

			// vivid light

			"if (mode == 16) {",

			"}",

			// linear light

			"if (mode == 17) {",

				"gl_FragColor = vec4(",
					"applyLinearLightToChannel(base.r, blend.r),",
					"applyLinearLightToChannel(base.g, blend.g),",
					"applyLinearLightToChannel(base.b, blend.b),",
					"applyLinearLightToChannel(base.a, blend.a)",
				");",
				"return;",

			"}",

			// pin light

			"if (mode == 18) {",

			"}",

			// hard mix

			"if (mode == 19) {",

			"}",

			// difference

			"if (mode == 20) {",

				"gl_FragColor = abs(base - blend);",
				"gl_FragColor.a = base.a + blend.b;",
				"return;",

			"}",

			// exclusion

			"if (mode == 21) {",

				"gl_FragColor = base + blend - 2. * base * blend;",

			"}",

			// substract

			"if (mode == 22) {",

			"}",

			// divide

			"if (mode == 23) {",

			"}",

			"gl_FragColor = vec4(1., 0., 1., 1.);",

		"}",

	].join("\n")

};