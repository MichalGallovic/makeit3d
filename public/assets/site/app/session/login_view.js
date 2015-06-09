define([
  'jquery',
  'underscore',
  'backbone',
  'Session'
], function($, _, Backbone,Session){

	var LoginView = Backbone.View.extend({
		model:Session,
		events:{
		  "submit #login-form":"login",
		},

		initialize: function() {
			this.render();
		},

	    render: function() {
	        var template = _.template($('#login-template').html());
	        this.$el.html(template());
	    },
	    login: function(e) {
	      e.preventDefault();
	      var form = e.currentTarget;
	      var username = form.elements['email'].value;
	      var password = form.elements['password'].value;
	      var reg_data = {};
	      reg_data.username = username;
	      reg_data.password = password;
	      var that = this
	      
	      this.model.login(reg_data).then(function(resp){
	        //TODO success mesaage
	        // console.log(resp)
	        // that.model.set('user',resp.data);
	        $('#log_message').html('');
	        localStorage.setItem('token',resp.data.token);
	        that.model.setLoggedIn(resp.data);

	      },function(resp){
	        // console.log(resp.responseJSON.error);
	        // console.log(resp);
	        $('#log_message').html(resp.responseJSON.error);
	      })

	    },
		
		
	});

	var loginView = new LoginView({el:'#login'});
	return loginView;
});
