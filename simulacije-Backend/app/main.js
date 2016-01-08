var style = require('./style.css');
var React =require('react') ;
var ReactDOM =  require('react-dom');
var Registracija = require('./Registracija.js');
var DataGrid = require('react-datagrid');
var Sorty = require('sorty');
var fs = require('./FileSaver.js');
import styles from './styleee.css';

var data = [];
var columns = [
	{ name: 'email' },
	{ name: 'name' },
	{ name: 'registrationDate' },
	{ name: 'role' },
	{ name: 'score' }
];
var name;
var role;
const SORT_INFO = [{ name: 'score', dir: 'asc'}];

function sort(arr){
	return Sorty(SORT_INFO, arr)
}
//sort data array with the initial sort order
data = sort(data);

var App = React.createClass({
getInitialState: function () {
	return ({role: -1, name: "", data: []});
},
getReport:function(e) {
			e.preventDefault();
	console.log('uzimam izvestaj');
	// if (role !== 1) {
	// 	alert('samo admin moze dobiti izvestaj');
	// 	window.location.href = "http://localhost:3000/";
	// } 

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
	getUsers: function(e) {
		// e.preventDefault();
		console.log('uzimam korisnike');
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
	save: function(e){
  	e.preventDefault();
  	// if(name !== ""){
  	// 	alert('vec ste logovani');
  	// 	return;
  	// }
  	var username = this.refs.username.value;
  	var password = this.refs.password.value;
  	var dataSend ={
  		"name": username,
  		"password": password
  	};
  	var data = '' + JSON.stringify(dataSend);
  	console.log(data);
  	fetch('http://localhost:3000/login', {
		method:'post',
		headers: {
                'Content-Type': 'application/json'
            },
            body: data
  	}).then((response) => {
            if (response.status == 0 || response.status == 1) {
            	
            	console.log(this.state.role + ' is role, name is ' + this.state.name);
                return response.text();
            } else {
                var error = new Error("Niste uspesno logovani, registrujte se !!!");
                error.response = response;
                throw error;
            }
        })
  	.then((response) => {
  		name = response;
  		this.setState({name: response, role: response.status});
  		alert("Uspesno ste ulogovani, mozete da igrate igru!" + name);
   window.location.href ="http://localhost/mario";
    
  	})
  	.catch((err)=>{
  		 alert('Korisnik ne postoji u bazi!');
       
  	});
  },
  logout: function(e) {
  	//e.preventDefault();
             console.log(name + ' this is username');
             // if (this.state.name === '') {
             // 	alert('niko nije loginovan!');
             // 	window.location.href = "http://localhost:3000/";
             // }

        var json = {
            'name': name
        };
        var data = '' + JSON.stringify(json);
        console.log(data);
        fetch('http://localhost:3000/logout', {
        	method: 'post',
        	headers: {
                'Content-Type': 'application/json'
            },
            body: data
        }).then((response) => {
        	if (response.status === 200) {
        		return response;
        	} else {
        		var error = new Error('neuspesan logout pokusajte ponovo')
        		error.response = error;
        		throw error;
        	}
        }).then((response) => {
        	name = '';
        this.setState({role: -1});
                       alert("Uspesno ste se odjavili! Vidimo se opet!");
                        	console.log('uspesno odjavljen');
                        window.location.href = "http://localhost:3000/";
        }).catch((err) => {
        	alert(err);
        });
       
        },
	render: function() {
			return (
				<div class="login" >
				<form >
        			<input type = "text" ref = "username" placeholder = "Username" />
        			<br/>    	
        			<input type = "password" ref = "password" placeholder = "Password" />
        		</form>
        		<button type = "button" onClick = {this.save.bind(this)} >Login </button>
        		<br/>
				<Registracija />
				<br/>

				<br/>
				<button type = "button" onClick = {this.getReport.bind(this)} >Get report </button>
				</div>
				);
			 
		}
	});
	


ReactDOM.render(<App />, document.getElementById('root'));