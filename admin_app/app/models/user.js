import DS from 'ember-data';

export default DS.Model.extend({
	email : DS.attr('string'),
	username : function() {
		return this.get('email');
	}.property('email'),
	first_name : DS.attr('string', { defaultValue: ""}),
	last_name : DS.attr('string', { defaultValue: ""}),
	confirmed : DS.attr('number'),
	street : DS.attr('string'),
	town : DS.attr('string'),
	country : DS.attr('string'),
	zip_code : DS.attr('string'),
	token : DS.attr('string'),
	full_name: function() {
    var first_name = this.get('first_name') ? this.get('first_name') : "";
    var last_name = this.get('last_name') ? this.get('last_name') : "";
		return first_name + " " + last_name;
  }.property('first_name','last_name')
});
