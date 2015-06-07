define([
  'jquery',
  'underscore',
  'backbone',
  'Model'
], function($, _, Backbone,Model){
	var CategoriesModel = Backbone.Model.extend({
		defaults:{
			"categories":[],
			"selected":{},
			"selected_models":[]
		},
		initialize:function(){
		},
		getCategories:function(){
			var that = this
			return $.get('/api/categories').then(function(resp){
						var temp = []
						if(!resp.data){
							alert('Error')
						}else{
							// console.log(resp);
							that.set('categories',resp.data);
							// _.each(resp.data,function(model){
							// 	temp.push(new Model(model))
							// })
							// that.set('recently_printed',temp)
						}
					})
		},
		setSelectedCategory: function(category_id) {
			if(this.get('categories').length != 0){
				var selected = _.find(this.get('categories'),function(cat) { return cat.id == category_id; });
				this.set('selected',selected);
			}
		},
		getSelectedModels:function(){
			// console.log('getmodels');
			var that = this
			return $.get('/api/categories/'+this.get('selected').id+'?include=models').then(function(resp){
					var models = resp.data.models.data;
						// _.each(that.get('recently_printed'),function(model){
						// 	model.remove()
						// })
						// that.set('recently_printed',[])
						var temp = []
						// if(!resp.data){
						// 	alert('Error')
						// }else{
							_.each(models,function(model){
								model.category = {"data":{}}
								model.category.data=that.get('selected')
								// console.log(model);
								temp.push(new Model(model))
							})
							that.set('selected_models',temp)
							// console.log(that.get('selected_models'));
						// }
					})
		}
		
	});

	var categoriesModel = new CategoriesModel();
	return categoriesModel;
});
