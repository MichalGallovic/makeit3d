import CrudEditRoute from '../../lib/routes/crudedit';

export default CrudEditRoute.extend({
	model: function(params) {
		return this.store.find('model',params.id);
	},
	setupController:function(controller, model) {
    var me = this;
		this.store.find('user').then(function(users) {
			controller.set('users', users);
      me.store.find('category').then(function(categories) {
        controller.set('categories', categories);
        if(Ember.isEmpty(model.get('category').get('name'))) {
          model.set('category', categories.get('firstObject'));
        }
        controller.set('model', model);
      });
		});
	}
});
