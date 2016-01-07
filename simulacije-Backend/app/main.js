require('./style.css');
var React =require('react') ;
var ReactDOM =  require('react-dom');
var Login = require('./Login.js');
var Registracija = require('./Registracija.js');
var DataShow = require('./DataShow.js');
var DataGrid = require('react-datagrid');
var Sorty = require('sorty');
var fs = require('./FileSaver.js');

var data = [];
var columns = [
	{ name: 'email' },
	{ name: 'name' },
	{ name: 'registrationDate' },
	{ name: 'role' },
	{ name: 'score' }
];
const SORT_INFO = [{ name: 'score', dir: 'asc'}];

function sort(arr){
	return Sorty(SORT_INFO, arr)
}
//sort data array with the initial sort order
data = sort(data);

var App = React.createClass({
getInitialState: function () {
	return ({role: -1, data: []});
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
				var date = u.registrationDate.toString().split("T");
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
		console.log();
			return (
				<div className="login" >
				<Login />
				<Registracija />
				<br/>
				<DataGrid 
				idProperty = "id"
				dataSource={ data } 
				columns={ columns }  />
				<br/>
				<button onClick = {this.getUsers} >Get scores </button>
				<button onClick = {this.getReport} >Get report </button>
				</div>
				);
			 
		}
	});
	


ReactDOM.render(<App />, document.getElementById('root'));
