import Ember from 'ember';

export function objectToRow(params/*, hash*/) {
  var result = "";
  var item = params.get('firstObject').get('data');
  Ember.$.each(item, function(index, value) {
  	result += "<td>"+value+"</td>";
  });

  return new Ember.Handlebars.SafeString(result);
}

export default Ember.HTMLBars.makeBoundHelper(objectToRow);
