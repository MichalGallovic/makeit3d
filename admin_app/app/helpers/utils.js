import Ember from 'ember';

export function objectKeys(object) {
	if(Ember.isArray(object)) {
		return Ember.keys(object.get('firstObject').toJSON());
	}
	return Ember.keys(object.toJSON());
}