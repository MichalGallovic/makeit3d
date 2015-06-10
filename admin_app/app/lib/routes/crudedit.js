import AuthenticateRoute from './authenticated';

export default AuthenticateRoute.extend({
	actions: {
		willTransition: function() {
			if(this.currentModel.get('isDirty')) {
				this.currentModel.rollback();
			}
		}
	}
});
