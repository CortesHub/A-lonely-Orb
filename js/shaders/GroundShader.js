THREE.GroundShader = {

	uniforms: {
		"textRepeat": {
			type: 'f',
			value: 1
		},
		"scale": {
			type: "f",
			value: 0
		},
		"globalTime": {
			type: "f",
			value: 0
		}
	},

	vertexShader: [

		"uniform float textRepeat;",
		"uniform float scale;",
		"uniform float globalTime;",

		"varying vec2 vUv;",
		"varying float dist;",
		"varying float distA;",

		
		"void main() {",
			"vUv = uv * textRepeat;",
		
			// SOMBRERO
			"vec3 animate = position.xyz;",
			"float distance = sqrt( (animate.x * animate.x) + (animate.y * animate.y) );",
			"float bounds = 15.;",
			"float repeat = 0.05;",
			"float repeat2 = 2.;",
			"animate.z = sin( (globalTime * -0.005 + distance * repeat2) * repeat ) * ( abs( pow(bounds, 1. - distance* .005) ));", // big curve

			"dist = distance;",
			"distA = animate.z;",
			
			"vec3 finalPos = vec3(position.x, position.y, animate.z * scale);",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( finalPos , 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float scale;",
		"uniform float globalTime;",

		"varying vec2 vUv;",
		"varying float dist;",
		"varying float distA;",
		
		
		"void main( void ) {",
			"vec3 FinalColor = vec3(1., 1., 1.);",
		
			// TODO : revoir le blending et le mix()
			// curveClr -1;1 
			// DIST : distance (xy)
			// DISTA: hauteur (z)
		
			// clamping final color // [-1.[ - ]1.] ? 
			//"float curveClr = clamp( distA* 1.-dist*0.005, .109, 0.109 + scale);",
			"float curveClr = distA* 1.-dist*0.005;",
		
			"if( curveClr > 0.109 ) {",
				"FinalColor = mix( vec3(vUv, 1.), vec3(0.109), -curveClr*.891 + 1.0) ;",
				// UV Rotator
				"vec2 MED = vec2(0.5);",
				"vec2 p = vUv - MED;",
				"float a = globalTime * 0.005;",
				"float c = cos(a);",
				"float s = sin(a);",
				"vec2 fUV = vec2( p.x*c - p.y*s, p.x*s + p.y*c );",
				"vec3 cor = FinalColor * vec3(MED+fUV, scale);",
				"FinalColor = cor;",
			"} else {",
				"FinalColor = vec3(0.109);",
			"}",
		
			"gl_FragColor = vec4(FinalColor, scale);",
		
		"}"

	].join("\n")

};