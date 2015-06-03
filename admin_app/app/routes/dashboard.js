import Ember from 'ember';
import AuthenticatedRoute from '../lib/routes/authenticated';

export default AuthenticatedRoute.extend({
	modelRefreshTimer: null,
	model: function() {
		return this.ajax.getJSON('printer/status');
	},
	setupController: function(controller, model) {
		controller.set('model',model);
		var me = this;
		this.modelRefreshTimer = Ember.run.later(function() {
			me.refreshModel(controller);
		}, 5000);
	},
	refreshModel: function(controller) {
		this.ajax.getJSON('printer/status').then(function(response) {
			controller.set('model',response);
		});
	},
	actions: {
		updateStatus: function() {
			this.refreshModel();
		},
		willTransition: function() {
			Ember.run.cancel(this.modelRefreshTimer);
		}
	}
});
