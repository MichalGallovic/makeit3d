import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
	email : DS.attr('string'),
	username : function() {
		return this.get('email');
	}.property('email'),
	password : DS.attr('string'),
	first_name : DS.attr('string'),
	last_name : DS.attr('string'),
	confirmed : DS.attr('number'),
	street : DS.attr('string'),
	town : DS.attr('string'),
	country : DS.attr('string'),
	zip_code : DS.attr('string'),
	token : DS.attr('string')

});
