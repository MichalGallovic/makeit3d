import Ember from 'ember';
import AuthenticatedRoute from '../lib/routes/authenticated';

export default AuthenticatedRoute.extend({
	modelRefreshTimer: null,
	afterModel: function() {
		var me = this;
		this.ajax.getJSON('printer/status').then(function(response) {
				me.controller.set('model',response);
		});
		this.refreshModel();
	},
	refreshModel: function() {
		var me = this;
		this.modelRefreshTimer = Ember.run.later(function() {
			me.ajax.getJSON('printer/status').then(function(response) {
				me.controller.set('model',response);
			});
			me.refreshModel();
		}, 5000);
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
