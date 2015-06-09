define([
  'jquery',
  'underscore',
  'backbone',
  'Basket'
], function($, _, Backbone,Basket){

	var Print = Backbone.Model.extend({
		initialize:function(){
			// console.log(Basket);
		},
		uploadModel: function(model) {
			var token = localStorage.getItem('token') || "neni";
			//X-Auth-Token
			//get na users/current
			//dostanem userat tak si ho setnem

			var that = this
			return $.ajax({
			         url: "/api/models/create",
			         type: "POST",
			         data:model,
			         processData: false,
			         contentType: false,
			         beforeSend: function(xhr){xhr.setRequestHeader('X-Auth-Token', token);},
			         success: function(resp) {
			         	var in_basket = _.clone(Basket.get('obj'));
			         	var id = resp.data.id
			         	if(!in_basket[id]){
			         		in_basket[id]={"model":{},"pocet":0};
			         		in_basket[id]['model'] = resp.data;
			         		in_basket[id]['pocet'] = 1;
			         	}else{
			         		in_basket[this.model.get('id')].pocet+=1;
			         	}
			         	Basket.set('obj',in_basket);
			         	Basket.count_total();
			         	return resp;
			         },
			         error:function(resp){
			         	return resp;
			         }
			      });
		  
		  
		},
		
	});

	var print = new Print();

  return print;
});
