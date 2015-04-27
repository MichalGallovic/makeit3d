import Ember from 'ember';

export default Ember.Controller.extend({
	needs: ['sessions'],
	username : null,
	password : null,
	clearLoginForm : function() {
		this.setProperties({
			username : null,
			password : null
		});
	},
	actions : {
		login : function () {
			var me = this,
				data = this.getProperties('username','password');

			this.clearLoginForm();

			this.ajax.post('users/login', data).then(
				function(response) {
					me.get('controllers.sessions').login(response);
				},
				function(error) {
					console.log(error);
				}
			);
		}
	}
});
