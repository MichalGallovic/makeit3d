define([
  'jquery',
  'underscore',
  'backbone',
  'CategoriesModel',
  'when',
  'ModelView'
], function($, _, Backbone,CategoriesModel,when,ModelView){

	var CategoriesView = Backbone.View.extend({
		model:CategoriesModel,
		events:{
			// "click .category":"select_category",
			"click .model_detail":"show_detail"

		},
		initialize:function(){
			this.$el.html('<h1> Loading ... </h1>')
			this.getCategories();
			this.already_selected = []
			this.model_views = {}
		},
		getCategories:function(){
			var that = this;
			this.model.getCategories().then(function(){
				that.render();
			})
		},
		render:function(){
			var template = _.template($('#categories-template').html());
			this.$el.html(template({categories:this.model.get('categories')}));
		},
		select_category: function(id) {
			$('#categories-container').hide()
			var category_id = id;
			this.model.setSelectedCategory(category_id);
			$('.cats-conts').hide();
			$('#'+category_id+'-cat-cont').show();


			for (var i = 0; i < this.already_selected.length; i++) {
				if(this.already_selected[i]==category_id){
					// console.log('returnenm');
					return;}
			};
			// console.log(this.already_selected);
			this.already_selected.push(category_id)

			this.getSelectedModels();
		},
		getSelectedModels: function() {
			// console.log('viel');
			var that = this
			//setnut tu na ktorej som
			// console.log(this.model.get('categories'));

			if(this.model.get('categories').length == 0)return


			this.model.getSelectedModels().then(function(){
				// console.log('renderni ich');
				// console.log(that.model.get('selected_models'));
				var selected_cat = that.model.get('selected');
				that.model_views[selected_cat.id] = {}
				// console.log(that.model_views);
				// console.log(that.model.get('selected'));
				var template = _.template($('#category-cont-template').html());
				$('#'+selected_cat.id+'-cat-cont').html(template({category:that.model.get('selected'),models:that.model.get('selected_models')}));
				_.each(that.model.get('selected_models'),function(model){
					that.model_views[selected_cat.id][model.id]= new ModelView({model:model})
				})
			})
		  
		},
		show_detail:function(e){
			var model_id = e.currentTarget.dataset.id;
			var cat_id = this.model.get('selected').id;
			this.model_views[cat_id][model_id].show();
			this.model_views[cat_id][model_id].model.set('shown',true);
		}
	});

	var categoriesView = new CategoriesView({el:"#categories"})

return categoriesView;
});
