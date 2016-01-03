import React from 'react';
import styles from './App.css';

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.props = super(props);  
  }

  save(e){
  	e.preventDefault();
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
            	console.log('status is '+ response.status);
                return response;
            } else {
                var error = new Error("Niste uspesno logovani, registrujte se !!!");
                error.response = response;
                throw error;
            }
        })
  	.then((response) => {
  		alert("Uspesno ste ulogovani, mozete da igrate igru!");
    //window.location.href ="/game/mario/index.html";
    fetch('http://localhost:3000/mario', {
    	method: 'get'
    });
  	})
  	.catch((err)=>{
  		 alert('Korisnik ne postoji u bazi!');
       
  	});
  }

  render() {
    return (
      <div >
        <form >
        	<input type = "text" ref = "username" placeholder = "Username" />
        	<br/>    	
        	<input type = "password" ref = "password" placeholder = "Password" />
        </form>
        <button type = "button" onClick = {this.save.bind(this)} >Login </button>
        	<h1>Tekst</h1>
      </div>
    );
  }
}
