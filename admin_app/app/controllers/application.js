import Ember from 'ember';

export default Ember.Controller.extend({
	needs: ['sessions'],
	isAuthenticated : function() {
		return !Ember.isEmpty(this.get('controllers.sessions.currentUser'));
	}.property('controllers.sessions.currentUser')
});
