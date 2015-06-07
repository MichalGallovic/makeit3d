define([
  'jquery',
  'underscore',
  'backbone'
], function($, _, Backbone){

	var HowView = Backbone.View.extend({
		initialize:function(){
			this.render();
		},
		render:function(){
			var template = _.template($('#how-template').html());
			this.$el.html(template());
		},
	});

	var howView = new HowView({el:"#how_it_works"})

return howView;
});