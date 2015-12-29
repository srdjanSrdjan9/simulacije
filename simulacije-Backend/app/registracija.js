import React from 'react';
import styles from './App.css';
var promise = require('promise');
//var fetch = require('fetch');

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {test: 'foo'};
  }
 


  register(e){
  	e.preventDefault();
  	var name = this.refs.name.value;
  	var password = this.refs.password.value;
    var age = this.refs.age.value;
    var email = this.refs.email.value;
  	var dataSend ={
  		"name": username,
  		"password": password,
      "age":age,
      "email":email
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
      window.location.href="./App.js";
  	})
  	.catch((err)=>{
  		 alert(err);
       location.reload();
       
  	});
  }

  render() {
    return (
      <div className={styles.app}>
        <form >
        	<input type = "text" ref = "name" placeholder = "Ime" />        	
        	<input type = "password" ref = "password" placeholder = "Password" />
          <input type = "text" ref = "age" placeholder = "Godine" />  
          <input type = "email" ref = "email" placeholder = "Email" />  
        </form>
        <button type = "button" onClick = {this.register.bind(this)} >Register </button>
      </div>
    );
  }
}
