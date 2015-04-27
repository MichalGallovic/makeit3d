import Ember from 'ember';
import { objectKeys } from '../helpers/utils';

export default Ember.Component.extend({
	setupProperties: function() {
		var me = this;
		var properties = objectKeys(this.get('model'));
		var item = Ember.A();

		properties.forEach(function(elm) {
			var obj = {
				key : elm,
				value : me.get('model').get(elm)
			};
			item.pushObject(obj);
		});

		this.set('item', item);
	}.on('init'),
	item: null

});
