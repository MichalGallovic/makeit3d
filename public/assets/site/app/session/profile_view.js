define([
  'jquery',
  'underscore',
  'backbone',
  'Session'
], function($, _, Backbone,Session){

	var ProfileView = Backbone.View.extend({
		model:Session,
		events:{
			// "click #hide_profile":"hide",
			"submit #profile-form":"save"
		},
		initialize:function(){
		},
		show:function(){
			// $('.modal_beckdrop').show();
			this.render();
		},
		render:function(){
			var template = _.template($('#modal-profile-template').html())
			this.$el.removeClass('hidden').html(template({user:Session.get('user')}));
		},
		// hide:function(){
		// 	// $('.modal_beckdrop').hide();
		// 	this.$el.addClass('hidden').html('');
		// },
		save: function(e) {
		  e.preventDefault();
		  var form = e.currentTarget;
		  var edit_data = {};
		  edit_data.username = form.elements['email'].value;
		  edit_data.first_name = form.elements['first_name'].value;
		  edit_data.last_name = form.elements['last_name'].value;
		  edit_data.street = form.elements['street'].value;
		  edit_data.town = form.elements['town'].value;
		  edit_data.country = form.elements['country'].value;
		  edit_data.zip_code = form.elements['zip_code'].value;
		  // console.log(edit_data);
		  var that = this
		  this.model.editUser(edit_data).then(function(resp){
		  	that.$el.modal('hide')
		  },function(resp){
		  	alert('error');
		  })

		},
		
	});

	var profileView = new ProfileView({el:'#profileView'})
  return profileView;
});
