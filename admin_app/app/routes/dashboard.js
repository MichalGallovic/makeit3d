import Ember from 'ember';
import AuthenticatedRoute from '../lib/routes/authenticated';

export default AuthenticatedRoute.extend({
	model: function() {
		return 
	},
	setupController: function(controller, model) {
		var me = this;
		setInterval(function() {
			me.refreshModel();
		}, 5000);
	},
	refreshModel: function() {
		var me = this;
		this.ajax.getJSON('printer/status').then(function(response) {
			me.set('model',response);
		});
	},
	actions: {
		updateStatus: function() {
			this.refreshModel();
		}
	}
});
