import './style';
import { Component } from 'preact';

export default class App extends Component {
	startVideo(stream) {
		const video = document.querySelector('#stream video');
		video.src = window.URL.createObjectURL(stream);
		video.play();
	}

	componentDidMount(){
		let video = document.getElementById('video');
		//const canvas = document.querySelector('canvas');

		//var mediaStreamTrack;
		//var imageCapture;
		var mediaStream;

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

		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
				mediaStream = stream;
				video.src = window.URL.createObjectURL(stream);
				video.play();
			});
		}

		document.getElementById('capture').addEventListener('click', () => {
			capture();
			stopVideo(mediaStream);
		});
	}


	render() {
		return (
			<div class="thumbnailContainer">
				<center>
					<video id="video" width="640" height="480" autoplay />
				</center>
				<div id="stream"></div>
				<img id="grid" src="#" />
				<p class="actions"><button id="capture">Capture</button></p>
			</div>
		);

	}

	/* <center>
					<video id="video" width="640" height="480" autoplay />
				</center> */
}
