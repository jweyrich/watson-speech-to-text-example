//
// REFERENCE: https://cloud.ibm.com/apidocs/speech-to-text
//

var mic = require('mic')
  , watson = require('watson-developer-cloud')
  , fs = require('fs')
  , yargs = require('yargs')
  ;

const argv = yargs
	.options({
		'username': {
			description: 'Username to use the Watson API',
			required: true,
			alias: 'u'
		},
		'password': {
			description: 'Password to use the Watson API',
			required: true,
			alias: 'p'
		},
		'input_source': {
			description: 'Input audio source',
			required: false,
			alias: 's',
			default: 'microphone'
		},
		'input_file': {
			description: 'Which file to read audio from',
			required: false,
			alias: 'i'
		},
		'input_content_type': {
			description: 'Specify the format/type of the input audio file',
			required: false,
			short: 't',
			default: 'audio/ogg'
		}
	}).argv;

const speech_to_text = watson.speech_to_text({
	username: argv.username,
	password: argv.password,
	version: 'v1'
});

var recognizeStream = null;

// Pipe in the audio.
switch (argv.input_source) {
	default:
		console.error('Unsupported input method.');
		process.exit(1);
	case 'audio-file':
		var params = {
			content_type: argv.input_content_type,
			model: 'pt-BR_BroadbandModel',
			continuous: true,
			interim_results: true
		};

		// Create the stream.
		recognizeStream = speech_to_text.createRecognizeStream(params);
		fs.createReadStream(argv.input_file).pipe(recognizeStream);
		break;
	case 'microphone':
		var params = {
			content_type: 'audio/l16;rate=16000',
			model: 'pt-BR_BroadbandModel',
			continuous: true,
			interim_results: true
		};

		// Create the stream.
		recognizeStream = speech_to_text.createRecognizeStream(params);

		var micInstance = mic({
			'rate': '16000',
			'channels': '1',
			'debug': false,
			'exitOnSilence': 10
		});
		var micInputStream = micInstance.getAudioStream();
		micInputStream.pipe(recognizeStream);

		micInputStream.on('data', (data) => {
			//console.log("Recieved Input Stream: " + data.length);
		});
 
		micInputStream.on('error', (err) => {
			console.error("Error in Input Stream: " + err);
		});
	 
		micInputStream.on('startComplete', () => {
			console.log("Got SIGNAL startComplete");
		});
		
		micInputStream.on('stopComplete', () => {
			console.log("Got SIGNAL stopComplete");
		});

		micInputStream.on('pauseComplete', () => {
			console.log("Got SIGNAL pauseComplete");
		});

		micInputStream.on('resumeComplete', () => {
			console.log("Got SIGNAL resumeComplete");
		});

		micInputStream.on('silence', () => {
			console.log("Got SIGNAL silence");
		});

		micInputStream.on('processExitComplete', () => {
			console.log("Got SIGNAL processExitComplete");
		});

		micInstance.start();
		break;
}

// Pipe out the transcription to a file.
recognizeStream.pipe(fs.createWriteStream('transcript.txt'));

// Get strings instead of buffers from 'data' events.
recognizeStream.setEncoding('utf8');

// Listen for events.
recognizeStream.on('data', function(event) { onEvent('Data:', event); });
recognizeStream.on('results', function(event) { onEvent('Results:', event); });
recognizeStream.on('error', function(event) { onEvent('Error:', event); });
recognizeStream.on('close-connection', function(event) { onEvent('Close:', event); });

// Displays events on the console.
function onEvent(name, event) {
	if (typeof event === 'string') {
		console.log(event);
	}
	//console.log(name, JSON.stringify(event, null, 2));
}
