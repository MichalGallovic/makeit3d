define([
  'jquery',
  'underscore',
  'backbone',
  'when',
  'Model'
], function($, _, Backbone,when,Model){
	var HomeModel = Backbone.Model.extend({
		defaults:{
			"recently_printed":[],
			"searched":[]
		},
		initialize:function(){
		},
		getHint:function(val){
			var that = this
			return $.get('/api/models/?search='+val+'&include=category').then(function(resp){
					that.set('searched',resp.data)
					return resp;
					})
		},
		getRecentlyPrinted:function(){
			var that = this
			return $.get('/api/models/recently_printed?include=category').then(function(resp){
						// _.each(that.get('recently_printed'),function(model){
						// 	model.remove()
						// })
						// that.set('recently_printed',[])
						var temp = []
						if(!resp.data){
							alert('Error')
						}else{
							_.each(resp.data,function(model){
								temp.push(new Model(model))
							})
							that.set('recently_printed',temp)
						}
					})
		}
	});

	var homeModel = new HomeModel();
	return homeModel;
});
