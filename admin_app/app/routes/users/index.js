import Ember from 'ember';
import AuthenticatedRoute from '../../lib/routes/authenticated';

export default AuthenticatedRoute.extend({
	model: function() {
		return this.store.find('user');
	},
	actions: {
		delete: function(item) {
			var me = this;
			item.destroyRecord().then(function() {
				me.refresh();
			});
		},
		edit: function(item) {
			this.transitionTo('users.edit',item);
		}
	}
});