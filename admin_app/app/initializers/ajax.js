import ajax from '../helpers/ajax';

export function initialize(container, app) {
	app.register('ajax:main',ajax, {instantiate: true});
	app.inject('ajax:main','adapter', 'adapter:application');
	app.inject('controller', 'ajax', 'ajax:main');
	app.inject('model','ajax','ajax:main');
	app.inject('route','ajax','ajax:main');
}

export default {
  name: 'ajax',
  initialize: initialize
};
