import AuthenticateRoute from './authenticated';

export default AuthenticateRoute.extend({
	actions: {
		willTransition: function() {
			var model = this.controller.get('model');
      model.rollback();
		},
    imageUploaded: function(response) {
      var model = this.controller.get('model');
      model.set('image_url',response.image_url);
      this.controller.set('model', model);
    }
	}
});
