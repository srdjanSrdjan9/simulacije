import React from 'react';
import styles from './styleee.css';


var Login = React.createClass ({
getInitialState: function () {
	return ({role: -1});
},
  save: function(e){
  	e.preventDefault();
  	// var username = this.refs.username.value;
  	// var password = this.refs.password.value;
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
            	this.setState({role: response.status});
            	console.log(this.state.role + ' is role');
                return response;
            } else {
                var error = new Error("Niste uspesno logovani, registrujte se !!!");
                error.response = response;
                throw error;
            }
        })
  	.then((response) => {
  		alert("Uspesno ste ulogovani, mozete da igrate igru!");
    window.location.href ="http://localhost/mario";
    
  	})
  	.catch((err)=>{
  		 alert('Korisnik ne postoji u bazi!');
       
  	});
  },

  render: function(){
    return (
      <div class="login">
        <form >
        	<input type = "text"  placeholder = "Username" />
        	<br/>    	
        	<input type = "password"  placeholder = "Password" />
          </br>
        </form>
          </br>
         
        <button type = "button" onClick = {this.save.bind(this)} >Login </button>
  
      </div>
    );
  }
})

export default Login;