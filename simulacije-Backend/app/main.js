import React from 'react';
import ReactDOM from 'react-dom';
import Login from './Login.js';
import Registracija from './Registracija.js';

class App extends React.Component{
	render(){
		return (
			<div>
			<Login />
			<Registracija />
			</div>
		);
	}
}

ReactDOM.render(<App />, document.getElementById('root'));
