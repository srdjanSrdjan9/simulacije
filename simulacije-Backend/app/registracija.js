import React from 'react';
import styles from './styleee.css';
var promise = require('promise');
//var fetch = require('fetch');

export default class Registracija extends React.Component {
  constructor(props) {
    super(props);
    this.state = {test: 'foo'};
  }

  register(e){
  	e.preventDefault();
  	var name = this.refs.ime.value;
  	var password = this.refs.password.value;
    var age = this.refs.age.value;
    var email = this.refs.email.value;
    var re_pass = this.refs.rePassword.value;

    if (password !== re_pass) {
      alert('passwordi se ne poklapaju');
      return;
    }

  	var dataSend ={
  		"name": name,
  		"password": password,
      "age":age,
      "email":email,
      "role": 0
  	};
  	var data = '' + JSON.stringify(dataSend);
  	console.log(data);
  	fetch('http://localhost:3000/register', {
		method:'post',
		headers: {
                'Content-Type': 'application/json'
            },
            body: data
  	}).then((response) => {
            if (response.status >= 200 && response.status < 300) {
                return response;
            } else {
                var error = new Error("Niste uspesno registrovali, pokusajte ponovo !!!");
                error.response = response;
                throw error;
            }
        })
  	.then((response) => {
  		alert("Uspesno ste se registrovali");
  	})
  	.catch((err)=>{
  		 alert(err);
       location.reload();
       
  	});
  }

  render() {
    return (
      <div class="login">
        <form >
        	<input type = "text" ref = "ime" placeholder = "Ime" />
          <br/>       	
        	<input type = "password" ref = "password" placeholder = "Password" />
           <br/>
           <input type = "password" ref = "rePassword" placeholder = "Re-type password" />
           <br/>
          <input type = "number" min = "10" max = "100" ref = "age" placeholder = "Godine" /> 
           <br/> 
          <input type = "email" ref = "email" placeholder = "Email" />
           <br/>
        </form>
        <br/>
        <button type = "button" onClick = {this.register.bind(this)} >Register </button>
      </div>
    );
  }
}
