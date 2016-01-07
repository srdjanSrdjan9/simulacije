import React from 'react';
import Datagrid from 'react-datagrid';

var DataShow = React.createClass ({
getInitialState: function(){
	return ({ role: -1, columns: [
		{ name: 'email' },
		{ name: 'name'},
		{ name: 'registrationDate' },
		{ name: 'role'},
		{ name: 'score' }
	], data: [] });
},
	getReport:function() {
	fetch('http://localhost:3000/getReport', {
		method:'get'
	}).then((response) => {
		if (response.status == 200) {
			return response;
		} else {
			var error = new Error('doslo je do greske na serveru prilikom generisanja izvestaja');
				error.response = response;
				throw error;
		}
	}).then((response) => {
		return response.blob();
	}).then((response) => {
            var blob = new Blob([response], {type:'blob'});
            alert('Izvestaj je uspesno primljen');
            fs.saveAs(blob, "report.xlsx");
	}).catch((error) => {
		alert(error);
	})
},
	getUsers: function() {
		console.log('saljem zahtev za korisnicima');
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
			data = [];
			var helper = response;
			helper.forEach((u) => {
				var user = {};
				user.email = u.email;
				user.name = u.name;
				var date = u.registrationDate.toString().split('T');
				user.registrationDate = date[0];

				if (u.role === 1) {
					user.role = 'admin';
				} else {
					user.role = 'user';
				}
				user.score = u.score;
				data.push(user);
			});
			this.setState({data});
			 	console.log(data);
		}).catch((error) => {
			alert(error);
		});
		
	},

	render: function() {
		return (
			<div>
			<h1>Podaci o igracima </h1>
			<Datagrid 
			idProperty = "id"
			dataSource = { this.state.data } 
			columns = { this.state.columns }
			style = { this.props.style } 
			/>
			<button onClick = {this.getUsers.bind(this)} >Get scores </button>
			<button onClick = {this.getReport.bind(this)} >Get report </button>
			</div>
			);
	}
} );

export default DataShow