import React from 'react';
import Datagrid from 'react-datagrid';

export default class DataShow extends React.Component {

	var data = {};
	var columns = {};

	constructor(props) {
		super(props);
		this.props = { role: -1 };
	}

	getUsers() {
		fetch('http://localhost:3000/getUsers', {
			method: 'get'			
		}).then((response) => {
			if (response.status == 200) {
			 return response;	
			} else {
				var error = new Error('Doslo je do greske pokusajte ponovo');
				error.response = response;
				throw error;
			}
		}).then((response) => {
			console.log(response.body);
			var helper = response.body;

		}).catch((error) => {
			alert(error);
		});
		
	}

	render() {
		return (
			<div>
			<h1>Podaci o igracima </h1>
			<Datagrid idProperty = "id" dataSource = { data } columns = { columns } />
			<button onClick = {this.getUsers} >Get scores </button>
			</div>
			);
	}
} 