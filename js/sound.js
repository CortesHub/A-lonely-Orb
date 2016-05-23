/*
 * Audio reactions with three.js
 * @author Aureaboros <http://aureaboros.com>
 */

// TODO : to much things

// Ressources : http://www.teachmeaudio.com/mixing/techniques/audio-spectrum
// Bass   : 20  <-> 250 (0 <-> 15)
// Medium : 250 <-> 2k	(15 <-> 57)
// Treble : 2k  <-> 13k (57 <-> 313)

if (!window.AudioContext) {
	if (!window.webkitAudioContext) {
		alert('no audiocontext found');
	}
	window.AudioContext = window.webkitAudioContext;
}
var ctxAudio = new AudioContext();
var audioBuffer;
var sourceNode;
var splitter;
var analyser;
var gain;
var javascriptNode;
var audioResult = 0;
var bufferSource;
var file;
var url = '';
var totalTime = 0;
var currentTime = 0;
var timeSpend = 0;

//

var audioAverage,
	audioBass,
	audioMedium,
	audioTreble;

//

var ANALOG = '';

//

var btnPlay = document.getElementById('playAudio');
var btn__ui = document.querySelector('.confirmQ');


btnPlay.onclick = function () {

	if (btnPlay.classList.contains('new')) {

		playSound(bufferSource);
		btnPlay.classList.remove('new');
		btnPlay.classList.add('running');
		btnPlay.classList.add('playing');

	} else {

		if (ctxAudio.state === 'running') {
			ctxAudio.suspend().then(function () {
				btnPlay.classList.remove('playing');
				btnPlay.classList.add('stopped');
			});
		} else if (ctxAudio.state === 'suspended') {
			ctxAudio.resume().then(function () {
				btnPlay.classList.remove('stopped');
				btnPlay.classList.add('playing');
			});
		}

	}

}

//

function playerLoading() {
	// iu__main
	btn__ui.classList.remove('ready');
	btn__ui.classList.add('loading');
	btn__ui.classList.remove('playing');
	// ui__song
	btnPlay.classList.remove('ready');
	btnPlay.classList.add('loading');
	btnPlay.classList.remove('playing');
}

function playerReady() {
	// ui--main
	btn__ui.classList.remove('loading');
	btn__ui.classList.remove('disabled');
	btn__ui.classList.add('activated');
	// ui--song
	btnPlay.classList.remove('loading');
	btnPlay.classList.add('ready');
	//btnPlay.classList.add('new');
}

function playerFinish(tm) {
	ctxAudio.close();
	btnPlay.classList.remove('running');
	btnPlay.classList.remove('playing');

	document.getElementById('musicTitle').innerHTML = '';
	document.querySelector('.loading-song h1').innerHTML = '';

	tm.style.transform = 'scale3d(0, 1, 1)';
	
	document.querySelector('.ui--ending').style.display = 'block';
}

//

function stopEvent(event) {
	event.preventDefault();
	event.stopPropagation();
}

function dropAudio(event) {
	stopEvent(event);
	playerLoading();
	ctxAudio.close();
	var file = event.dataTransfer.files[0];
	url = null;
	url = URL.createObjectURL(file);
	//
	passion = new Aureaboros(params);
	passion.initSound();
	//
	document.getElementById('musicTitle').innerHTML = file.name;
	document.querySelector('.loading-song h1').innerHTML = file.name;
}

//

function setupAudioNodes() {

	ctxAudio = new AudioContext();

	// setup a javascript node
	javascriptNode = ctxAudio.createScriptProcessor(2048, 1, 1);
	// connect to destination, else it isn't called
	javascriptNode.connect(ctxAudio.destination);

	// setup a analyzer
	analyser = ctxAudio.createAnalyser();
	analyser.smoothingTimeConstant = .4;
	analyser.fftSize = 1024;

	// create a buffer source node
	sourceNode = ctxAudio.createBufferSource();
	splitter = ctxAudio.createChannelSplitter();

	// connect the source to the analyser and the splitter
	sourceNode.connect(splitter);

	// connect one of the outputs from the splitter to
	// the analyser
	splitter.connect(analyser, 0, 0);

	// connect the splitter to the javascriptnode
	// we use the javascript node to draw at a
	// specific interval.
	analyser.connect(javascriptNode);

	//        splitter.connect(ctxAudio.destination,0,0);
	//        splitter.connect(ctxAudio.destination,0,1);

	// gain node ( volume de sortie )
	//gain = ctxAudio.createGain();
	//gain.connect(ctxAudio.destination);

	// and connect to destination
	sourceNode.connect(ctxAudio.destination);
}

// load the specified sound
function loadSound(url) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';

	// When loaded decode the data
	request.onload = function () {
		// decode the data
		ctxAudio.decodeAudioData(request.response, function (buffer) {
			// when the audio is decoded play the sound
			playerReady();
			totalTime = buffer.duration;
			bufferSource = buffer;
		}, onError);
	}
	request.send();
}

function playSound(buffer) {
	if (buffer !== undefined) {
		sourceNode.buffer = buffer;
		sourceNode.start();
	} else {
		console.log('buffer undefined');
	}
}

function onError(e) {
	console.log(e);
}

function getAverageVolume(array, min, max, clamp, sub) {
	ANALOG = array;

	// in
	var mini = min;
	var maxi = max;
	var clamping = clamp;
	var i = 0,
		j = 0;
	var average;
	var values = 0;
	var length = (maxi - mini) + 1;


	for (i = mini; i < maxi; i++) {
		// take only values != 0
		if (clamping === true) {
			if (array[i] == 0) {
				j++;
			} else {
				values += array[i];
			}
		}
		// take all values
		else {
			values += array[i];
		}
	}


	if (clamping === true) {
		average = values / (length - j);
	} else {
		average = values / length;
	}

	average /= sub;

	// out
	return average;
}