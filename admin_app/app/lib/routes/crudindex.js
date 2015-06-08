import AuthenticateRoute from './authenticated';

export default AuthenticateRoute.extend({
	showRoute: function() {
		return this.get('routeName')+".show";
	},
	actions: {
		delete: function(item) {
			var me = this;
			item.destroyRecord().then(function() {
				me.refresh();
			});
		},
		restore: function(item) {
			var me = this;
			item.set('deleted', false).save().then(function() {
				me.refresh();
			});
		}
	}
});