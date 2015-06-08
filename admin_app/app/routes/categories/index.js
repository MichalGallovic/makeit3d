import CrudIndexRoute from '../../lib/routes/crudindex';

export default CrudIndexRoute.extend({
	model: function() {
		return this.store.find('category');
	},
	actions: {
		edit: function(item) {
			this.transitionTo('categories.edit',item);
		}
	}
});
