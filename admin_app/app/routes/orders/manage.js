import Ember from 'ember';

export default Ember.Route.extend({
	printerStatusTimer: null,
	model: function(params) {
		return this.store.find('order',params.id);
	},
	afterModel: function(order) {
		order.set('was_opened',true);
		order.save();
		this.refreshPrinterStatus();
	},
	refreshPrinterStatus: function() {
		var me = this;
		this.printerStatusTimer = Ember.run.later(function() {
			me.controller.getPrinterStatus();
			me.refreshPrinterStatus();
		}, 5000);
	},
	actions: {
		willTransition: function() {
			Ember.run.cancel(this.printerStatusTimer);
		}
	}
});
