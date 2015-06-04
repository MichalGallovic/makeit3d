import Ember from 'ember';
import CrudEditRoute from '../../lib/routes/crudedit';

export default CrudEditRoute.extend({
	model: function(params) {
		return this.store.find('model',params.id);
	},
	setupController:function(controller, model) {
		controller.set('model', model);

		this.store.find('user').then(function(users) {
			controller.set('users', users);
		});

	}
});
