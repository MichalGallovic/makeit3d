import Ember from 'ember';

export default Ember.Controller.extend({
    sortedModel: function() {
        var me = this;
        return Ember.ArrayProxy.createWithMixins(Ember.SortableMixin, {
            sortProperties: ['created'],
            sortAscending: false,
            content: me.get('model')
        });
    }.property('model')
});