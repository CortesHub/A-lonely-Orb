THREE.DirtyLensShader = {

	uniforms: {
		"tDiffuse": {
			type: "t",
			value: null
		},
		"tHex": {
			type: "t",
			value: null
		},
		"tVideo": {
			type: "t",
			value: null
		},
		"size": {
			type: "f",
			value: 512.0
		},
		"color": {
			type: "c",
			value: new THREE.Color(0x458ab1)
		},
		"scale": {
			type: "f",
			value: 0.0
		},
		"aspectRatio": {
			type: "f",
			value: 1.0
		},
		"aspectRatio2": {
			type: "f",
			value: 1.0
		}
	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float size;",
		"uniform vec3 color;",
		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tHex;",
		"uniform sampler2D tVideo;",
		"uniform float scale;",
		"uniform float aspectRatio;",
		"uniform float aspectRatio2;",

		"varying vec2 vUv;",

		"float applyOverlayToChannel( float base, float blend ) {",
			"return (base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend)));",
		"}",
		"float applySoftLightToChannel( float base, float blend ) {",
			"return ((blend < 0.5) ? (2.0 * base * blend + base * base * (1.0 - 2.0 * blend)) : (sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend)));",
		"}",


		"void main() {",

			"vec4 vcolor = vec4(color,1.0);",

			// Fit blend texture to screen
			"vec2 vUv2 = vUv;",
			"if( aspectRatio2 > aspectRatio ) {",
				"vUv2.x = vUv.x * aspectRatio / aspectRatio2;",
				"vUv2.x += .5 * ( 1. - aspectRatio / aspectRatio2 );",
				"vUv2.y = vUv.y;",
			"}",

			"if( aspectRatio2 < aspectRatio ) {",
				"vUv2.x = vUv.x;",
				"vUv2.y = vUv.y * aspectRatio2 / aspectRatio;",
				"vUv2.y += .5 * ( 1. - aspectRatio2 / aspectRatio );",
			"}",

			"vec4 base = texture2D( tDiffuse, vUv );",
			"vec4 blend = texture2D( tHex, vUv2 ) * vcolor;",
			"vec4 video = texture2D( tVideo, vUv2 );",

			// Custom Vignette
			"float tolerance = 0.35;",
			"float vignette_size = 0.67;",
			"vec2 powers = pow(abs(vec2(vUv.x - 0.5,vUv.y - 0.5)),vec2(2.0));",
			"float radiusSqrd = vignette_size*vignette_size;",
			"float gradient = smoothstep(radiusSqrd-tolerance, radiusSqrd+tolerance, powers.x+powers.y);",
			"vec4 blended = (vec4(gradient) * blend);",

			// Soft Light
			//"vec4 FinalColor = vec4( applySoftLightToChannel( base.r, blended.r * scale ), applySoftLightToChannel( base.g, blended.g * scale ), applySoftLightToChannel( base.b, blended.b * scale ), applySoftLightToChannel( base.a, blended.a * scale ) );",
			
			// Overlay
			"float opacity = 0.5;",
			"vec4 FinalColor = gl_FragColor = vec4( applyOverlayToChannel( base.r, blended.r ), applyOverlayToChannel( base.g, blended.g ), applyOverlayToChannel( base.b, blended.b ), applyOverlayToChannel( base.a, blended.a ) );",
		
			// Last Compute
			"FinalColor = FinalColor * opacity + base * ( 1. - opacity );",
		
			// Output Color
			"gl_FragColor = ((scale*.7 * blended) + base) * video;",
			//"gl_FragColor = video;",

		"}"

	].join("\n")

};