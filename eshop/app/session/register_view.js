define([
  'jquery',
  'underscore',
  'backbone',
  'Session',
  'when'
], function($, _, Backbone,Session,when){

  var RegisterView = Backbone.View.extend({
    model:Session,
    events:{
      "submit #register-form":"register",
    },
  	initialize: function() {
      this.render();
  	},
    render: function() {
        var template = _.template($('#register-template').html());
        this.$el.html(template());
    },
    register: function(e) {
      e.preventDefault();
      var form = e.currentTarget;
      var username = form.elements['email'].value;
      var password = form.elements['password'].value;
      var reg_data = {};
      reg_data.username = username;
      reg_data.password = password;
      
      this.model.register(reg_data).then(function(resp){
        //TODO success mesaage
        // console.log(resp)
        $('#reg_message').html('Activation email has been sent.');
      },function(resp){
        // console.log(resp.responseJSON.error);
        $('#reg_message').html(resp.responseJSON.error.message);
      })

    },
    
  	
  });

  var registerView = new RegisterView({el:'#register'});
  return registerView;
});
