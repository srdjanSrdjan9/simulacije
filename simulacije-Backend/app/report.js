var React    = require('react')
var DataGrid = require('react-datagrid')
/**
 * data is an array with 1000 items, like:
 * [
 * 		{ id: 0, index: 1, firstName: 'John', city: 'London', 'email: jon@gmail.com'},
 * 		{ id: 1, .... }
 * ]
 */
var columns = [
	{ name: 'index', title: '#', width: 50 },
	{ name: 'Name' },
	{ name: 'email'  },
	{ name: 'age' },
	{ name:  'role'}
]
var data;
  $.ajax({
            url: "http://localhost:3000/getReport",
            type: 'GET',
            success: function(result,status,xhr){
                if (xhr.status == 200) {
                    data = result;
        			 console.log('podaci ' + data );
                }
                if (xhr.status == 404) {
                    alert('Nema podaataka o korisnicima');
                 // TODO redirect to login page
                  
                }
            },
            error: function(xhr,status,error) {
               
                alert('Nema podaataka o korisnicima');
                    
            }
            
        });

var App = React.createClass({
	render: function(){
		return <DataGrid
			idProperty='id'
			dataSource={data}
			columns={columns}
			style={{height: 500}}
			//if you don't want to show a column menu to show/hide columns, use
			//withColumnMenu={false}
		></DataGrid>
	}
});

module.exports = App