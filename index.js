import './style';
import { Component } from 'preact';


import './lib/tracking'; //
import './lib/face'; //
import './lib/mouth'; //
import  './lib/eye'; // 


export default class App extends Component {
	startVideo(stream) {
		const video = document.querySelector('video');
		video.src = window.URL.createObjectURL(stream);
		video.play();
	}

	componentDidMount(){
		let captured = false;
		let video = document.getElementById('video');
		let trackingCanvas = document.querySelector('.canvas2'); //

		//var mediaStreamTrack;
		//var imageCapture;
		let mediaStream;

		function stopVideo(stream) {
			const video = document.querySelector('video');
			video.parentNode.removeChild(video);
		
			// free memory before page unloading
			window.URL.revokeObjectURL(stream);
		}
		
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
			const snapshot = canvas.toDataURL('image/png');
			canvas.parentNode.removeChild(canvas);
		
			// update grid picture source
			document.querySelector('#grid').setAttribute('src', snapshot);
		}

		// if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
		// 	navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
		// 		mediaStream = stream;
		// 		video.src = window.URL.createObjectURL(stream);
		// 		video.play();
		// 	});
		// }

		document.getElementById('capture').addEventListener('click', () => {
			if (!captured) {
				capture();
				//stopVideo(mediaStream);
				captured = true;
			}
			else {
				captured = false;
			}
		});

		document.querySelector('.Done').addEventListener('click', () => {
			stopVideo(mediaStream);
		});

		let tracker = new tracking.ObjectTracker('face'); //

		tracker.setInitialScale(4); //
		tracker.setStepSize(2); //
		tracker.setEdgesDensity(0.1); //
		tracking.track('#video', tracker, {camera : true}); //

		tracker.on('track', function(event) { //

		trackingCanvas.getContext('2d').clearRect(0, 0, trackingCanvas.width, trackingCanvas.height); //
		event.data.forEach(function(rect) { //
			trackingCanvas.getContext('2d').strokeStyle = '#a64ceb'; //
			trackingCanvas.getContext('2d').strokeRect(rect.x, rect.y, rect.width, rect.height); //
			trackingCanvas.getContext('2d').font = '11px Helvetica'; //
			trackingCanvas.getContext('2d').fillStyle = "#fff"; //
			trackingCanvas.getContext('2d').fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11); //
			trackingCanvas.getContext('2d').fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22); //
        	}); //
      	}); 
	}


	render() {
		return (
			<div class="thumbnailContainer">
				<center class="tracking-container">
					<video id="video" width="640" height="480" autoplay />
					<canvas class="canvas2" width="640" height="480" />
				</center>
				<div id="stream"></div>
				<img id="grid" src="#" />
				<p class="actions"><button id="capture">Capture</button></p>
				<p class="button"><button class="Done">Done</button></p>
			</div>
		);
	}
}
