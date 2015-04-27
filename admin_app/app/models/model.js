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
	download_stl_gcode : DS.attr('string'),
	created_by : DS.attr('string')
});
