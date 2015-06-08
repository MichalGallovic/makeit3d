import CrudIndexRoute from '../../lib/routes/crudindex';

export default CrudIndexRoute.extend({
	model: function() {
		return this.store.find('model');
	},
	actions: {
		edit: function(item) {
			this.transitionTo('models.edit',item);
		}
	}
});
