import Ember from 'ember';

export default Ember.Route.extend({
	beforeModel: function(transition){
		if(Ember.isEmpty(this.controllerFor('sessions').get('currentUser'))) {
			return this.redirectToLogin(transition);
		}
	},
	redirectToLogin: function(transition) {
		this.controllerFor('sessions').set('attemptedTransition', transition);
		return this.transitionTo('sessions.login');
	}
});
