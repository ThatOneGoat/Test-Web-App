import './style';
import { Component } from 'preact';

export default class App extends Component {
	render() {
		var today = new Date(Date.now()).toDateString();
		return (
			<div>
				<h1>{today}</h1>
			</div>
		);
	}
}
