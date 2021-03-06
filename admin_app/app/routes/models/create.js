import CrudCreateRoute from '../../lib/routes/crudcreate';

export default CrudCreateRoute.extend({
	model: function() {
    var me = this;
		var newModel = this.store.createRecord('model');
    this.store.find('category').then(function(categories) {
      me.controller.set('categories', categories);
      newModel.set('category',categories.get('firstObject'));
    });
    this.store.find('user').then(function(users) {
        me.controller.set('users', users);
        var adminUser = users.findBy('first_name', "Makeit3D");
        newModel.set('created_by', adminUser);
    });
    return newModel;
  },
	actions: {
		modelUploaded: function(response) {
			var me = this;
			this.store.find('model',response.model[0].id).then(function(newModel){
        var oldModel = me.controller.get('model');
        newModel.set('category',oldModel.get('category'));
        newModel.set('image_url', oldModel.get('image_url'));
        me.controller.set('model',newModel);
			});
		},
		create: function(item) {
			var me = this;
			item.save().then(function() {
				me.transitionTo('models.index');
			});
		}
	}
});
