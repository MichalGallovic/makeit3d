define([
  'jquery',
  'underscore',
  'backbone',
  'Basket',
  'Session'
], function($, _, Backbone,Basket,Session){

	var ModelView = Backbone.View.extend({
		el:$('#model_detail2'),
		events:{
			"click #add_to_cart":"add_to_cart",
			"click a":"link"
		},
		initialize:function(){
			var that = this
			this.$el.on('hidden.bs.modal', function () {
					that.hide()
				})
		},
		show:function(){
			var logged = Session.get('is_logged')
			// $('.modal_beckdrop').show();
			var template = _.template($('#modal-model-detail-template').html());
			this.$el.html(template({model:this.model,logged:logged}));
		},
		hide:function(){
			this.model.set({'shown':false});
		},
		add_to_cart:function(){
			if(this.model.get('shown')){
				var in_basket = _.clone(Basket.get('obj'));
				// ak neni vytvor ak je zvys

				if(!in_basket[this.model.get('id')]){
					var id = this.model.get('id');
					in_basket[id]={"model":{},"pocet":0};
					in_basket[id]['model'] = this.model.attributes;
					in_basket[id]['pocet'] = 1;
				}else{
					in_basket[this.model.get('id')].pocet+=1;
				}
				Basket.set('obj',in_basket);
				Basket.count_total();
			}
		},
		link: function() {
			this.$el.modal('hide');
		  
		},
		
	});

  return ModelView;
});
