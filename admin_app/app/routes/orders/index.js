import CrudIndexRoute from '../../lib/routes/crudindex';

export default CrudIndexRoute.extend({
	model: function() {
		return this.store.find('order');
	},
	actions: {
		edit: function(item) {
			this.transitionTo('orders.edit', item);
		}
	}
});
