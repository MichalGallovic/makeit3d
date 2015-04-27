export function eachProperty(obj, hash) {
  var key, result, value;
  result = "";

  for(key in obj) {
  	value = obj[key];
  	result += hash.fn({
  		key : key,
  		value : value
  	});
  }

  return result;
}