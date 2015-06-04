import Ember from 'ember';

export default Ember.Controller.extend({
	actions: {
		update: function(item) {
			var me = this;
			item.save().then(function() {
				me.transitionToRoute('categories.index');
			});
		},
		cancel: function() {
			this.transitionToRoute('categories.index');
			return false;
		}
	}
});
