define([
  'jquery',
  'underscore',
  'backbone',
  'Basket'
], function($, _, Backbone,Basket){

	var Model = Backbone.Model.extend({
		defaults: {
			"name":"",
			"visible": 0,
			"price":0,
			"image_url":"",
			"printing_time":0,
			"filament_length":0,
			"filament_volume":0,
			"download_link_gcode":"",
			"download_link_stl":"",
			"created_by":"",
		    "category":{},
		    "id":0,
		    "basket":Basket,
		    "shown":false


		},
		initialize:function(){
			// console.log(this.defaults);
		}

	});

  return Model;
});
