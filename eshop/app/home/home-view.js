define([
  'jquery',
  'underscore',
  'backbone',
  'app/home/home-model',
  'Model',
  'when',
  'ModelView',
  'Session'
], function($, _, Backbone,homeModel,Model,when,ModelView,Session){

	var HomeView = Backbone.View.extend({
		model:homeModel,
		events: {
		    "input .search_input":"input",
		    "click .model_detail":"show_detail",
		    "submit #search_form":"search_form",
		    "click .model_detail_resp":"show_detail_resp",
		},
		initialize:function(){
			this.$el.html('<h1> Loading ... </h1>')
			//views pre recently_printed
			this.model_views = {}
			this.getRecentlyPrinted()
			this.fh = _.debounce(this.fetchHints, 500);

		},
		getRecentlyPrinted:function(){
			var that = this
			this.model.getRecentlyPrinted().then(function(){
				that.render();
			})
		},
		render:function(){
			var template = _.template($('#search-template').html())
			this.$el.html(template({models:this.model.get('recently_printed')}))
			var that = this
			_.each(this.model.get('recently_printed'),function(model){
				that.model_views[model.id] = new ModelView({model:model})
			})
		},
		input:function(){
			this.fh()
		},
		fetchHints: function() {
			var val = $(this.$el).find( "input" ).val()
			if(val==''){
				var template = _.template($('#search_results-template').html());
				$('#search_results').html(template({models:{}}));
				return;
			}
			var that = this

			this.model.getHint(val).then(function(resp){
				that.renderResults(resp.data);
			},function(resp){
				alert('Error')
			})
		},

		renderResults: function(data) {
			// console.log(data);
			var template = _.template($('#search_results-template').html());
			$('#search_results').html(template({models:data}));
		},
						
		show_detail:function(e){
			// console.log(Session.get('is_logged'));
			var id = e.currentTarget.dataset.id;
			this.model_views[id].show();	
			//najdem si model podla id, nastavim mu shown na 1 aby potom view neboli vsetky aktivne
			var shown = _.find(this.model.get('recently_printed'),function(model) { return model.get('id') == id; })
			shown.set({'shown':true})
		},
		search_form: function(e) {
		  e.preventDefault()
		},
		show_detail_resp: function(e) {
			var id = e.currentTarget.dataset.id;
			var selected = _.find(this.model.get('searched'),function(model) { return model.id == id; })
			// console.log(selected);
			// console.log(id);
			var m = new Model(selected);
			var v = new ModelView({model:m})
			m.set('shown',true)
			v.show();
		},
		
		
	});

	var homeView = new HomeView({el:"#home"})

return homeView;
});