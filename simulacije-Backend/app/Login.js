import React from 'react';
import styles from './App.css';

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {test: 'foo'};
  }
 
register(e) {
	e.preventDefault();

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
            if (response.status >= 200 && response.status < 300) {
                return response;
            } else {
                var error = new Error("Niste uspesno logovani, registrujte se !!!");
                error.response = response;
                throw error;
            }
        })
  	.then((response) => {
  		alert("Uspesno ste ulogovani, mozete da igrate igru!");
      window.location.href="../mario/index.html";
  	})
  	.catch((err)=>{
  		 alert(err);
       window.location.href="./registracija.js";
  	});
  }

  render() {
    return (
      <div className={styles.app}>
        <form >
        	<input type = "text" ref = "username" placeholder = "Username" />       	
        	<input type = "password" ref = "password" placeholder = "Password" />
        </form>
        <button type = "button" onClick = {this.save.bind(this)} >Login </button>
        //<button type = "button" onClick = {this.register.bind(this)} >Register </button>
      </div>
    );
  }
}
