import Ember from 'ember';
import CrudEditRoute from '../../lib/routes/crudedit';
export default CrudEditRoute.extend({
	model: function(params) {
		return this.store.find('order',params.id);
	},
	actions: {
		restore: function(item) {
			var me = this;
			item.set('deleted', false).save().then(function() {
				me.refresh();
			});
		},
		removeFromOrder: function(item) {
			var me = this;
			var orderId = this.currentModel.get('id');
			item.removeFromOrder(orderId).then(function() {
				me.currentModel.reload();
			});
		},
		update: function(item) {
			var me = this;
			item.save().then(function() {
				me.transitionTo('orders.index');
			});
			return false;
		},
		cancel: function() {
			this.transitionTo('orders.index');
			return false;
		}
	}
});
