import Ember from 'ember';
import AuthenticatedRoute from '../../lib/routes/authenticated';

export default Ember.Route.extend({
	model: function() {
		// this.store.find('model').then(function(response) {
		// 	response.forEach(function(elm) {
		// 		console.log(elm);
		// 	});
		// });

		return this.store.find('model');
	},
	update: function() {
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
		}
	}
});
