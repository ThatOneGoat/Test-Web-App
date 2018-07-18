import './style'; //import cs file
import {
	Component
} from 'preact'; //import preact stuff

//Test imports
import './lib/tracking';
import './lib/face';
import './lib/mouth';
import './lib/eye';

import FaceJS from "./face"; //Import wrapper
import keys from './apikeys'; //Import keys

export default class App extends Component {
	//Set default display messagd when no JSON response acquired (temporary for testing)
	state = {
		jsonResponse: '?'
	}

	//Test 
	/* startVideo(stream) {
		const video = document.querySelector('video');
		video.src = window.URL.createObjectURL(stream);
		video.play();
	} */

	//Invoked after updating occurs
	componentDidMount() {
		let captured = false;
		let video = document.getElementById('video'); //THis is used when face tracking is off and only the webcam is being instantiated
		let trackingCanvas = document.querySelector('.canvas2'); //tracking canvas

		let mediaStream; //stores stream object
		let calibrated; //calibrated image
		let current; //current image
		let faceCalibrated; //calibrated face ID
		let counter = 0; //defines what will be considered calibrated - when counter = 0 - and when current - not 0
		let key1 = keys.key1; //sub key 1
		let key2 = keys.key2; //sub key 2

		let faceJS = new FaceJS(key1, "westcentralus"); //Declaration of new wrapper object

		function compare(calibrated, current) { //creating a hardcoded slouch detector (move to machine learning?)
			if (abs(current.x - calibrated.x) > 100) {
				console.log("you slouch");
			}
			if (current.y - calibrated.y < -100) {
				console.log("you slouch");
			}
			if (current.x * current.y > 500) {
				console.log("you slouch");
			}
		}



		let processImage = (image) => { //process an image (get a JSON file)
			//console.log(image); //test

			var sourceImageUrl = image

			//All this converts png to Uint8Array to send to Azure
			var data = sourceImageUrl.split(',')[1];
			var mimeType = sourceImageUrl.split(';')[0].slice(5)

			var bytes = window.atob(data);
			var buf = new ArrayBuffer(bytes.length);
			var byteArr = new Uint8Array(buf);

			for (var i = 0; i < bytes.length; i++) {
				byteArr[i] = bytes.charCodeAt(i);
			}


			// Perform the REST API call.
			/* fetch(`${uriBase}?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age%2Cgender%2CheadPose%2Csmile%2CfacialHair%2Cglasses%2Cemotion%2Chair%2Cmakeup%2Cocclusion%2Caccessories%2Cblur%2Cexposure%2Cnoise`, {
				method: "POST",
				headers: new Headers({
					"Content-Type": "application/octet-stream",
					"Ocp-Apim-Subscription-Key": subscriptionKey
				}),
				body: byteArr
			})
				.then(response => {
					response.json()
						.then(text => {
							console.log("worked");
							this.setState({ jsonResponse: JSON.stringify(text) });
						});
				})
				.catch(error => {
					console.log(error);
				}); */

			//wrapper class version of above REST call
			return faceJS.detectFaces(byteArr, true, true).then(text => {
				this.setState({ jsonResponse: JSON.stringify(text) });
				let id = text[0].faceId;
				return id;
			});
		}

		//stops video, clearing out the feed on the page and unloading memory
		function stopVideo(stream) {
			const video = document.querySelector('video');
			video.parentNode.removeChild(video);

			// free memory before page unloading
			window.URL.revokeObjectURL(stream);
		}

		//captures a frame of a stream
		function capture() {
			// add canvas element
			let canvas = document.createElement('canvas');

			// set canvas dimensions to video ones to not truncate picture
			const videoElement = document.querySelector('video');
			canvas.width = videoElement.width;
			canvas.height = videoElement.height;

			// copy full video frame into the canvas
			document.getElementsByClassName('thumbnailContainer')[0].appendChild(canvas);
			canvas.getContext('2d').drawImage(videoElement, 0, 0, videoElement.width, videoElement.height);

			// get image data URL and remove canvas
			let snapshot = canvas.toDataURL('image/png');
			canvas.parentNode.removeChild(canvas);

			// update grid picture source
			document.querySelector('#grid').setAttribute('src', snapshot);

			if (counter == 0) { //if first capture click, get a calibrated face ID
				calibrated = snapshot;
				processImage(calibrated).then(id => {
					faceCalibrated = id;
				});
			} else { //otherwise get a current face ID
				current = snapshot;
				processImage(current).then(id => {
					faceJS.verifyFace(faceCalibrated, id).then(text => {
						console.log(JSON.stringify(text));
					});
				});
			}
			counter++; //increment counter after each call
		}


		//Starting Webcam without using face tracking
		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			navigator.mediaDevices.getUserMedia({
				video: true
			}).then(function (stream) {
				mediaStream = stream;
				video.src = window.URL.createObjectURL(stream);
				video.play();
			});
		}

		const ticker = setInterval(() => {
			console.log("ticking");
			capture();
		}, 5000);

		document.getElementById('capture').addEventListener('click', () => { //capture click
			if (!captured) {
				capture();
				captured = true;
			} else {
				captured = false;
			}
		});

		document.querySelector('.Done').addEventListener('click', () => { //done click
			stopVideo(mediaStream);
		});

		let tracker = new tracking.ObjectTracker('face');

		tracker.setInitialScale(4);
		tracker.setStepSize(0.1);
		tracker.setEdgesDensity(0.1);
		tracking.track('#video', tracker, {
			camera: true
		});

		tracker.on('track', function (event) {
			trackingCanvas.getContext('2d').clearRect(0, 0, trackingCanvas.width, trackingCanvas.height);
			event.data.forEach(function (rect) {
				trackingCanvas.getContext('2d').strokeStyle = '#a64ceb';
				trackingCanvas.getContext('2d').strokeRect(rect.x, rect.y, rect.width, rect.height);
				trackingCanvas.getContext('2d').font = '11px Helvetica';
				trackingCanvas.getContext('2d').fillStyle = "#fff";
				trackingCanvas.getContext('2d').fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
				trackingCanvas.getContext('2d').fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
			});
		});

		//document.addEventListener("seeking", () => {

		//});
	}

	render() {
		return (
			<div class="thumbnailContainer">
				<center class="tracking-container">
					<video id="video" width="640" height="480" autoplay />
					<canvas class="canvas2" width="640" height="480" />
				</center>
				<div id="stream" />
				<div id="jsonOutput" style="width:600px; display:table-cell;">
					Response:
					<textarea id="responseTextArea" class="UIInput" style="width:580px; height:400px;">
						{this.state.jsonResponse}
					</textarea>
				</div>
				<img id="grid" src="#" />
				<p class="actions" > <button id="capture" > Capture </button></p>
				<p class="button" > <button class="Done" > Done </button></p>
			</div>
		);
	}
}