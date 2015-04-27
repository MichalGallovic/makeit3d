import Ember from 'ember';
import AuthenticatedRoute from '../../lib/routes/authenticated';

export default AuthenticatedRoute.extend({
	model: function(params) {
		return this.store.find('category',params.id);
	}
});
