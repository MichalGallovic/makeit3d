define([
  'jquery',
  'underscore',
  'backbone',
  'Basket'
], function($, _, Backbone,Basket){

	var BasketView = Backbone.View.extend({
		model:Basket,
		events:{
			"click #hide_basket":"hide",
			"click .plus":"plus",
			"click .minus":"minus",
			"click #next_to_address":"next_to_address",
			"submit #basket_address_checkout_form":"next_to_checkout",
			"click #back_to_address":"back_to_address",
			"click #back_to_obsah":"back_to_obsah",
			"click #order":"order"
		},
		initialize:function(){
		},
		show:function(){
			// $('.modal_beckdrop').show();
			this.render();
		},
		render:function(){
			this.model.User();
			var template = _.template($('#modal-basket-template').html())
			this.$el.html(template({total:this.model.get('total').toFixed(2),models:this.model.get('obj'),user:this.model.get('user')}));
		},
		partial_render:function(){
			var template = _.template($('#partial_basket-template').html());
			$('#basket_obsah').html(template({total:this.model.get('total').toFixed(2),models:this.model.get('obj')}))
		},
		hide:function(){
			// $('.modal_beckdrop').hide();
			// this.$el.addClass('hidden').html('');
			this.$el.modal('hide')
		},
		plus: function(e) {
		  var id = e.currentTarget.dataset.id;
		  this.model.plus(id);
		  this.partial_render();
		},
		minus: function(e) {
		  var id = e.currentTarget.dataset.id;
		  this.model.minus(id);
		  this.partial_render();
		},
		next_to_address: function() {
		  $('#basket_obsah').hide();
		  $('#basket_address').show();
		},
		next_to_checkout: function(e) {
			e.preventDefault();
		  $('#basket_address').hide();
		  $('#basket_checkout').show();
		  //vezmem hodnoty z adresy a rerendernem checkout
		  var form_obj = this.getInfomFromForm();


		  // console.log(this.model.get('obj'));
		  //rendernem checkout
		  var template = _.template($("#checkout-template").html());
		  $('#basket_checkout').html(template({user:form_obj,order:this.model.get('obj'),total:this.model.get('total').toFixed(2)}));

		},
		back_to_address: function() {
			$('#basket_address').show();
			$('#basket_checkout').hide();
		},
		back_to_obsah: function() {
		  $('#basket_obsah').show();
		  $('#basket_address').hide();
		},
		getInfomFromForm: function() {
			var form = $('#basket_address_checkout_form');
			var form_obj = {};
			form_obj.first_name = form[0].elements['first_name'].value;
			form_obj.last_name = form[0].elements['last_name'].value;
			form_obj.street = form[0].elements['street'].value;
			form_obj.town = form[0].elements['town'].value;
			form_obj.country = form[0].elements['country'].value;
			form_obj.zip_code = form[0].elements['zip_code'].value;

			return form_obj;
		  
		},
		order: function() {
		  var that = this
		  var ship_to = this.getInfomFromForm();
		  var order = this.model.get('obj');
		  var order_ids = {"models":[]};
		  _.each(order, function(item){
		  	for (var i = 0; i < item.pocet; i++) {
		  		order_ids.models.push(item.model.id);
		  	};
		  });

		  //shipto - user
		  //order_ids - idecka modelov
		  $.extend(ship_to, order_ids);
		  //shipto sa rozsiri o idcka a moze postovat
		  // console.log(ship_to);
		  ship_to.models = ship_to.models.join();
		  if(this.model.get('total')==0){
		  	alert('No Models in Cart');
		  	return;
		  }
		  
		  this.model.order(ship_to).then(function(resp){
		  	alert(resp.success.message);
		  	that.hide();
		  },function(resp){
		  	alert('Error')
		  })

		},
		
		
		
		
	});

	var basketView = new BasketView({el:'#basketView'})
  return basketView;
});
