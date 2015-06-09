define([
  'jquery',
  'underscore',
  'backbone',
  'Session'
], function($, _, Backbone,Session){

var Basket = Backbone.Model.extend({
	defaults:{
		//pole objektov, nie modelov pre lahsie spracovanie
		// "in_basket":[],
		"total":0,
		"obj":{},
		"user":{}
	},
	//localstorage 'basket'
	initialize:function(){
		var obj = localStorage.getItem('basket') || '{}';
		this.set('obj',JSON.parse(obj));
		this.count_total();

	},
	count_total:function(){
		var kosik = this.get('obj');
		var total = 0;
		_.each(kosik, function(item){
			delete item.model['basket'];
			total += (item.pocet * item.model.price);
		});
		this.set('total',total);

		localStorage.setItem('basket',JSON.stringify(kosik));


	},
	plus: function(id) {
	  var obj = this.get('obj');
	  obj[id].pocet+=1;
	  this.count_total();
	  // console.log(Session);
	},
	minus: function(id) {
	  var obj = this.get('obj');
	  if(obj[id].pocet > 0)
	  	obj[id].pocet-=1;
	  this.count_total();
	},
	User: function() {
		this.set('user',Session.get('user'));
	},
	order: function(data) {
		var token = localStorage.getItem('token') || "neni";
		//X-Auth-Token
		//get na users/current
		//dostanem userat tak si ho setnem
		var that = this
		return $.ajax({
		         url: "/api/orders/create",
		         type: "POST",
		         data:data,
		         beforeSend: function(xhr){xhr.setRequestHeader('X-Auth-Token', token);},
		         success: function(resp) {
		         	// console.log(resp);
		         	that.set('total',0);
		         	that.set('obj',{});
		         	that.count_total();
		         	return resp;
		         },
		         error:function(resp){
		         	console.log(resp);
		         	return resp;
		         }
		      });
	  
	},
	
	
	

	});

  var basket = new Basket();
  window['basket']=basket;
  return basket;
});
