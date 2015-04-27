import Ember from 'ember';

export default Ember.Route.extend({
	beforeModel: function() {
		if(!Ember.isEmpty(this.controllerFor('sessions').get('currentUser'))) {
			return this.redirectToDashboard();
		}
	},
	redirectToDashboard: function() {
		return this.transitionTo('dashboard');
	}
});