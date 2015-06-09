define([

], function(){
	var custom = {};
	custom.get =  function(){
		return $.get('http://jsonplaceholder.typicode.com/comments').then(function(resp){
			console.log('som v returne');
			console.log(resp);
			return resp
		})
	};
  return custom;
});

