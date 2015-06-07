import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  	first_name: DS.attr('string'),
  	last_name: DS.attr('string'),
  	street: DS.attr('string'),
  	town: DS.attr('string'),
  	country: DS.attr('string'),
  	zip_code: DS.attr('string'),
  	price: DS.attr('number'),
  	created_at: DS.attr(),
  	was_opened: DS.attr('boolean'),
    was_printed: DS.attr('boolean'),
    was_shipped: DS.attr('boolean'),
    models: DS.hasMany('model',{async:true}),
  	full_name: function(){
  		return this.get('first_name') + " " + this.get('last_name');
  	}.property('first_name','last_name'),
  	address: function() {
  		return this.get('street') + ", " + this.get('town') + " " + this.get('zip_code') + ", " + this.get('country');
  	}.property('street','town','country'),
    reloadAssociated: function () {
    var modelPromises = this.get('models').invoke('reload');

    return Ember.RSVP.hash({
      models: modelPromises
    });
  }
});
