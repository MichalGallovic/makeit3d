import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  serializeBelongsTo: function(snapshot, json, relationship) {
    var key = relationship.key;
    var belongsTo = snapshot.belongsTo(key);
    key = this.keyForRelationship ? this.keyForRelationship(key, "belongsTo", "serialize") : key;
    json[key] = Ember.isNone(belongsTo) ? belongsTo : belongsTo.record._data.id;
  }
});
