import './style';
import { Component } from 'preact';

export default class App extends Component {
	componentDidMount(){
		var video = document.getElementById('video');
		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			 navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
			 video.src = window.URL.createObjectURL(stream);
			 video.play();
			});
		}

		let i = 0;

		video.addEventListener('loadeddata', function() {
			this.currentTime = i;
		});

		video.addEventListener('seeked', function() {

			// now video has seeked and current frames will show
			// at the time as we expect
			generateThumbnail(i);
		
			// when frame is captured increase, here by 5 seconds
			i += 5;
		
			// if we are not passed end, seek to next interval
			if (i <= this.duration) {
				// this will trigger another seeked event
				this.currentTime = i;
			}
			else {
				// Done!, next action
			}
		});

		function generateThumbnail(i) {
			//generate thumbnail URL data
			let thecanvas = document.getElementByClass('canvas');
			let context = thecanvas.getContext('2d');
			context.drawImage(video, 0, 0, 220, 150);
			let dataURL = thecanvas.toDataURL();
		
			//create img
			let img = document.createElement('img');
			img.setAttribute('src', dataURL);
		
			//append img in container div
			document.getElementByClass('thumbnailContainer').appendChild(img);
		}
	}


	render() {
		return (
			<div class = "thumbnailContainer">
				<center>
					<video id="video" width="640" height="480" autoplay />
					<canvas class="canvas" />
				</center>
			</div>
		);

	}
}
