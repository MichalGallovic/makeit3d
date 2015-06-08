import CrudEditRoute from '../../lib/routes/crudedit';

export default CrudEditRoute.extend({
	model: function(params) {
		return this.store.find('users',params.id);
	},
	actions: {
		update: function(item) {
			var me = this;
			item.save().then(function() {
				me.transitionTo('users.index');
			});
			return false;
		},
		cancel: function() {
			this.transitionTo('users.index');
			return false;
		}
	}	
});

