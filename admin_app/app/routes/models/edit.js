import Ember from 'ember';
import AuthenticatedRoute from '../../lib/routes/authenticated';

export default AuthenticatedRoute.extend({
	model: function(params) {
		return this.store.find('model',params.id);
	},
	setupController:function(controller, model) {
		controller.set('model', model);

		this.store.find('user').then(function(users) {
			controller.set('users', users);
		});

	},
	actions: {
		willTransition: function() {
			if(this.currentModel.get('isDirty')) {
				this.currentModel.rollback();
			}
		}
	}
});
