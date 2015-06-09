define([
  'jquery',
  'underscore',
  'backbone',
  'when'
], function($, _, Backbone,when){

	var Session = Backbone.Model.extend({
		defaults:{
			"is_logged":false,
			// "token":"",
			"user":{}
		},
		initialize:function(){

			this.on('change',function(){
				$('#logged-name').html(this.get('user').email)
			})
			var token = localStorage.getItem('token') || "neni";
			//X-Auth-Token
			//get na users/current
			//dostanem userat tak si ho setnem
			var that = this
			$.ajax({
			         url: "/api/users/current",
			         type: "GET",
			         beforeSend: function(xhr){xhr.setRequestHeader('X-Auth-Token', token);},
			         success: function(resp) { 
			         		that.setLoggedIn(resp.data);
			         },
			         error:function(resp){
			         	that.nelognuty();
			         }
			      });

		},
		register: function(data) {
		  return $.post("/api/users/register",data, function(resp){
			return resp;
		  })
		},
		login: function(data) {
		  return $.post("/api/users/login",data, function(resp){
			return resp;
		  })
		},
		setLoggedIn: function(user) {
			this.set('user',user);
		  	this.set('is_logged',true);
		  	this.trigger('logged_in');

		},
		nelognuty:function(){
			this.trigger('not_logged_in');
		},
		editUser: function(edit_data) {
			var token = localStorage.getItem('token') || "neni";
			//X-Auth-Token
			//get na users/current
			//dostanem userat tak si ho setnem
			var that = this
			return $.ajax({
			         url: "/api/users/current/edit",
			         type: "PUT",
			         data:edit_data,
			         beforeSend: function(xhr){xhr.setRequestHeader('X-Auth-Token', token);},
			         success: function(resp) {
			         	//toto extende ten objekt
			         	var nu = $.extend(that.get('user'), edit_data);
			         	nu.email=nu.username
			         	that.set('user',nu);
			         	$('#logged-name').html(that.get('user').email)

			         	return resp;
			         },
			         error:function(resp){
			         	console.log(resp);
			         	return resp;
			         }
			      });
		},
		
		
		
	});

	var session = new Session();


  return session;
});
