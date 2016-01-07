import React from 'react';
import Datagrid from 'react-datagrid';

export default class DataShow extends React.Component {

	constructor(props) {
		super(props);
		this.state = { 
			role: props.role,
			data: props.data,
			columns: props.columns
	 };
	}

	getUsers() {
		fetch('http://localhost:3000/getUsers', {
			method: 'get'			
		}).then((response) => {
			if (response.status == 200) {
				console.log(response.status);
			 return response.json();	
			} else {
				var error = new Error('Doslo je do greske pokusajte ponovo');
				error.response = response;
				throw error;
			}
		}).then((response) => {
			this.state.data = response;
			var helper = response;
			// helper.forEach((u) => {
			// 	var user = {};
			// 	user.name = u.name;
			// 	user.email = u.email;
			// 	user.score = u.score;

			// 	if (u.role === 1) {
			// 		user.role = 'admin';
			// 	} else {
			// 		user.role = 'user';
			// 	}
			// 	var date = u.registrationDate.toString().split("T");
			// 	user.registrationDate = date[0];
			// 	this.props.data.push(user);
			// });
			 	console.log(this.state.data);
		}).catch((error) => {
			alert(error);
		});
		
	}

	render() {
		return (
			<div>
			<h1>Podaci o igracima </h1>
			<Datagrid idProperty = "id" dataSource = { this.state.data } columns = { this.state.columns } />
			<button onClick = {this.getUsers.bind(this)} >Get scores </button>
			</div>
			);
	}
} 
	DataShow.propTypes = { role: React.PropTypes.number, data: React.PropTypes.array, columns: React.PropTypes.array };
	DataShow.defaultProps = { role: -1, columns: [
		{ name: 'email' },
		{ name: 'name'},
		{ name: 'registrationDate' },
		{ name: 'role'},
		{ name: 'score' }
	], data: [] };	