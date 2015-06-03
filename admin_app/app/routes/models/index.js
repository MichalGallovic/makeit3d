import Ember from 'ember';
import AuthenticatedRoute from '../../lib/routes/authenticated';

export default Ember.Route.extend({
	model: function() {
		return this.store.find('model');
	},
	actions: {
		delete: function(item) {
			var me = this;
			item.destroyRecord().then(function() {
				me.refresh();
			});
		},
		edit: function(item) {
			this.transitionTo('models.edit',item);
		},
		restore: function(item) {

		}
	}
});
