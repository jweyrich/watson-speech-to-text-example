This application demonstrates how to use the Watson's Speech to Text API.

It can translate speech from microphone or audio files.

## How to run?

	node ./recognize.js \
	  --username=REPLACE \
	  --password=REPLACE \
	  --input_source=audio-file \
	  --input_file=./dvd_rip.ogg \
	  --input_content_type=audio/ogg

## How to extract audio from a DVD?

    nice ffmpeg -i concat:VTS_01_1.VOB\|VTS_01_2.VOB\|VTS_01_3.VOB\|VTS_01_4.VOB -vn -acodec libvorbis ./dvd_rip.ogg

## How to use Watson Speech-to-text?

https://cloud.ibm.com/apidocs/speech-to-text
