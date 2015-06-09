define([
  'jquery',
  'underscore',
  'backbone',
  'PrintModel'
], function($, _, Backbone,PrintModel){

	var PrintView = Backbone.View.extend({
		model:PrintModel,
		events:{
			"change #upload_input":"upload"
		},
		initialize:function(){
			this.render();
		},
		render:function(){
			var template = _.template($('#print-template').html());
			this.$el.html(template());
		},
		upload: function(e) {
			// e.preventDefault();
			var formData = new FormData();
			var file = e.currentTarget.files[0];
			formData.append('model',file,file.name);


			// var request = new XMLHttpRequest();
			// request.open("POST", "/api/models/create");
			// request.send(formData);
			this.model.uploadModel(formData).then(function(resp){
				alert('uploaded');
				console.log(resp);
			},function(resp){
				alert('error upload');
			})
		},
		
	});

	var printView = new PrintView({el:'#print'});

  return printView;
});
