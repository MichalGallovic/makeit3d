import CrudIndexRoute from '../../lib/routes/crudindex';

export default CrudIndexRoute.extend({
	model: function() {
		return this.store.find('user');
	},
	actions: {
		edit: function(item) {
			this.transitionTo('users.edit',item);
		}
	}
});
