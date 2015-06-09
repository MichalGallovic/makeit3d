import CrudCreateRoute from '../../lib/routes/crudcreate';

export default CrudCreateRoute.extend({
	model: function() {
		return null;
	},
	actions: {
		modelUploaded: function(response) {
			var me = this;
			this.store.find('model',response.model[0].id).then(function(newModel){
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
