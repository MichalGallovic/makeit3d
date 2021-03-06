import DS from 'ember-data';

export default DS.Model.extend({
	name: DS.attr('string'),
	image_url: DS.attr('string'),
	deleted: DS.attr('boolean'),
    created: DS.attr('date'),
  forceDelete: function() {
    return this.ajax.delete('categories/'+this.id+'?forceDelete=true');
  }
});
