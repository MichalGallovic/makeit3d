import DS from 'ember-data';

export default DS.Model.extend({
	name : DS.attr('string'),
	visible : DS.attr('number'),
	price : DS.attr('number'),
	image_url : DS.attr('string'),
	printing_time : DS.attr('number'),
	filament_length : DS.attr('number'),
	filament_volume : DS.attr('number'),
	download_link_gcode : DS.attr('string'),
	download_link_stl : DS.attr('string'),
	deleted: DS.attr('boolean'),
	created_by : DS.belongsTo('user', {async: true}),
  category: DS.belongsTo('category',{async: true}),
	print: function() {
		return this.ajax.getJSON('models/'+this.id+"/print");
	},
	removeFromOrder: function(orderId) {
		return this.ajax.delete('orders/'+orderId+'/models/'+this.id);
	}
});
