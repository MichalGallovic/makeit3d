import Ember from 'ember';
import AuthenticatedRoute from '../../lib/routes/authenticated';

export default AuthenticatedRoute.extend({
	beforeModel: function() {
		this._super();
		var me = this;
		this.controllerFor('sessions').logout().then(
			function(response) {
				me.redirectToLogin(null);
			},
			function(error) {

			}
		);
	}
});
