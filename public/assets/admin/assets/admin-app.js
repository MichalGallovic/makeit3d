/* jshint ignore:start */

/* jshint ignore:end */

define('admin-app/adapters/application', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	exports['default'] = DS['default'].RESTAdapter.extend({
		namespace: 'api',
		headers: (function () {
			return {
				'Requested-With': 'ember',
				'X-Auth-Token': window.localStorage.getItem('makeit3d-apikey')
			};
		}).property().volatile()
	});

});
define('admin-app/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'admin-app/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

  var App;

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver['default']
  });

  loadInitializers['default'](App, config['default'].modulePrefix);

  exports['default'] = App;

});
define('admin-app/components/file-upload', ['exports', 'ember', 'ember-uploader'], function (exports, Ember, EmberUploader) {

  'use strict';

  exports['default'] = EmberUploader['default'].FileField.extend({
    url: '',
    filesDidChange: (function () {
      var me = this;
      var uploadUrl = this.get('url');
      var files = this.get('files');

      var CustomizedUploader = EmberUploader['default'].Uploader.extend({
        headers: {
          headers: {
            'Requested-With': 'ember',
            'X-Auth-Token': window.localStorage.getItem('makeit3d-apikey')
          }
        },
        // Overridable hook, by default changes nothing.
        ajaxSettings: function ajaxSettings(settings) {
          settings = Ember['default'].merge(settings, this.get('headers'));
          return settings;
        },

        _ajax: function _ajax(settings) {
          settings = this.ajaxSettings(settings);
          return this._super(settings);
        }
      });

      var uploader = CustomizedUploader.create({
        url: uploadUrl,
        paramName: 'model'
      });

      if (!Ember['default'].isEmpty(files)) {
        var promise = uploader.upload(files[0]);

        promise.then(function (response) {
          me.sendAction('modelUploaded', response);
        });
      }
    }).observes('files')
  });

});
define('admin-app/components/item-show', ['exports', 'ember', 'admin-app/helpers/utils'], function (exports, Ember, utils) {

	'use strict';

	exports['default'] = Ember['default'].Component.extend({
		setupProperties: (function () {
			var me = this;
			var properties = utils.objectKeys(this.get('model'));
			var item = Ember['default'].A();

			properties.forEach(function (elm) {
				var obj = {
					key: elm,
					value: me.get('model').get(elm)
				};
				item.pushObject(obj);
			});

			this.set('item', item);
		}).on('init'),
		item: null

	});

});
define('admin-app/components/items-list', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Component.extend({
		showRoute: null,
		prepareProperties: (function () {
			this.update();
		}).on('init'),
		update: (function () {
			var propString = this.get('properties');
			var propsArr = null;
			if (!Ember['default'].isArray(propString)) {
				propsArr = propString.replace(/ /g, '').split(',');
				this.set('properties', propsArr);
			} else {
				propsArr = this.get('properties');
			}
			var items = this.get('items');
			var itemsArr = Ember['default'].A();
			items.forEach(function (elm) {
				var obj = Ember['default'].Object.create();
				var data = Ember['default'].A();
				propsArr.forEach(function (prop) {
					data.pushObject(elm.get(prop));
				});
				obj.set('data', data);
				obj.set('store', elm);
				itemsArr.pushObject(obj);
			});

			this.set('items_list', itemsArr);
		}).observes('items.@each'),
		items_properties: null,
		items_list: null,
		resource: null,
		actions: {
			'delete': function _delete(item) {
				if (confirm('Do you really want to delete this model?')) {
					this.sendAction('delete', item);
				}
			},
			edit: function edit(item) {
				this.sendAction('edit', item);
			},
			restore: function restore(item) {
				this.sendAction('restore', item);
			}
		}
	});

});
define('admin-app/components/keyboard-select-picker', ['exports', 'ember', 'admin-app/components/select-picker', 'ember-keyboard-shortcuts/mixins/component'], function (exports, Ember, SelectPicker, KeyboardShortcutsMixin) {

  'use strict';

  function makeKeyboardAction(fn) {
    return function () {
      if (!this.get('showDropdown')) {
        // ignore keyboard input on components that are not *in focus*
        return true;
      }
      fn.apply(this, arguments);
      return false;
    };
  }

  var KeyboardSelectPickerComponent = SelectPicker['default'].extend(KeyboardShortcutsMixin['default'], {

    layoutName: 'components/select-picker',

    nativeMobile: true,

    activeCursor: null,

    classNames: ['select-picker', 'keyboard-select-picker'],

    groupedContentList: Ember['default'].computed('groupedContentListWithoutActive', 'activeIndex', function () {
      var activeIndex = this.get('activeIndex');
      var result = Ember['default'].A(this.get('groupedContentListWithoutActive'));
      result.forEach(function (item, index) {
        item.set('active', index === activeIndex);
      });
      return result;
    }),

    activeIndex: Ember['default'].computed('activeCursor', 'contentList.length', function () {
      var cursor = this.get('activeCursor');
      if (Ember['default'].isNone(cursor)) {
        return null;
      }
      var len = this.get('contentList.length');
      return (cursor % len + len) % len;
    }),

    activeItem: Ember['default'].computed('activeIndex', 'contentList.[]', function () {
      return this.get('contentList').objectAt(this.get('activeIndex'));
    }),

    keyboardShortcuts: {
      'enter': 'selectActiveItem',
      'up': 'activePrev',
      'down': 'activeNext',
      'shift+tab': 'activePrev',
      'tab': 'activeNext',
      'esc': 'closeDropdown'
    },

    actions: {
      activeNext: makeKeyboardAction(function () {
        if (Ember['default'].isNone(this.get('activeCursor'))) {
          this.set('activeCursor', 0);
        } else {
          this.incrementProperty('activeCursor');
        }
      }),

      activePrev: makeKeyboardAction(function () {
        if (Ember['default'].isNone(this.get('activeCursor'))) {
          this.set('activeCursor', -1);
        } else {
          this.decrementProperty('activeCursor');
        }
      }),

      selectActiveItem: makeKeyboardAction(function () {
        var item = this.get('activeItem');
        if (Ember['default'].isPresent(item)) {
          this.send('selectItem', item);
        }
      })
    }
  });

  exports['default'] = KeyboardSelectPickerComponent;

});
define('admin-app/components/labeled-radio-button', ['exports', 'ember-radio-button/components/labeled-radio-button'], function (exports, LabeledRadioButton) {

	'use strict';

	exports['default'] = LabeledRadioButton['default'];

});
define('admin-app/components/list-picker', ['exports', 'ember', 'ember-cli-select-picker/mixins/select-picker'], function (exports, Ember, SelectPickerMixin) {

  'use strict';

  var I18nProps = Ember['default'].I18n && Ember['default'].I18n.TranslateableProperties || {};

  var ListPickerComponent = Ember['default'].Component.extend(SelectPickerMixin['default'], I18nProps, {

    selectAllLabel: 'Select All',
    selectNoneLabel: 'Select None',

    nativeMobile: false,

    classNames: ['select-picker', 'list-picker'],

    groupedContentList: Ember['default'].computed('contentList.@each', function () {
      var groups = Ember['default'].A();
      var content = Ember['default'].A();
      this.get('contentList').forEach(function (item) {
        var header,
            itemGroup = item.get('group');
        var groupIndex = groups.indexOf(itemGroup);
        if (groupIndex < 0) {
          header = itemGroup;
          groups.push(header);
          content.push(Ember['default'].Object.create({
            header: header,
            items: Ember['default'].A([item])
          }));
        } else {
          content[groupIndex].get('items').push(item);
        }
      });
      return content;
    })
  });

  exports['default'] = ListPickerComponent;

});
define('admin-app/components/radio-button', ['exports', 'ember-radio-button/components/radio-button'], function (exports, RadioButton) {

	'use strict';

	exports['default'] = RadioButton['default'];

});
define('admin-app/components/select-picker', ['exports', 'ember', 'ember-cli-select-picker/mixins/select-picker'], function (exports, Ember, SelectPickerMixin) {

  'use strict';

  var I18nProps = Ember['default'].I18n && Ember['default'].I18n.TranslateableProperties || {};

  var SelectPickerComponent = Ember['default'].Component.extend(SelectPickerMixin['default'], I18nProps, {

    nothingSelectedMessage: 'Nothing Selected',
    summaryMessage: '%@ items selected',
    selectAllLabel: 'All',
    selectNoneLabel: 'None',

    nativeMobile: true,

    classNames: ['select-picker', 'btn-group'],
    buttonClass: 'btn-default',

    badgeEnabled: Ember['default'].computed.and('showBadge', 'multiple'),

    selectionBadge: Ember['default'].computed('selection.length', 'badgeEnabled', function () {
      var enabled = this.get('badgeEnabled');
      var selected = this.get('selection.length');
      return enabled && selected && selected !== 0 ? selected : '';
    }),

    setupDom: Ember['default'].on('didInsertElement', function () {
      $(document).on('click.' + this.get('elementId'), Ember['default'].run.bind(this, this.hideDropdownMenu));
    }),

    hideDropdownMenu: function hideDropdownMenu(evt) {
      if (this.get('keepDropdownOpen')) {
        this.set('keepDropdownOpen', false);
        return;
      }
      if (this.element && !$.contains(this.element, evt.target)) {
        this.send('closeDropdown');
      }
    },

    teardownDom: Ember['default'].on('willDestroyElement', function () {
      $(document).off('.' + this.get('elementId'));
    }),

    actions: {
      showHide: function showHide() {
        this.toggleProperty('showDropdown');
      },
      closeDropdown: function closeDropdown() {
        this.set('showDropdown', false);
      }
    }
  });

  exports['default'] = SelectPickerComponent;

});
define('admin-app/controllers/application', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller.extend({
		needs: ['sessions'],
		isAuthenticated: (function () {
			return !Ember['default'].isEmpty(this.get('controllers.sessions.currentUser'));
		}).property('controllers.sessions.currentUser')
	});

});
define('admin-app/controllers/categories/edit', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller.extend({
		actions: {
			update: function update(item) {
				var me = this;
				item.save().then(function () {
					me.transitionToRoute('categories.index');
				});
			},
			cancel: function cancel() {
				this.transitionToRoute('categories.index');
				return false;
			}
		}
	});

});
define('admin-app/controllers/models/edit', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller.extend({
		users: [],
		actions: {
			update: function update(item) {
				var me = this;
				item.save().then(function () {
					me.transitionToRoute('models.index');
				});
			},
			cancel: function cancel() {
				this.transitionToRoute('models.index');
				return false;
			}
		}
	});

});
define('admin-app/controllers/models/index', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller.extend({});

});
define('admin-app/controllers/orders/manage', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller.extend({
		printerUnpluged: true,
		getPrinterStatus: function getPrinterStatus() {
			var me = this;
			return this.ajax.getJSON('printer/status').then(function (response) {
				if (response.status === 'Operational') {
					me.set('printerUnpluged', false);
				}
			});
		},
		actions: {
			print: function print(model) {
				model.print();
			},
			shipped: function shipped() {
				this.get('model').set('was_shipped', true).save();
			}
		}
	});

});
define('admin-app/controllers/sessions', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller.extend({
		needs: ['application'],
		localStorageName: 'makeit3d-apikey',
		currentUser: null,
		attemptedTransition: null,
		username: null,
		password: null,
		init: function init() {
			this._super();

			var access_token = this.getToken();

			if (!Ember['default'].isEmpty(access_token)) {
				this.restore();
			}
		},

		getToken: function getToken() {
			if (typeof Storage === 'undefined') {
				Ember['default'].assert('No local storage support.');
			}

			var ls_token = window.localStorage.getItem(this.localStorageName);

			return ls_token;
		},
		setToken: function setToken(token) {
			if (typeof Storage === 'undefined') {
				Ember['default'].assert('No local storage support.');
			}
			window.localStorage.setItem(this.localStorageName, token);
		},
		restore: function restore() {
			var me = this;

			this.ajax.getJSON('users/current').then(function (response) {
				me.login(response);
			}, function () {
				me.resetSession();
				me.transitionToRoute('sessions.login');
			});
		},
		resetProperties: function resetProperties() {
			this.setProperties({
				username: null,
				password: null,
				currentUser: null
			});
		},
		resetSession: function resetSession() {
			this.resetProperties();
			this.setToken('');
			this.get('controllers.application').set('isAuthenticated', false);
		},
		login: function login(response) {
			this.resetProperties();
			var user = this.store.createRecord('user', response.user[0]);
			this.set('currentUser', user);
			this.setToken(user.get('token'));
			var attemtedTrans = this.get('attemptedTransition');

			this.get('controllers.application').set('isAuthenticated', true);

			if (attemtedTrans) {
				attemtedTrans.retry();
				this.set('attemptedTransition', null);
			} else {
				this.transitionToRoute('dashboard');
			}
		},
		logout: function logout() {
			var me = this;

			var promise = new Ember['default'].RSVP.Promise(function (resolve, reject) {
				me.ajax['delete']('users/logout').then(function (response) {
					me.store.deleteRecord(me.currentUser);
					me.resetSession();
					resolve(response);
				}, function (error) {
					reject(error);
				});
			});

			return promise;
		}
	});

});
define('admin-app/controllers/sessions/login', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller.extend({
		needs: ['sessions'],
		username: null,
		password: null,
		clearLoginForm: function clearLoginForm() {
			this.setProperties({
				username: null,
				password: null
			});
		},
		actions: {
			login: function login() {
				var me = this,
				    data = this.getProperties('username', 'password');

				this.clearLoginForm();

				this.ajax.post('users/login', data).then(function (response) {
					me.get('controllers.sessions').login(response);
				}, function (error) {
					console.log(error);
				});
			}
		}
	});

});
define('admin-app/helpers/ajax', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Object.extend({
		namespace: (function () {
			return this.adapter.get('namespace');
		}).property('this.adapter'),
		headers: (function () {
			return this.adapter.get('headers');
		}).property().volatile(),
		getJSONwoDS: function getJSONwoDS(url) {
			var me = this;

			var promise = new Ember['default'].RSVP.Promise(function (resolve, reject) {
				Ember['default'].$.ajax({
					type: 'GET',
					url: me.get('namespace') + '/' + url,
					headers: {
						'X-Auth-Token': window.localStorage.getItem('makeit3d-apikey')
					}
				}).done(function (response) {
					resolve(response);
				}).fail(function (error) {
					reject(error);
				});
			});

			return promise;
		},
		getJSON: function getJSON(url) {
			var me = this;

			var promise = new Ember['default'].RSVP.Promise(function (resolve, reject) {
				Ember['default'].$.ajax({
					type: 'GET',
					url: me.get('namespace') + '/' + url,
					headers: me.get('headers')
				}).done(function (response) {
					resolve(response);
				}).fail(function (error) {
					reject(error);
				});
			});

			return promise;
		},
		post: function post(url, data) {
			var me = this;

			var promise = new Ember['default'].RSVP.Promise(function (resolve, reject) {
				Ember['default'].$.ajax({
					type: 'POST',
					url: me.get('namespace') + '/' + url,
					headers: me.get('headers'),
					data: data
				}).done(function (response) {
					resolve(response);
				}).fail(function (error) {
					reject(error);
				});
			});

			return promise;
		},
		'delete': function _delete(url) {
			var me = this;

			var promise = new Ember['default'].RSVP.Promise(function (resolve, reject) {
				Ember['default'].$.ajax({
					type: 'DELETE',
					url: me.get('namespace') + '/' + url,
					headers: me.get('headers')
				}).done(function (response) {
					resolve(response);
				}).fail(function (error) {
					reject(error);
				});
			});

			return promise;
		},
		put: function put(url, data) {
			var me = this;

			var promise = new Ember['default'].RSVP.Promise(function (resolve, reject) {
				Ember['default'].$.ajax({
					type: 'PUT',
					url: me.get('namespace') + '/' + url,
					headers: me.get('headers'),
					data: data
				}).done(function (response) {
					resolve(response);
				}).fail(function (error) {
					reject(error);
				});
			});

			return promise;
		}
	});

});
define('admin-app/helpers/custom-log', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports.log = log;

	function log(params) {
		params.get('firstObject').get('content').forEach(function (elm) {
			console.log(elm.get('data'));
		});
	}

	exports['default'] = Ember['default'].HTMLBars.makeBoundHelper(log);

});
define('admin-app/helpers/object-to-row', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports.objectToRow = objectToRow;

  function objectToRow(params /*, hash*/) {
    var result = '';
    var item = params.get('firstObject').get('data');
    Ember['default'].$.each(item, function (index, value) {
      result += '<td>' + value + '</td>';
    });

    return new Ember['default'].Handlebars.SafeString(result);
  }

  exports['default'] = Ember['default'].HTMLBars.makeBoundHelper(objectToRow);

});
define('admin-app/helpers/round-percents', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports.parsetime = parsetime;

	function parsetime(params) {
		var percents = params[0];
		return Math.round(percents * 100) / 100 + "%";
	}

	exports['default'] = Ember['default'].HTMLBars.makeBoundHelper(parsetime);

});
define('admin-app/helpers/seconds-to-time', ['exports', 'ember'], function (exports, Ember) {

   'use strict';

   exports.parsetime = parsetime;

   function parsetime(params) {
      var sec_num = parseInt(params[0], 10);
      var hours = Math.floor(sec_num / 3600);
      var minutes = Math.floor((sec_num - hours * 3600) / 60);
      var seconds = sec_num - hours * 3600 - minutes * 60;

      if (hours < 10) {
         hours = "0" + hours;
      }
      if (minutes < 10) {
         minutes = "0" + minutes;
      }
      if (seconds < 10) {
         seconds = "0" + seconds;
      }
      var time = hours + ":" + minutes + ":" + seconds;
      return time;
   }

   exports['default'] = Ember['default'].HTMLBars.makeBoundHelper(parsetime);

});
define('admin-app/helpers/utils', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports.objectKeys = objectKeys;

	function objectKeys(object) {
		if (Ember['default'].isArray(object)) {
			return Ember['default'].keys(object.get('firstObject').toJSON());
		}
		return Ember['default'].keys(object.toJSON());
	}

});
define('admin-app/initializers/ajax', ['exports', 'admin-app/helpers/ajax'], function (exports, ajax) {

	'use strict';

	exports.initialize = initialize;

	function initialize(container, app) {
		app.register('ajax:main', ajax['default'], { instantiate: true });
		app.inject('ajax:main', 'adapter', 'adapter:application');
		app.inject('controller', 'ajax', 'ajax:main');
		app.inject('model', 'ajax', 'ajax:main');
		app.inject('route', 'ajax', 'ajax:main');
	}

	exports['default'] = {
		name: 'ajax',
		initialize: initialize
	};

});
define('admin-app/initializers/app-version', ['exports', 'admin-app/config/environment', 'ember'], function (exports, config, Ember) {

  'use strict';

  var classify = Ember['default'].String.classify;
  var registered = false;

  exports['default'] = {
    name: 'App Version',
    initialize: function initialize(container, application) {
      if (!registered) {
        var appName = classify(application.toString());
        Ember['default'].libraries.register(appName, config['default'].APP.version);
        registered = true;
      }
    }
  };

});
define('admin-app/initializers/custom-htmlbars-helpers', ['exports', 'admin-app/lib/utils/register-helper', 'admin-app/lib/helpers/each-property'], function (exports, register_helper, each_property) {

  'use strict';

  exports.initialize = initialize;

  function initialize() {
    register_helper.registerHelper('eachProperty', each_property.eachPropertyHelper);
  }

  exports['default'] = {
    name: 'custom-htmlbars-helpers',
    initialize: initialize
  };
  /* container, application */

});
define('admin-app/initializers/export-application-global', ['exports', 'ember', 'admin-app/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    var classifiedName = Ember['default'].String.classify(config['default'].modulePrefix);

    if (config['default'].exportApplicationGlobal && !window[classifiedName]) {
      window[classifiedName] = application;
    }
  }

  ;

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };

});
define('admin-app/lib/helpers/each-property', ['exports'], function (exports) {

  'use strict';

  exports.eachProperty = eachProperty;

  function eachProperty(obj, hash) {
    var key, result, value;
    result = "";

    for (key in obj) {
      value = obj[key];
      result += hash.fn({
        key: key,
        value: value
      });
    }

    return result;
  }

});
define('admin-app/lib/routes/authenticated', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({
		beforeModel: function beforeModel(transition) {
			if (Ember['default'].isEmpty(this.controllerFor('sessions').get('currentUser'))) {
				return this.redirectToLogin(transition);
			}
		},
		redirectToLogin: function redirectToLogin(transition) {
			this.controllerFor('sessions').set('attemptedTransition', transition);
			return this.transitionTo('sessions.login');
		}
	});

});
define('admin-app/lib/routes/crudcreate', ['exports', 'admin-app/lib/routes/authenticated'], function (exports, AuthenticateRoute) {

	'use strict';

	exports['default'] = AuthenticateRoute['default'].extend({
		actions: {
			willTransition: function willTransition() {
				if (this.currentModel.get('isDirty')) {
					this.currentModel.rollback();
				}
			}
		}
	});

});
define('admin-app/lib/routes/crudedit', ['exports', 'admin-app/lib/routes/authenticated'], function (exports, AuthenticateRoute) {

	'use strict';

	exports['default'] = AuthenticateRoute['default'].extend({
		actions: {
			willTransition: function willTransition() {
				if (this.currentModel.get('isDirty')) {
					this.currentModel.rollback();
				}
			}
		}
	});

});
define('admin-app/lib/routes/crudindex', ['exports', 'admin-app/lib/routes/authenticated'], function (exports, AuthenticateRoute) {

	'use strict';

	exports['default'] = AuthenticateRoute['default'].extend({
		actions: {
			'delete': function _delete(item) {
				var me = this;
				item.destroyRecord().then(function () {
					me.refresh();
				});
			},
			restore: function restore(item) {
				var me = this;
				item.set('deleted', false).save().then(function () {
					me.refresh();
				});
			}
		}
	});

});
define('admin-app/lib/routes/unauthenticated', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({
		beforeModel: function beforeModel() {
			if (!Ember['default'].isEmpty(this.controllerFor('sessions').get('currentUser'))) {
				return this.redirectToDashboard();
			}
		},
		redirectToDashboard: function redirectToDashboard() {
			return this.transitionTo('dashboard');
		}
	});

});
define('admin-app/lib/utils/register-helper', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports.registerHelper = registerHelper;

	function registerHelperIteration1(name, helperFunction) {
		//earlier versions of ember with htmlbars used this
		Ember['default'].HTMLBars.helpers[name] = Ember['default'].HTMLBars.makeBoundHelper(helperFunction);
	}

	function registerHelperIteration2(name, helperFunction) {
		//registerHelper has been made private as _registerHelper
		//this is kept here if anyone is using it
		Ember['default'].HTMLBars.registerHelper(name, Ember['default'].HTMLBars.makeBoundHelper(helperFunction));
	}

	function registerHelperIteration3(name, helperFunction) {
		//latest versin of ember uses this
		Ember['default'].HTMLBars._registerHelper(name, Ember['default'].HTMLBars.makeBoundHelper(helperFunction));
	}
	function registerHelper(name, helperFunction) {
		if (Ember['default'].HTMLBars._registerHelper) {
			if (Ember['default'].HTMLBars.helpers) {
				registerHelperIteration1(name, helperFunction);
			} else {
				registerHelperIteration3(name, helperFunction);
			}
		} else if (Ember['default'].HTMLBars.registerHelper) {
			registerHelperIteration2(name, helperFunction);
		}
	}

});
define('admin-app/models/category', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	exports['default'] = DS['default'].Model.extend({
		name: DS['default'].attr('string'),
		image_url: DS['default'].attr('string'),
		deleted: DS['default'].attr('boolean')
	});

});
define('admin-app/models/model', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	exports['default'] = DS['default'].Model.extend({
		name: DS['default'].attr('string'),
		visible: DS['default'].attr('number'),
		price: DS['default'].attr('number'),
		image_url: DS['default'].attr('string'),
		printing_time: DS['default'].attr('number'),
		filament_length: DS['default'].attr('number'),
		filament_volume: DS['default'].attr('number'),
		download_link_gcode: DS['default'].attr('string'),
		download_link_stl: DS['default'].attr('string'),
		deleted: DS['default'].attr('boolean'),
		created_by: DS['default'].attr('string'),
		print: function print() {
			return this.ajax.getJSON('models/' + this.id + '/print');
		},
		removeFromOrder: function removeFromOrder(orderId) {
			return this.ajax['delete']('orders/' + orderId + '/models/' + this.id);
		}
	});

});
define('admin-app/models/order', ['exports', 'ember-data', 'ember'], function (exports, DS, Ember) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    first_name: DS['default'].attr('string'),
    last_name: DS['default'].attr('string'),
    street: DS['default'].attr('string'),
    town: DS['default'].attr('string'),
    country: DS['default'].attr('string'),
    zip_code: DS['default'].attr('string'),
    price: DS['default'].attr('number'),
    created_at: DS['default'].attr(),
    was_opened: DS['default'].attr('boolean'),
    was_printed: DS['default'].attr('boolean'),
    was_shipped: DS['default'].attr('boolean'),
    models: DS['default'].hasMany('model', { async: true }),
    full_name: (function () {
      return this.get('first_name') + ' ' + this.get('last_name');
    }).property('first_name', 'last_name'),
    address: (function () {
      return this.get('street') + ', ' + this.get('town') + ' ' + this.get('zip_code') + ', ' + this.get('country');
    }).property('street', 'town', 'country'),
    reloadAssociated: function reloadAssociated() {
      var modelPromises = this.get('models').invoke('reload');

      return Ember['default'].RSVP.hash({
        models: modelPromises
      });
    }
  });

});
define('admin-app/models/user', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	exports['default'] = DS['default'].Model.extend({
		email: DS['default'].attr('string'),
		username: (function () {
			return this.get('email');
		}).property('email'),
		first_name: DS['default'].attr('string'),
		last_name: DS['default'].attr('string'),
		confirmed: DS['default'].attr('number'),
		street: DS['default'].attr('string'),
		town: DS['default'].attr('string'),
		country: DS['default'].attr('string'),
		zip_code: DS['default'].attr('string'),
		token: DS['default'].attr('string'),
		full_name: function full_name() {
			return this.get('first_name') + ' ' + this.get('last_name');
		}

	});

});
define('admin-app/router', ['exports', 'ember', 'admin-app/config/environment'], function (exports, Ember, config) {

  'use strict';

  var Router = Ember['default'].Router.extend({
    location: config['default'].locationType
  });

  exports['default'] = Router.map(function () {
    this.route('/');
    this.route('sessions', function () {
      this.route('login');
      this.route('logout'); // authenticated route
    });

    // authenticated routes
    this.route('dashboard');
    this.route('models', function () {
      this.route('create');
      this.route('show', { path: ':id' });
      this.route('edit', { path: ':id/edit' });
    });
    this.route('users', function () {
      this.route('create');
      this.route('show', { path: ':id' });
      this.route('edit', { path: ':id/edit' });
    });
    this.route('orders', function () {
      this.route('create');
      this.route('manage', { path: ':id/manage' });
      this.route('show', { path: ':id' });
      this.route('edit', { path: ':id/edit' });
    });
    this.route('categories', function () {
      this.route('create');
      this.route('show', { path: ':id' });
      this.route('edit', { path: ':id/edit' });
    });
  });

});
define('admin-app/routes/categories/create', ['exports', 'admin-app/lib/routes/authenticated'], function (exports, AuthenticatedRoute) {

	'use strict';

	exports['default'] = AuthenticatedRoute['default'].extend({});

});
define('admin-app/routes/categories/edit', ['exports', 'admin-app/lib/routes/authenticated'], function (exports, AuthenticatedRoute) {

	'use strict';

	exports['default'] = AuthenticatedRoute['default'].extend({
		model: function model(params) {
			return this.store.find('category', params.id);
		}
	});

});
define('admin-app/routes/categories/index', ['exports', 'admin-app/lib/routes/crudindex'], function (exports, CrudIndexRoute) {

	'use strict';

	exports['default'] = CrudIndexRoute['default'].extend({
		model: function model() {
			return this.store.find('category');
		}
	});

});
define('admin-app/routes/categories/show', ['exports', 'admin-app/lib/routes/authenticated'], function (exports, AuthenticatedRoute) {

	'use strict';

	exports['default'] = AuthenticatedRoute['default'].extend({
		model: function model(params) {
			return this.store.find('category', params.id);
		}
	});

});
define('admin-app/routes/dashboard', ['exports', 'ember', 'admin-app/lib/routes/authenticated'], function (exports, Ember, AuthenticatedRoute) {

	'use strict';

	exports['default'] = AuthenticatedRoute['default'].extend({
		modelRefreshTimer: null,
		afterModel: function afterModel() {
			var me = this;
			this.ajax.getJSON('printer/status').then(function (response) {
				me.controller.set('model', response);
			});
			this.refreshModel();
		},
		refreshModel: function refreshModel() {
			var me = this;
			this.modelRefreshTimer = Ember['default'].run.later(function () {
				me.ajax.getJSON('printer/status').then(function (response) {
					me.controller.set('model', response);
				});
				me.refreshModel();
			}, 5000);
		},
		actions: {
			updateStatus: function updateStatus() {
				this.refreshModel();
			},
			willTransition: function willTransition() {
				Ember['default'].run.cancel(this.modelRefreshTimer);
			}
		}
	});

});
define('admin-app/routes/index', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({
		beforeModel: function beforeModel() {
			this.transitionTo('sessions.login');
		}
	});

});
define('admin-app/routes/models/create', ['exports', 'admin-app/lib/routes/crudcreate'], function (exports, CrudCreateRoute) {

	'use strict';

	exports['default'] = CrudCreateRoute['default'].extend({
		model: function model() {
			return null;
		},
		actions: {
			modelUploaded: function modelUploaded(response) {
				var me = this;
				this.store.find('model', response.model[0].id).then(function (newModel) {
					me.controller.set('model', newModel);
				});
			},
			create: function create(item) {
				var me = this;
				item.save().then(function () {
					me.transitionTo('models.index');
				});
			}
		}
	});

});
define('admin-app/routes/models/edit', ['exports', 'admin-app/lib/routes/crudedit'], function (exports, CrudEditRoute) {

	'use strict';

	exports['default'] = CrudEditRoute['default'].extend({
		model: function model(params) {
			return this.store.find('model', params.id);
		},
		setupController: function setupController(controller, model) {
			controller.set('model', model);

			this.store.find('user').then(function (users) {
				controller.set('users', users);
			});
		}
	});

});
define('admin-app/routes/models/index', ['exports', 'admin-app/lib/routes/crudindex'], function (exports, CrudIndexRoute) {

	'use strict';

	exports['default'] = CrudIndexRoute['default'].extend({
		model: function model() {
			return this.store.find('model');
		}
	});

});
define('admin-app/routes/models/show', ['exports', 'admin-app/lib/routes/authenticated'], function (exports, AuthenticatedRoute) {

	'use strict';

	exports['default'] = AuthenticatedRoute['default'].extend({
		model: function model(params) {
			return this.store.find('model', params.id);
		}
	});

});
define('admin-app/routes/orders/create', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('admin-app/routes/orders/edit', ['exports', 'admin-app/lib/routes/crudedit'], function (exports, CrudEditRoute) {

	'use strict';

	exports['default'] = CrudEditRoute['default'].extend({
		model: function model(params) {
			return this.store.find('order', params.id);
		},
		actions: {
			restore: function restore(item) {
				var me = this;
				item.set('deleted', false).save().then(function () {
					me.refresh();
				});
			},
			removeFromOrder: function removeFromOrder(item) {
				var me = this;
				var orderId = this.currentModel.get('id');
				item.removeFromOrder(orderId).then(function () {
					me.currentModel.reload();
				});
			},
			update: function update(item) {
				var me = this;
				item.save().then(function () {
					me.transitionTo('orders.index');
				});
				return false;
			},
			cancel: function cancel() {
				this.transitionTo('orders.index');
				return false;
			}
		}
	});

});
define('admin-app/routes/orders/index', ['exports', 'admin-app/lib/routes/crudindex'], function (exports, CrudIndexRoute) {

	'use strict';

	exports['default'] = CrudIndexRoute['default'].extend({
		model: function model() {
			return this.store.find('order');
		}
	});

});
define('admin-app/routes/orders/manage', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({
		printerStatusTimer: null,
		model: function model(params) {
			return this.store.find('order', params.id);
		},
		afterModel: function afterModel(order) {
			order.set('was_opened', true);
			order.save();
			this.refreshPrinterStatus();
		},
		refreshPrinterStatus: function refreshPrinterStatus() {
			var me = this;
			this.printerStatusTimer = Ember['default'].run.later(function () {
				me.controller.getPrinterStatus();
				me.refreshPrinterStatus();
			}, 5000);
		},
		actions: {
			willTransition: function willTransition() {
				Ember['default'].run.cancel(this.printerStatusTimer);
			}
		}
	});

});
define('admin-app/routes/orders/show', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('admin-app/routes/sessions/login', ['exports', 'admin-app/lib/routes/unauthenticated'], function (exports, UnAuthenticatedRoute) {

	'use strict';

	exports['default'] = UnAuthenticatedRoute['default'].extend({});

});
define('admin-app/routes/sessions/logout', ['exports', 'admin-app/lib/routes/authenticated'], function (exports, AuthenticatedRoute) {

	'use strict';

	exports['default'] = AuthenticatedRoute['default'].extend({
		beforeModel: function beforeModel() {
			this._super();
			var me = this;
			this.controllerFor('sessions').logout().then(function () {
				me.redirectToLogin(null);
			});
		}
	});

});
define('admin-app/routes/users/create', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('admin-app/routes/users/edit', ['exports', 'admin-app/lib/routes/crudedit'], function (exports, CrudEditRoute) {

	'use strict';

	exports['default'] = CrudEditRoute['default'].extend({
		model: function model(params) {
			return this.store.find('users', params.id);
		},
		actions: {
			update: function update(item) {
				var me = this;
				item.save().then(function () {
					me.transitionTo('users.index');
				});
				return false;
			},
			cancel: function cancel() {
				this.transitionTo('users.index');
				return false;
			}
		}
	});

});
define('admin-app/routes/users/index', ['exports', 'admin-app/lib/routes/crudindex'], function (exports, CrudIndexRoute) {

	'use strict';

	exports['default'] = CrudIndexRoute['default'].extend({
		model: function model() {
			return this.store.find('user');
		}
	});

});
define('admin-app/routes/users/show', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('admin-app/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-lg-10 col-lg-offset-1");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, inline = hooks.inline, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [2, 1]),1,1);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "partial", ["partials/header"], {});
        content(env, morph1, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/categories/create', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        content(env, morph0, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/categories/edit', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-lg-8 col-lg-offset-2");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h1");
        dom.setAttribute(el3,"class","mb20");
        var el4 = dom.createTextNode("Category Edit");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","well");
        var el4 = dom.createTextNode("\n				");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n					");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Name:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n					");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n				");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n					");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Image url:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n					");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n				");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group text-center");
        var el5 = dom.createTextNode("\n					");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("img");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n				");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n					");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5,"class","btn btn-success");
        var el6 = dom.createTextNode("Save");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n					");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5,"class","btn btn-default");
        var el6 = dom.createTextNode("Cancel");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, concat = hooks.concat, attribute = hooks.attribute, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0, 1, 3]);
        var element1 = dom.childAt(element0, [5, 1]);
        var element2 = dom.childAt(element0, [7]);
        var element3 = dom.childAt(element2, [1]);
        var element4 = dom.childAt(element2, [3]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),3,3);
        var morph1 = dom.createMorphAt(dom.childAt(element0, [3]),3,3);
        var attrMorph0 = dom.createAttrMorph(element1, 'src');
        inline(env, morph0, context, "input", [], {"type": "text", "value": get(env, context, "model.name"), "class": "form-control"});
        inline(env, morph1, context, "input", [], {"type": "text", "value": get(env, context, "model.image_url"), "class": "form-control mb20"});
        attribute(env, attrMorph0, element1, "src", concat(env, [get(env, context, "model.image_url")]));
        element(env, element3, context, "action", ["update", get(env, context, "model")], {});
        element(env, element4, context, "action", ["cancel", get(env, context, "model")], {});
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/categories/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h1");
        dom.setAttribute(el1,"class","mb20");
        var el2 = dom.createTextNode("Categories");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,2,2,contextualElement);
        inline(env, morph0, context, "items-list", [], {"items": get(env, context, "model"), "properties": "id,name, deleted", "showRoute": "categories.show", "editRoute": "categories.edit", "resource": "categories", "delete": "delete", "edit": "edit", "restore": "restore"});
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/categories/show', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h1");
        dom.setAttribute(el1,"class","mb20");
        var el2 = dom.createTextNode("Show Categories");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, null);
        inline(env, morph0, context, "item-show", [], {"model": get(env, context, "model")});
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/components/file-upload', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        content(env, morph0, context, "yield");
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/components/item-show', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("		");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          dom.setAttribute(el1,"style","word-wrap: break-word;");
          var el2 = dom.createElement("strong");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode(": ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [0]),0,0);
          var morph1 = dom.createMorphAt(element0,1,1);
          content(env, morph0, context, "property.key");
          content(env, morph1, context, "property.value");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","well");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),1,1);
        block(env, morph0, context, "each", [get(env, context, "item")], {"keyword": "property"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/components/items-list', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("					");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("th");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
          content(env, morph0, context, "property");
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            revision: "Ember@1.11.1",
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("						");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("td");
              var el2 = dom.createComment("");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, content = hooks.content;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
              content(env, morph0, context, "value");
              return fragment;
            }
          };
        }());
        var child1 = (function() {
          return {
            isHTMLBars: true,
            revision: "Ember@1.11.1",
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("Edit");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              return fragment;
            }
          };
        }());
        var child2 = (function() {
          return {
            isHTMLBars: true,
            revision: "Ember@1.11.1",
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("					");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("td");
              var el2 = dom.createElement("button");
              dom.setAttribute(el2,"class","btn btn-danger");
              var el3 = dom.createTextNode("Delete");
              dom.appendChild(el2, el3);
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, get = hooks.get, element = hooks.element;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var element1 = dom.childAt(fragment, [1, 0]);
              element(env, element1, context, "action", ["delete", get(env, context, "item.store")], {"bubbles": false});
              return fragment;
            }
          };
        }());
        var child3 = (function() {
          return {
            isHTMLBars: true,
            revision: "Ember@1.11.1",
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("					");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("td");
              var el2 = dom.createElement("button");
              dom.setAttribute(el2,"class","btn btn-success");
              var el3 = dom.createTextNode("Restore");
              dom.appendChild(el2, el3);
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, get = hooks.get, element = hooks.element;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var element0 = dom.childAt(fragment, [1, 0]);
              element(env, element0, context, "action", ["restore", get(env, context, "item.store")], {"bubbles": false});
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("					");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("td");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
            var morph1 = dom.createMorphAt(dom.childAt(fragment, [2]),0,0);
            var morph2 = dom.createMorphAt(fragment,4,4,contextualElement);
            dom.insertBoundary(fragment, null);
            dom.insertBoundary(fragment, 0);
            block(env, morph0, context, "each", [get(env, context, "item.data")], {"keyword": "value"}, child0, null);
            block(env, morph1, context, "link-to", [get(env, context, "editRoute"), get(env, context, "item.store")], {"class": "btn btn-primary"}, child1, null);
            block(env, morph2, context, "unless", [get(env, context, "item.store.deleted")], {}, child2, child3);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "link-to", [get(env, context, "showRoute"), get(env, context, "item.store")], {"tagName": "tr"}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","well");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("table");
        dom.setAttribute(el2,"class","table");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("thead");
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("tr");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("th");
        var el6 = dom.createTextNode("Edit");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("th");
        var el6 = dom.createTextNode("Delete");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tbody");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element2 = dom.childAt(fragment, [0, 1]);
        var morph0 = dom.createMorphAt(dom.childAt(element2, [1, 1]),1,1);
        var morph1 = dom.createMorphAt(dom.childAt(element2, [3]),1,1);
        block(env, morph0, context, "each", [get(env, context, "properties")], {"keyword": "property"}, child0, null);
        block(env, morph1, context, "each", [get(env, context, "items_list")], {"keyword": "item"}, child1, null);
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/components/labeled-radio-button', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "radio-button", [], {"changed": "innerRadioChanged", "disabled": get(env, context, "disabled"), "groupValue": get(env, context, "groupValue"), "name": get(env, context, "name"), "required": get(env, context, "required"), "value": get(env, context, "value")});
        content(env, morph1, context, "yield");
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/components/list-picker', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","input-group");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2,"class","input-group-btn");
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("button");
          dom.setAttribute(el3,"type","button");
          dom.setAttribute(el3,"class","btn btn-default list-picker-clear-filter");
          var el4 = dom.createTextNode("\n          ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("span");
          dom.setAttribute(el4,"class","glyphicon glyphicon-remove");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element7 = dom.childAt(fragment, [1]);
          var element8 = dom.childAt(element7, [3, 1]);
          var morph0 = dom.createMorphAt(element7,1,1);
          inline(env, morph0, context, "input", [], {"type": "text", "class": "search-filter form-control", "value": get(env, context, "searchFilter"), "action": "preventClosing", "on": "focus"});
          element(env, element8, context, "bind-attr", [], {"disabled": get(env, context, "clearSearchDisabled")});
          element(env, element8, context, "action", ["clearFilter"], {});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("      ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","btn-group select-all-none");
            dom.setAttribute(el1,"role","group");
            dom.setAttribute(el1,"aria-label","Select all or none");
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("button");
            dom.setAttribute(el2,"type","button");
            dom.setAttribute(el2,"class","btn btn-default");
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("button");
            dom.setAttribute(el2,"type","button");
            dom.setAttribute(el2,"class","btn btn-default");
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n      ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, element = hooks.element, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element4 = dom.childAt(fragment, [1]);
            var element5 = dom.childAt(element4, [1]);
            var element6 = dom.childAt(element4, [3]);
            var morph0 = dom.createMorphAt(element5,0,0);
            var morph1 = dom.createMorphAt(element6,0,0);
            element(env, element5, context, "action", ["selectAllNone", "unselectedContentList"], {});
            content(env, morph0, context, "selectAllLabel");
            element(env, element6, context, "action", ["selectAllNone", "selectedContentList"], {});
            content(env, morph1, context, "selectNoneLabel");
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("      ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"role","group");
            dom.setAttribute(el1,"class","btn-group-vertical btn-block");
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("button");
            dom.setAttribute(el2,"type","button");
            dom.setAttribute(el2,"class","btn btn-default");
            var el3 = dom.createTextNode("\n          ");
            dom.appendChild(el2, el3);
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n          ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("span");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n        ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n      ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, element = hooks.element, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element2 = dom.childAt(fragment, [1, 1]);
            var element3 = dom.childAt(element2, [3]);
            var morph0 = dom.createMorphAt(element2,1,1);
            element(env, element2, context, "action", ["toggleSelectAllNone"], {});
            content(env, morph0, context, "selectAllNoneLabel");
            element(env, element3, context, "bind-attr", [], {"class": ":check-mark :glyphicon glyphiconClass"});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "if", [get(env, context, "splitAllNoneButtons")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("      ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("h4");
            dom.setAttribute(el1,"role","presentation");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
            content(env, morph0, context, "group.header");
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 1,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("button");
            dom.setAttribute(el1,"role","presentation");
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("span");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement, blockArguments) {
            var dom = env.dom;
            var hooks = env.hooks, set = hooks.set, get = hooks.get, element = hooks.element, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1]);
            var element1 = dom.childAt(element0, [3]);
            var morph0 = dom.createMorphAt(element0,1,1);
            set(env, context, "item", blockArguments[0]);
            element(env, element0, context, "action", ["selectItem", get(env, context, "item")], {});
            element(env, element0, context, "bind-attr", [], {"class": ":btn :btn-default item.selected:active"});
            content(env, morph0, context, "item.label");
            element(env, element1, context, "bind-attr", [], {"class": ":glyphicon :glyphicon-ok :check-mark item.selected::invisible"});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"role","group");
          dom.setAttribute(el1,"class","btn-group-vertical btn-block list-picker-items-container");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          var morph1 = dom.createMorphAt(dom.childAt(fragment, [2]),1,1);
          dom.insertBoundary(fragment, 0);
          set(env, context, "group", blockArguments[0]);
          block(env, morph0, context, "if", [get(env, context, "group.header")], {}, child0, null);
          block(env, morph1, context, "each", [get(env, context, "group.items")], {}, child1, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, element = hooks.element, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element9 = dom.childAt(fragment, [2]);
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(element9,1,1);
        var morph2 = dom.createMorphAt(element9,2,2);
        var morph3 = dom.createMorphAt(element9,3,3);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "view", ["select"], {"class": "native-select form-control", "classNameBindings": "nativeMobile:visible-xs-inline:hidden", "content": get(env, context, "content"), "selection": get(env, context, "selection"), "value": get(env, context, "value"), "title": get(env, context, "title"), "prompt": get(env, context, "prompt"), "multiple": get(env, context, "multiple"), "disabled": get(env, context, "disabled"), "optionGroupPath": get(env, context, "optionGroupPath"), "optionLabelPath": get(env, context, "optionLabelPath"), "optionValuePath": get(env, context, "optionValuePath")});
        element(env, element9, context, "bind-attr", [], {"class": ":bs-select nativeMobile:hidden-xs disabled:disabled"});
        block(env, morph1, context, "if", [get(env, context, "liveSearch")], {}, child0, null);
        block(env, morph2, context, "if", [get(env, context, "multiple")], {}, child1, null);
        block(env, morph3, context, "each", [get(env, context, "groupedContentList")], {}, child2, null);
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/components/select-picker', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          inline(env, morph0, context, "input", [], {"type": "text", "class": "search-filter form-control", "value": get(env, context, "searchFilter"), "action": "preventClosing", "on": "focus"});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","btn-group select-all-none btn-block");
            dom.setAttribute(el1,"role","group");
            dom.setAttribute(el1,"aria-label","Select all or none");
            var el2 = dom.createTextNode("\n            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("button");
            dom.setAttribute(el2,"type","button");
            dom.setAttribute(el2,"class","btn btn-default btn-xs");
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("button");
            dom.setAttribute(el2,"type","button");
            dom.setAttribute(el2,"class","btn btn-default btn-xs");
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, element = hooks.element, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element5 = dom.childAt(fragment, [1]);
            var element6 = dom.childAt(element5, [1]);
            var element7 = dom.childAt(element5, [3]);
            var morph0 = dom.createMorphAt(element6,0,0);
            var morph1 = dom.createMorphAt(element7,0,0);
            element(env, element6, context, "action", ["selectAllNone", "unselectedContentList"], {});
            content(env, morph0, context, "selectAllLabel");
            element(env, element7, context, "action", ["selectAllNone", "selectedContentList"], {});
            content(env, morph1, context, "selectNoneLabel");
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("button");
            dom.setAttribute(el1,"type","button");
            dom.setAttribute(el1,"class","btn btn-default btn-xs btn-block");
            var el2 = dom.createTextNode("\n            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("span");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, element = hooks.element, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element3 = dom.childAt(fragment, [1]);
            var element4 = dom.childAt(element3, [3]);
            var morph0 = dom.createMorphAt(element3,1,1);
            element(env, element3, context, "action", ["toggleSelectAllNone"], {});
            content(env, morph0, context, "selectAllNoneLabel");
            element(env, element4, context, "bind-attr", [], {"class": ":check-mark :glyphicon glyphiconClass"});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          block(env, morph0, context, "if", [get(env, context, "splitAllNoneButtons")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            revision: "Ember@1.11.1",
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createElement("li");
              dom.setAttribute(el1,"class","divider");
              dom.setAttribute(el1,"role","presentation");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            dom.setAttribute(el1,"class","dropdown-header");
            dom.setAttribute(el1,"role","presentation");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, block = hooks.block, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
            var morph1 = dom.createMorphAt(dom.childAt(fragment, [3]),0,0);
            block(env, morph0, context, "unless", [get(env, context, "item.first")], {}, child0, null);
            content(env, morph1, context, "item.group");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"role","presentation");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.setAttribute(el2,"role","menuitem");
          dom.setAttribute(el2,"tabindex","-1");
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("span");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, get = hooks.get, block = hooks.block, element = hooks.element, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [2]);
          var element1 = dom.childAt(element0, [1]);
          var element2 = dom.childAt(element1, [3]);
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          var morph1 = dom.createMorphAt(element1,1,1);
          dom.insertBoundary(fragment, 0);
          set(env, context, "item", blockArguments[0]);
          block(env, morph0, context, "if", [get(env, context, "item.group")], {}, child0, null);
          element(env, element0, context, "bind-attr", [], {"class": "item.active:active item.selected:selected"});
          element(env, element1, context, "action", ["selectItem", get(env, context, "item")], {});
          content(env, morph1, context, "item.label");
          element(env, element2, context, "bind-attr", [], {"class": ":glyphicon :glyphicon-ok :check-mark item.selected::hidden"});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2,"type","button");
        dom.setAttribute(el2,"aria-expanded","true");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3,"class","pull-left");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        dom.setAttribute(el2,"class","dropdown-menu");
        dom.setAttribute(el2,"role","menu");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, element = hooks.element, content = hooks.content, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element8 = dom.childAt(fragment, [2]);
        var element9 = dom.childAt(element8, [1]);
        var element10 = dom.childAt(element9, [1]);
        var element11 = dom.childAt(element10, [3]);
        var element12 = dom.childAt(element8, [3]);
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(element10,1,1);
        var morph2 = dom.createMorphAt(element11,0,0);
        var morph3 = dom.createMorphAt(element12,1,1);
        var morph4 = dom.createMorphAt(element12,2,2);
        var morph5 = dom.createMorphAt(element12,3,3);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "view", ["select"], {"class": "native-select form-control", "classNameBindings": "nativeMobile:visible-xs-inline:hidden", "content": get(env, context, "content"), "selection": get(env, context, "selection"), "value": get(env, context, "value"), "title": get(env, context, "title"), "prompt": get(env, context, "prompt"), "multiple": get(env, context, "multiple"), "disabled": get(env, context, "disabled"), "optionGroupPath": get(env, context, "optionGroupPath"), "optionLabelPath": get(env, context, "optionLabelPath"), "optionValuePath": get(env, context, "optionValuePath")});
        element(env, element8, context, "bind-attr", [], {"class": ":bs-select :dropdown nativeMobile:hidden-xs disabled:disabled showDropdown:open"});
        element(env, element9, context, "bind-attr", [], {"class": ":btn :dropdown-toggle buttonClass"});
        element(env, element9, context, "bind-attr", [], {"id": get(env, context, "menuButtonId")});
        element(env, element9, context, "bind-attr", [], {"disabled": get(env, context, "disabled")});
        element(env, element9, context, "action", ["showHide"], {});
        content(env, morph1, context, "selectionSummary");
        element(env, element11, context, "bind-attr", [], {"class": "selectionBadge:badge:caret"});
        content(env, morph2, context, "selectionBadge");
        element(env, element12, context, "bind-attr", [], {"aria-labelledby": get(env, context, "menuButtonId")});
        block(env, morph3, context, "if", [get(env, context, "liveSearch")], {}, child0, null);
        block(env, morph4, context, "if", [get(env, context, "multiple")], {}, child1, null);
        block(env, morph5, context, "each", [get(env, context, "groupedContentList")], {}, child2, null);
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/dashboard', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("			");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("p");
            var el2 = dom.createTextNode("\n			");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("strong");
            var el3 = dom.createTextNode("Printing time left:");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode(" ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n			");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),3,3);
            inline(env, morph0, context, "seconds-to-time", [get(env, context, "model.timeleft")], {});
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("			");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("p");
            var el2 = dom.createTextNode("\n			");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("strong");
            var el3 = dom.createTextNode("Printing stuck - check the printer !");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n			");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("		");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("\n		");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("strong");
          var el3 = dom.createTextNode("Model:");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(" ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n		");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n		");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("\n		");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("strong");
          var el3 = dom.createTextNode("Progress:");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(" ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n		");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, inline = hooks.inline, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),3,3);
          var morph1 = dom.createMorphAt(dom.childAt(fragment, [3]),3,3);
          var morph2 = dom.createMorphAt(fragment,5,5,contextualElement);
          dom.insertBoundary(fragment, null);
          content(env, morph0, context, "model.name");
          inline(env, morph1, context, "round-percents", [get(env, context, "model.completed")], {});
          block(env, morph2, context, "if", [get(env, context, "mode.timeleft")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","col-lg-4");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","well");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode("\n		");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("strong");
        var el5 = dom.createTextNode("System status:");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode(" \n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createElement("button");
        dom.setAttribute(el4,"class","btn btn-primary");
        var el5 = dom.createTextNode("Update status");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, element = hooks.element, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [2, 1]);
        var element1 = dom.childAt(element0, [5, 0]);
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(dom.childAt(element0, [3]),0,0);
        var morph2 = dom.createMorphAt(element0,7,7);
        dom.insertBoundary(fragment, 0);
        content(env, morph0, context, "outlet");
        content(env, morph1, context, "model.description");
        element(env, element1, context, "action", ["updateStatus"], {});
        block(env, morph2, context, "if", [get(env, context, "model.name")], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        content(env, morph0, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/models/create', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("Cancel");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("		");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","well");
          var el2 = dom.createTextNode("\n			");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","form-group");
          var el3 = dom.createTextNode("\n				");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("label");
          var el4 = dom.createTextNode("Name:");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n				");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n			");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n			");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","form-group");
          var el3 = dom.createTextNode("\n				");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("label");
          var el4 = dom.createTextNode("Visibility:");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n				");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode(" Visible\n				");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode(" Hidden\n			");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n			");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","form-group");
          var el3 = dom.createTextNode("\n				");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("label");
          var el4 = dom.createTextNode("Price:");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n				");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n			");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n\n			");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","form-group");
          var el3 = dom.createTextNode("\n				");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("label");
          var el4 = dom.createTextNode("Image url:");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n				");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("	\n			");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n			");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","form-group");
          dom.setAttribute(el2,"class","text-center");
          var el3 = dom.createTextNode("\n				");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("img");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("	\n			");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n			");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","form-group");
          var el3 = dom.createTextNode("\n				");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("label");
          dom.setAttribute(el3,"for","");
          var el4 = dom.createTextNode("Download link gcode:");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n				");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n			");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n			");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","form-group");
          var el3 = dom.createTextNode("\n				");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("label");
          dom.setAttribute(el3,"for","");
          var el4 = dom.createTextNode("Download link stl:");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n				");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n			");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n			");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","form-group");
          var el3 = dom.createTextNode("\n				");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("label");
          dom.setAttribute(el3,"for","");
          var el4 = dom.createTextNode("Printing time:");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n				");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n			");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n			");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","form-group");
          var el3 = dom.createTextNode("\n				");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("label");
          dom.setAttribute(el3,"for","");
          var el4 = dom.createTextNode("Filament length:");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n				");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n			");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n			");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","form-group");
          var el3 = dom.createTextNode("\n				");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("label");
          dom.setAttribute(el3,"for","");
          var el4 = dom.createTextNode("Filament volume:");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n				");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n			");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n			");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("p");
          var el3 = dom.createTextNode("\n				");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("button");
          dom.setAttribute(el3,"class","btn btn-success");
          var el4 = dom.createTextNode("Create");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n				");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n			");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n		");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline, concat = hooks.concat, attribute = hooks.attribute, element = hooks.element, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var element1 = dom.childAt(element0, [3]);
          var element2 = dom.childAt(element0, [9, 1]);
          var element3 = dom.childAt(element0, [21]);
          var element4 = dom.childAt(element3, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),3,3);
          var morph1 = dom.createMorphAt(element1,3,3);
          var morph2 = dom.createMorphAt(element1,5,5);
          var morph3 = dom.createMorphAt(dom.childAt(element0, [5]),3,3);
          var morph4 = dom.createMorphAt(dom.childAt(element0, [7]),3,3);
          var attrMorph0 = dom.createAttrMorph(element2, 'src');
          var morph5 = dom.createMorphAt(dom.childAt(element0, [11]),3,3);
          var morph6 = dom.createMorphAt(dom.childAt(element0, [13]),3,3);
          var morph7 = dom.createMorphAt(dom.childAt(element0, [15]),3,3);
          var morph8 = dom.createMorphAt(dom.childAt(element0, [17]),3,3);
          var morph9 = dom.createMorphAt(dom.childAt(element0, [19]),3,3);
          var morph10 = dom.createMorphAt(element3,3,3);
          inline(env, morph0, context, "input", [], {"class": "form-control", "type": "text", "value": get(env, context, "model.name")});
          inline(env, morph1, context, "radio-button", [], {"value": 1, "groupValue": get(env, context, "model.visible")});
          inline(env, morph2, context, "radio-button", [], {"value": 0, "groupValue": get(env, context, "model.visible")});
          inline(env, morph3, context, "input", [], {"class": "form-control", "type": "text", "value": get(env, context, "model.price")});
          inline(env, morph4, context, "input", [], {"class": "form-control", "type": "text", "value": get(env, context, "model.image_url")});
          attribute(env, attrMorph0, element2, "src", concat(env, [get(env, context, "model.image_url")]));
          inline(env, morph5, context, "input", [], {"class": "form-control", "type": "text", "value": get(env, context, "model.download_link_gcode")});
          inline(env, morph6, context, "input", [], {"class": "form-control", "type": "text", "value": get(env, context, "model.download_link_stl")});
          inline(env, morph7, context, "input", [], {"class": "form-control", "type": "text", "value": get(env, context, "model.printing_time")});
          inline(env, morph8, context, "input", [], {"class": "form-control", "type": "text", "value": get(env, context, "model.filament_length")});
          inline(env, morph9, context, "input", [], {"class": "form-control", "type": "text", "value": get(env, context, "model.filament_volume")});
          element(env, element4, context, "action", ["create", get(env, context, "model")], {});
          block(env, morph10, context, "link-to", ["models.index"], {"class": "btn btn-default"}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","col-lg-10 col-lg-offset-1");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h1");
        dom.setAttribute(el2,"class","mb20");
        var el3 = dom.createTextNode("Model Create");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","m3d-upload btn btn-lg");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("i");
        dom.setAttribute(el3,"class","fa fa-cloud m3d_upload__icon");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        var el4 = dom.createTextNode("Upload Model");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, inline = hooks.inline, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element5 = dom.childAt(fragment, [0]);
        var morph0 = dom.createMorphAt(dom.childAt(element5, [3]),3,3);
        var morph1 = dom.createMorphAt(element5,5,5);
        inline(env, morph0, context, "file-upload", [], {"url": "/api/models/create", "modelUploaded": "modelUploaded"});
        block(env, morph1, context, "if", [get(env, context, "model")], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/models/edit', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","col-lg-10 col-lg-offset-1");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h1");
        dom.setAttribute(el2,"class","mb20");
        var el3 = dom.createTextNode("Model Edit");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","well");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","form-group");
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("label");
        var el5 = dom.createTextNode("Name:");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","form-group");
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("label");
        var el5 = dom.createTextNode("Visibility:");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode(" Visible\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode(" Hidden\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","form-group");
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("label");
        var el5 = dom.createTextNode("Price:");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","form-group");
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("label");
        var el5 = dom.createTextNode("Image url:");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("	\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","form-group");
        dom.setAttribute(el3,"class","text-center");
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("img");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("	\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","form-group mt20");
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("label");
        var el5 = dom.createTextNode("Created by:");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("button");
        dom.setAttribute(el4,"class","btn btn-success");
        var el5 = dom.createTextNode("Save");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("button");
        dom.setAttribute(el4,"class","btn btn-default");
        var el5 = dom.createTextNode("Cancel");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, concat = hooks.concat, attribute = hooks.attribute, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0, 3]);
        var element1 = dom.childAt(element0, [3]);
        var element2 = dom.childAt(element0, [9, 1]);
        var element3 = dom.childAt(element0, [13]);
        var element4 = dom.childAt(element3, [1]);
        var element5 = dom.childAt(element3, [3]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),3,3);
        var morph1 = dom.createMorphAt(element1,3,3);
        var morph2 = dom.createMorphAt(element1,5,5);
        var morph3 = dom.createMorphAt(dom.childAt(element0, [5]),3,3);
        var morph4 = dom.createMorphAt(dom.childAt(element0, [7]),3,3);
        var attrMorph0 = dom.createAttrMorph(element2, 'src');
        var morph5 = dom.createMorphAt(dom.childAt(element0, [11]),3,3);
        inline(env, morph0, context, "input", [], {"class": "form-control", "type": "text", "value": get(env, context, "model.name")});
        inline(env, morph1, context, "radio-button", [], {"value": 1, "groupValue": get(env, context, "model.visible")});
        inline(env, morph2, context, "radio-button", [], {"value": 0, "groupValue": get(env, context, "model.visible")});
        inline(env, morph3, context, "input", [], {"class": "form-control", "type": "text", "value": get(env, context, "model.price")});
        inline(env, morph4, context, "input", [], {"class": "form-control", "type": "text", "value": get(env, context, "model.image_url")});
        attribute(env, attrMorph0, element2, "src", concat(env, [get(env, context, "model.image_url")]));
        inline(env, morph5, context, "select-picker", [], {"content": get(env, context, "users"), "value": get(env, context, "model.created_by"), "optionValuePath": "content.id", "optionLabelPath": "content.first_name"});
        element(env, element4, context, "action", ["update", get(env, context, "model")], {});
        element(env, element5, context, "action", ["cancel", get(env, context, "model")], {});
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/models/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Create");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h1");
        dom.setAttribute(el1,"class","mb20 --inline");
        var el2 = dom.createTextNode("Models");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,2,2,contextualElement);
        var morph1 = dom.createMorphAt(fragment,4,4,contextualElement);
        dom.insertBoundary(fragment, null);
        block(env, morph0, context, "link-to", ["models.create"], {"class": "btn btn-success btn-md ml20 --text-align"}, child0, null);
        inline(env, morph1, context, "items-list", [], {"items": get(env, context, "model"), "properties": "id, name, visible", "showRoute": "models.show", "editRoute": "models.edit", "resource": "models", "delete": "delete", "edit": "edit", "restore": "restore"});
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/models/show', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h1");
        dom.setAttribute(el1,"class","mb20");
        var el2 = dom.createTextNode("Show Modelssss");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, null);
        inline(env, morph0, context, "item-show", [], {"model": get(env, context, "model")});
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/orders/create', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        content(env, morph0, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/orders/edit', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("						");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("strong");
            var el2 = dom.createTextNode("This model has been deleted!");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n						");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("button");
            dom.setAttribute(el1,"class","btn btn-success ml20");
            var el2 = dom.createTextNode("Restore");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, element = hooks.element;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element1 = dom.childAt(fragment, [3]);
            element(env, element1, context, "action", ["restore", get(env, context, "item")], {});
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("						");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("button");
            dom.setAttribute(el1,"class","btn btn-danger ml20");
            var el2 = dom.createTextNode("Remove from order");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, element = hooks.element;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1]);
            element(env, element0, context, "action", ["removeFromOrder", get(env, context, "item")], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("					");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("\n						");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(" - ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("€ - ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(" sec\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("					");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element2 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element2,1,1);
          var morph1 = dom.createMorphAt(element2,3,3);
          var morph2 = dom.createMorphAt(element2,5,5);
          var morph3 = dom.createMorphAt(element2,7,7);
          content(env, morph0, context, "item.name");
          content(env, morph1, context, "item.price");
          content(env, morph2, context, "item.printing_time");
          block(env, morph3, context, "if", [get(env, context, "item.deleted")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-lg-6 col-lg-offset-3");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h1");
        dom.setAttribute(el3,"class","mb20");
        var el4 = dom.createTextNode("Order Edit");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","well");
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Firstname:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Lastname:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Street:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Town:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Country:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Zipcode:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("strong");
        var el6 = dom.createTextNode("Models to print:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5,"class","btn btn-success");
        var el6 = dom.createTextNode("Save");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5,"class","btn btn-default");
        var el6 = dom.createTextNode("Cancel");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("	\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, block = hooks.block, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element3 = dom.childAt(fragment, [0, 1, 3]);
        var element4 = dom.childAt(element3, [17]);
        var element5 = dom.childAt(element4, [1]);
        var element6 = dom.childAt(element4, [3]);
        var morph0 = dom.createMorphAt(dom.childAt(element3, [1]),3,3);
        var morph1 = dom.createMorphAt(dom.childAt(element3, [3]),3,3);
        var morph2 = dom.createMorphAt(dom.childAt(element3, [5]),3,3);
        var morph3 = dom.createMorphAt(dom.childAt(element3, [7]),3,3);
        var morph4 = dom.createMorphAt(dom.childAt(element3, [9]),3,3);
        var morph5 = dom.createMorphAt(dom.childAt(element3, [11]),3,3);
        var morph6 = dom.createMorphAt(element3,15,15);
        inline(env, morph0, context, "input", [], {"type": "text", "value": get(env, context, "model.first_name"), "class": "form-control"});
        inline(env, morph1, context, "input", [], {"type": "text", "class": "form-control", "value": get(env, context, "model.last_name")});
        inline(env, morph2, context, "input", [], {"type": "text", "class": "form-control", "value": get(env, context, "model.street")});
        inline(env, morph3, context, "input", [], {"type": "text", "class": "form-control", "value": get(env, context, "model.town")});
        inline(env, morph4, context, "input", [], {"type": "text", "class": "form-control", "value": get(env, context, "model.country")});
        inline(env, morph5, context, "input", [], {"type": "text", "class": "form-control", "value": get(env, context, "model.zip_code")});
        block(env, morph6, context, "each", [get(env, context, "model.models")], {"keyword": "item"}, child0, null);
        element(env, element5, context, "action", ["update", get(env, context, "model")], {});
        element(env, element6, context, "action", ["cancel", get(env, context, "model")], {});
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/orders/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            revision: "Ember@1.11.1",
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("						");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("td");
              var el2 = dom.createElement("span");
              dom.setAttribute(el2,"class","label label-success");
              var el3 = dom.createTextNode("NEW");
              dom.appendChild(el2, el3);
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              return fragment;
            }
          };
        }());
        var child1 = (function() {
          var child0 = (function() {
            return {
              isHTMLBars: true,
              revision: "Ember@1.11.1",
              blockParams: 0,
              cachedFragment: null,
              hasRendered: false,
              build: function build(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createTextNode("							");
                dom.appendChild(el0, el1);
                var el1 = dom.createElement("td");
                var el2 = dom.createElement("span");
                dom.setAttribute(el2,"class","label label-primary");
                var el3 = dom.createTextNode("SHIPPED");
                dom.appendChild(el2, el3);
                dom.appendChild(el1, el2);
                dom.appendChild(el0, el1);
                var el1 = dom.createTextNode("\n");
                dom.appendChild(el0, el1);
                return el0;
              },
              render: function render(context, env, contextualElement) {
                var dom = env.dom;
                dom.detectNamespace(contextualElement);
                var fragment;
                if (env.useFragmentCache && dom.canClone) {
                  if (this.cachedFragment === null) {
                    fragment = this.build(dom);
                    if (this.hasRendered) {
                      this.cachedFragment = fragment;
                    } else {
                      this.hasRendered = true;
                    }
                  }
                  if (this.cachedFragment) {
                    fragment = dom.cloneNode(this.cachedFragment, true);
                  }
                } else {
                  fragment = this.build(dom);
                }
                return fragment;
              }
            };
          }());
          var child1 = (function() {
            var child0 = (function() {
              return {
                isHTMLBars: true,
                revision: "Ember@1.11.1",
                blockParams: 0,
                cachedFragment: null,
                hasRendered: false,
                build: function build(dom) {
                  var el0 = dom.createDocumentFragment();
                  var el1 = dom.createTextNode("								");
                  dom.appendChild(el0, el1);
                  var el1 = dom.createElement("td");
                  var el2 = dom.createTextNode("PRINTED");
                  dom.appendChild(el1, el2);
                  dom.appendChild(el0, el1);
                  var el1 = dom.createTextNode("\n");
                  dom.appendChild(el0, el1);
                  return el0;
                },
                render: function render(context, env, contextualElement) {
                  var dom = env.dom;
                  dom.detectNamespace(contextualElement);
                  var fragment;
                  if (env.useFragmentCache && dom.canClone) {
                    if (this.cachedFragment === null) {
                      fragment = this.build(dom);
                      if (this.hasRendered) {
                        this.cachedFragment = fragment;
                      } else {
                        this.hasRendered = true;
                      }
                    }
                    if (this.cachedFragment) {
                      fragment = dom.cloneNode(this.cachedFragment, true);
                    }
                  } else {
                    fragment = this.build(dom);
                  }
                  return fragment;
                }
              };
            }());
            var child1 = (function() {
              return {
                isHTMLBars: true,
                revision: "Ember@1.11.1",
                blockParams: 0,
                cachedFragment: null,
                hasRendered: false,
                build: function build(dom) {
                  var el0 = dom.createDocumentFragment();
                  var el1 = dom.createTextNode("								");
                  dom.appendChild(el0, el1);
                  var el1 = dom.createElement("td");
                  var el2 = dom.createElement("span");
                  dom.setAttribute(el2,"class","label label-warning");
                  var el3 = dom.createTextNode("PENDING");
                  dom.appendChild(el2, el3);
                  dom.appendChild(el1, el2);
                  dom.appendChild(el0, el1);
                  var el1 = dom.createTextNode("\n");
                  dom.appendChild(el0, el1);
                  return el0;
                },
                render: function render(context, env, contextualElement) {
                  var dom = env.dom;
                  dom.detectNamespace(contextualElement);
                  var fragment;
                  if (env.useFragmentCache && dom.canClone) {
                    if (this.cachedFragment === null) {
                      fragment = this.build(dom);
                      if (this.hasRendered) {
                        this.cachedFragment = fragment;
                      } else {
                        this.hasRendered = true;
                      }
                    }
                    if (this.cachedFragment) {
                      fragment = dom.cloneNode(this.cachedFragment, true);
                    }
                  } else {
                    fragment = this.build(dom);
                  }
                  return fragment;
                }
              };
            }());
            return {
              isHTMLBars: true,
              revision: "Ember@1.11.1",
              blockParams: 0,
              cachedFragment: null,
              hasRendered: false,
              build: function build(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createComment("");
                dom.appendChild(el0, el1);
                return el0;
              },
              render: function render(context, env, contextualElement) {
                var dom = env.dom;
                var hooks = env.hooks, get = hooks.get, block = hooks.block;
                dom.detectNamespace(contextualElement);
                var fragment;
                if (env.useFragmentCache && dom.canClone) {
                  if (this.cachedFragment === null) {
                    fragment = this.build(dom);
                    if (this.hasRendered) {
                      this.cachedFragment = fragment;
                    } else {
                      this.hasRendered = true;
                    }
                  }
                  if (this.cachedFragment) {
                    fragment = dom.cloneNode(this.cachedFragment, true);
                  }
                } else {
                  fragment = this.build(dom);
                }
                var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
                dom.insertBoundary(fragment, null);
                dom.insertBoundary(fragment, 0);
                block(env, morph0, context, "if", [get(env, context, "order.was_printed")], {}, child0, child1);
                return fragment;
              }
            };
          }());
          return {
            isHTMLBars: true,
            revision: "Ember@1.11.1",
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, get = hooks.get, block = hooks.block;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
              dom.insertBoundary(fragment, null);
              dom.insertBoundary(fragment, 0);
              block(env, morph0, context, "if", [get(env, context, "order.was_shipped")], {}, child0, child1);
              return fragment;
            }
          };
        }());
        var child2 = (function() {
          return {
            isHTMLBars: true,
            revision: "Ember@1.11.1",
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("Edit");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("					");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("td");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n					");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("td");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n					");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("td");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode(" €");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n					");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("td");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n					");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("td");
            var el2 = dom.createElement("button");
            dom.setAttribute(el2,"class","btn btn-danger");
            var el3 = dom.createTextNode("Delete");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, block = hooks.block, content = hooks.content, element = hooks.element;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [10, 0]);
            var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
            var morph1 = dom.createMorphAt(dom.childAt(fragment, [2]),0,0);
            var morph2 = dom.createMorphAt(dom.childAt(fragment, [4]),0,0);
            var morph3 = dom.createMorphAt(dom.childAt(fragment, [6]),0,0);
            var morph4 = dom.createMorphAt(dom.childAt(fragment, [8]),0,0);
            dom.insertBoundary(fragment, 0);
            block(env, morph0, context, "unless", [get(env, context, "order.was_opened")], {}, child0, child1);
            content(env, morph1, context, "order.full_name");
            content(env, morph2, context, "order.address");
            content(env, morph3, context, "order.price");
            block(env, morph4, context, "link-to", ["orders.edit", get(env, context, "order")], {"class": "btn btn-primary"}, child2, null);
            element(env, element0, context, "action", ["delete", get(env, context, "order")], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "link-to", ["orders.manage", get(env, context, "order")], {"tagName": "tr"}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h1");
        var el2 = dom.createTextNode("Orders");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","well mt20");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("table");
        dom.setAttribute(el2,"class","table");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("thead");
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("tr");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("th");
        var el6 = dom.createTextNode("Status");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("th");
        var el6 = dom.createTextNode("From");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("th");
        var el6 = dom.createTextNode("Address");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("th");
        var el6 = dom.createTextNode("Price");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("th");
        var el6 = dom.createTextNode("Edit");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tbody");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [2, 1, 3]),1,1);
        block(env, morph0, context, "each", [get(env, context, "model")], {"keyword": "order"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/orders/manage', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("			");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","label label-success");
          var el2 = dom.createTextNode("NEW");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("				");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("span");
            dom.setAttribute(el1,"class","label label-primary");
            var el2 = dom.createTextNode("SHIPPED");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            revision: "Ember@1.11.1",
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("					PRINTED\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              return fragment;
            }
          };
        }());
        var child1 = (function() {
          return {
            isHTMLBars: true,
            revision: "Ember@1.11.1",
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("					");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("span");
              dom.setAttribute(el1,"class","label label-warning");
              var el2 = dom.createTextNode("PENDING");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n					");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("button");
              dom.setAttribute(el1,"class","btn btn-primary");
              var el2 = dom.createTextNode("Shipped");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, element = hooks.element;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var element2 = dom.childAt(fragment, [3]);
              element(env, element2, context, "action", ["shipped"], {});
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, null);
            dom.insertBoundary(fragment, 0);
            block(env, morph0, context, "if", [get(env, context, "model.was_printed")], {}, child0, child1);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "if", [get(env, context, "model.was_shipped")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("				");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("strong");
            var el2 = dom.createTextNode("This model has been deleted!");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("				");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("button");
            dom.setAttribute(el1,"class","btn btn-success");
            var el2 = dom.createTextNode("Print");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, element = hooks.element;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1]);
            element(env, element0, context, "action", ["print", get(env, context, "item")], {});
            element(env, element0, context, "bind-attr", [], {"disabled": "printerUnpluged"});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("			");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("\n				");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(" - ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("€ - ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(" sec\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("			");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element1 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element1,1,1);
          var morph1 = dom.createMorphAt(element1,3,3);
          var morph2 = dom.createMorphAt(element1,5,5);
          var morph3 = dom.createMorphAt(element1,7,7);
          content(env, morph0, context, "item.name");
          content(env, morph1, context, "item.price");
          content(env, morph2, context, "item.printing_time");
          block(env, morph3, context, "if", [get(env, context, "item.deleted")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h1");
        dom.setAttribute(el1,"class","mb20");
        var el2 = dom.createTextNode("Manage Order: #");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","well");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("strong");
        var el4 = dom.createTextNode("Status: ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createElement("strong");
        var el4 = dom.createTextNode("Fullname:");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode(" ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createElement("strong");
        var el4 = dom.createTextNode("Address:");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode(" ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createElement("strong");
        var el4 = dom.createTextNode("Order price:");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode(" ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode(" €");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createElement("strong");
        var el4 = dom.createTextNode("Models to print:");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element3 = dom.childAt(fragment, [2]);
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),1,1);
        var morph1 = dom.createMorphAt(dom.childAt(element3, [1]),3,3);
        var morph2 = dom.createMorphAt(dom.childAt(element3, [3]),2,2);
        var morph3 = dom.createMorphAt(dom.childAt(element3, [5]),2,2);
        var morph4 = dom.createMorphAt(dom.childAt(element3, [7]),2,2);
        var morph5 = dom.createMorphAt(element3,11,11);
        content(env, morph0, context, "model.id");
        block(env, morph1, context, "unless", [get(env, context, "model.was_opened")], {}, child0, child1);
        content(env, morph2, context, "model.full_name");
        content(env, morph3, context, "model.address");
        content(env, morph4, context, "model.price");
        block(env, morph5, context, "each", [get(env, context, "model.models")], {"keyword": "item"}, child2, null);
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/orders/show', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        content(env, morph0, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/partials/header', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("img");
          dom.setAttribute(el1,"src","http://makeit3d.dev/images/logo_sm.png");
          dom.setAttribute(el1,"alt","");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("img");
          dom.setAttribute(el1,"src","http://makeit3d.dev/images/logo2_sm.png");
          dom.setAttribute(el1,"alt","");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("Logout");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("Models");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child2 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("Categories");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child3 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("Orders");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child4 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("Users");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("              ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n              ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n              ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n              ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n              ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
          var morph1 = dom.createMorphAt(dom.childAt(fragment, [3]),0,0);
          var morph2 = dom.createMorphAt(dom.childAt(fragment, [5]),0,0);
          var morph3 = dom.createMorphAt(dom.childAt(fragment, [7]),0,0);
          var morph4 = dom.createMorphAt(dom.childAt(fragment, [9]),0,0);
          block(env, morph0, context, "link-to", ["sessions.logout"], {}, child0, null);
          block(env, morph1, context, "link-to", ["models"], {}, child1, null);
          block(env, morph2, context, "link-to", ["categories"], {}, child2, null);
          block(env, morph3, context, "link-to", ["orders"], {}, child3, null);
          block(env, morph4, context, "link-to", ["users"], {}, child4, null);
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("Login");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("              ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
          block(env, morph0, context, "link-to", ["sessions.login"], {}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("nav");
        dom.setAttribute(el1,"role","navigation");
        dom.setAttribute(el1,"class","navbar navbar-default");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","container");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","row");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","col-lg-12");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","navbar-header");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("button");
        dom.setAttribute(el6,"type","button");
        dom.setAttribute(el6,"data-toggle","collapse");
        dom.setAttribute(el6,"data-target",".navbar-ex1-collapse");
        dom.setAttribute(el6,"class","navbar-toggle collapsed");
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("span");
        dom.setAttribute(el7,"class","sr-only");
        var el8 = dom.createTextNode("Toggle navigation");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("span");
        dom.setAttribute(el7,"class","icon-bar");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("span");
        dom.setAttribute(el7,"class","icon-bar");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("span");
        dom.setAttribute(el7,"class","icon-bar");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","collapse navbar-collapse navbar-ex1-collapse navbar-right");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("ul");
        dom.setAttribute(el6,"class","nav navbar-nav");
        var el7 = dom.createTextNode(" \n");
        dom.appendChild(el6, el7);
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, get = hooks.get;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0, 1, 1, 1]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),3,3);
        var morph1 = dom.createMorphAt(dom.childAt(element0, [3, 1]),1,1);
        block(env, morph0, context, "link-to", ["/"], {"classNames": "navbar-brand"}, child0, null);
        block(env, morph1, context, "if", [get(env, context, "isAuthenticated")], {}, child1, child2);
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/sessions/login', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row mt20");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h1");
        dom.setAttribute(el2,"class","text-center +txtshadow");
        var el3 = dom.createTextNode("Login");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row mt40");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-lg-6 col-lg-offset-3");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-lg-6 col-lg-offset-3");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row mt20");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-lg-6 col-lg-offset-3");
        var el3 = dom.createTextNode("\n    \n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"class","btn btn-default btn-lg pull-right +bxshadow");
        var el4 = dom.createTextNode("Login");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("a");
        dom.setAttribute(el3,"href","forgotpassword.html");
        dom.setAttribute(el3,"class","pull-left");
        var el4 = dom.createTextNode("Forgot password?");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [6, 1, 1]);
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [2, 1]),1,1);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [4, 1]),1,1);
        inline(env, morph0, context, "input", [], {"type": "text", "autocomplete": "off", "placeholder": "Email", "classNames": "m3d-searchbar__input --lowercase", "value": get(env, context, "username")});
        inline(env, morph1, context, "input", [], {"type": "password", "autocomplete": "off", "placeholder": "Password", "classNames": "m3d-searchbar__input --lowercase", "value": get(env, context, "password")});
        element(env, element0, context, "action", ["login"], {});
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/sessions/logout', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        content(env, morph0, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/users/create', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        content(env, morph0, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/users/edit', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-lg-6 col-lg-offset-3");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h1");
        dom.setAttribute(el3,"class","mb20");
        var el4 = dom.createTextNode("User Edit");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","well");
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Email:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Firstname:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Lastname:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Street:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Town:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Country:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Zipcode:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Confirmed:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode(" Verified\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode(" Unverified\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5,"class","btn btn-success");
        var el6 = dom.createTextNode("Save");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5,"class","btn btn-default");
        var el6 = dom.createTextNode("Cancel");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("		\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0, 1, 3]);
        var element1 = dom.childAt(element0, [15]);
        var element2 = dom.childAt(element0, [17]);
        var element3 = dom.childAt(element2, [1]);
        var element4 = dom.childAt(element2, [3]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),3,3);
        var morph1 = dom.createMorphAt(dom.childAt(element0, [3]),3,3);
        var morph2 = dom.createMorphAt(dom.childAt(element0, [5]),3,3);
        var morph3 = dom.createMorphAt(dom.childAt(element0, [7]),3,3);
        var morph4 = dom.createMorphAt(dom.childAt(element0, [9]),3,3);
        var morph5 = dom.createMorphAt(dom.childAt(element0, [11]),3,3);
        var morph6 = dom.createMorphAt(dom.childAt(element0, [13]),3,3);
        var morph7 = dom.createMorphAt(element1,3,3);
        var morph8 = dom.createMorphAt(element1,5,5);
        inline(env, morph0, context, "input", [], {"class": "form-control", "type": "text", "value": get(env, context, "model.username")});
        inline(env, morph1, context, "input", [], {"class": "form-control", "type": "text", "value": get(env, context, "model.first_name")});
        inline(env, morph2, context, "input", [], {"class": "form-control", "type": "text", "value": get(env, context, "model.last_name")});
        inline(env, morph3, context, "input", [], {"class": "form-control", "type": "text", "value": get(env, context, "model.street")});
        inline(env, morph4, context, "input", [], {"class": "form-control", "type": "text", "value": get(env, context, "model.town")});
        inline(env, morph5, context, "input", [], {"class": "form-control", "type": "text", "value": get(env, context, "model.country")});
        inline(env, morph6, context, "input", [], {"class": "form-control", "type": "text", "value": get(env, context, "model.zip_code")});
        inline(env, morph7, context, "radio-button", [], {"value": 1, "groupValue": get(env, context, "model.confirmed")});
        inline(env, morph8, context, "radio-button", [], {"value": 0, "groupValue": get(env, context, "model.confirmed")});
        element(env, element3, context, "action", ["update", get(env, context, "model")], {});
        element(env, element4, context, "action", ["cancel"], {});
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/users/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h1");
        dom.setAttribute(el1,"class","mb20");
        var el2 = dom.createTextNode("Users");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,2,2,contextualElement);
        inline(env, morph0, context, "items-list", [], {"items": get(env, context, "model"), "properties": "id,email, first_name, last_name", "showRoute": "users.show", "editRoute": "users.edit", "resource": "users", "delete": "delete", "edit": "edit"});
        return fragment;
      }
    };
  }()));

});
define('admin-app/templates/users/show', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h1");
        dom.setAttribute(el1,"class","mb20");
        var el2 = dom.createTextNode("Show Users");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, null);
        inline(env, morph0, context, "item-show", [], {"model": get(env, context, "model")});
        return fragment;
      }
    };
  }()));

});
define('admin-app/tests/adapters/application.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/application.js should pass jshint', function() { 
    ok(true, 'adapters/application.js should pass jshint.'); 
  });

});
define('admin-app/tests/app.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('app.js should pass jshint', function() { 
    ok(true, 'app.js should pass jshint.'); 
  });

});
define('admin-app/tests/components/file-upload.jshint', function () {

  'use strict';

  module('JSHint - components');
  test('components/file-upload.js should pass jshint', function() { 
    ok(true, 'components/file-upload.js should pass jshint.'); 
  });

});
define('admin-app/tests/components/item-show.jshint', function () {

  'use strict';

  module('JSHint - components');
  test('components/item-show.js should pass jshint', function() { 
    ok(true, 'components/item-show.js should pass jshint.'); 
  });

});
define('admin-app/tests/components/items-list.jshint', function () {

  'use strict';

  module('JSHint - components');
  test('components/items-list.js should pass jshint', function() { 
    ok(true, 'components/items-list.js should pass jshint.'); 
  });

});
define('admin-app/tests/controllers/application.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/application.js should pass jshint', function() { 
    ok(true, 'controllers/application.js should pass jshint.'); 
  });

});
define('admin-app/tests/controllers/categories/edit.jshint', function () {

  'use strict';

  module('JSHint - controllers/categories');
  test('controllers/categories/edit.js should pass jshint', function() { 
    ok(true, 'controllers/categories/edit.js should pass jshint.'); 
  });

});
define('admin-app/tests/controllers/models/edit.jshint', function () {

  'use strict';

  module('JSHint - controllers/models');
  test('controllers/models/edit.js should pass jshint', function() { 
    ok(true, 'controllers/models/edit.js should pass jshint.'); 
  });

});
define('admin-app/tests/controllers/models/index.jshint', function () {

  'use strict';

  module('JSHint - controllers/models');
  test('controllers/models/index.js should pass jshint', function() { 
    ok(true, 'controllers/models/index.js should pass jshint.'); 
  });

});
define('admin-app/tests/controllers/orders/manage.jshint', function () {

  'use strict';

  module('JSHint - controllers/orders');
  test('controllers/orders/manage.js should pass jshint', function() { 
    ok(true, 'controllers/orders/manage.js should pass jshint.'); 
  });

});
define('admin-app/tests/controllers/sessions.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/sessions.js should pass jshint', function() { 
    ok(true, 'controllers/sessions.js should pass jshint.'); 
  });

});
define('admin-app/tests/controllers/sessions/login.jshint', function () {

  'use strict';

  module('JSHint - controllers/sessions');
  test('controllers/sessions/login.js should pass jshint', function() { 
    ok(true, 'controllers/sessions/login.js should pass jshint.'); 
  });

});
define('admin-app/tests/helpers/ajax.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/ajax.js should pass jshint', function() { 
    ok(true, 'helpers/ajax.js should pass jshint.'); 
  });

});
define('admin-app/tests/helpers/custom-log.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/custom-log.js should pass jshint', function() { 
    ok(true, 'helpers/custom-log.js should pass jshint.'); 
  });

});
define('admin-app/tests/helpers/object-to-row.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/object-to-row.js should pass jshint', function() { 
    ok(true, 'helpers/object-to-row.js should pass jshint.'); 
  });

});
define('admin-app/tests/helpers/resolver', ['exports', 'ember/resolver', 'admin-app/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('admin-app/tests/helpers/resolver.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/resolver.js should pass jshint', function() { 
    ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('admin-app/tests/helpers/round-percents.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/round-percents.js should pass jshint', function() { 
    ok(true, 'helpers/round-percents.js should pass jshint.'); 
  });

});
define('admin-app/tests/helpers/seconds-to-time.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/seconds-to-time.js should pass jshint', function() { 
    ok(true, 'helpers/seconds-to-time.js should pass jshint.'); 
  });

});
define('admin-app/tests/helpers/start-app', ['exports', 'ember', 'admin-app/app', 'admin-app/router', 'admin-app/config/environment'], function (exports, Ember, Application, Router, config) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
define('admin-app/tests/helpers/start-app.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/start-app.js should pass jshint', function() { 
    ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('admin-app/tests/helpers/utils.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/utils.js should pass jshint', function() { 
    ok(true, 'helpers/utils.js should pass jshint.'); 
  });

});
define('admin-app/tests/initializers/ajax.jshint', function () {

  'use strict';

  module('JSHint - initializers');
  test('initializers/ajax.js should pass jshint', function() { 
    ok(true, 'initializers/ajax.js should pass jshint.'); 
  });

});
define('admin-app/tests/initializers/custom-htmlbars-helpers.jshint', function () {

  'use strict';

  module('JSHint - initializers');
  test('initializers/custom-htmlbars-helpers.js should pass jshint', function() { 
    ok(true, 'initializers/custom-htmlbars-helpers.js should pass jshint.'); 
  });

});
define('admin-app/tests/lib/helpers/each-property.jshint', function () {

  'use strict';

  module('JSHint - lib/helpers');
  test('lib/helpers/each-property.js should pass jshint', function() { 
    ok(true, 'lib/helpers/each-property.js should pass jshint.'); 
  });

});
define('admin-app/tests/lib/routes/authenticated.jshint', function () {

  'use strict';

  module('JSHint - lib/routes');
  test('lib/routes/authenticated.js should pass jshint', function() { 
    ok(true, 'lib/routes/authenticated.js should pass jshint.'); 
  });

});
define('admin-app/tests/lib/routes/crudcreate.jshint', function () {

  'use strict';

  module('JSHint - lib/routes');
  test('lib/routes/crudcreate.js should pass jshint', function() { 
    ok(true, 'lib/routes/crudcreate.js should pass jshint.'); 
  });

});
define('admin-app/tests/lib/routes/crudedit.jshint', function () {

  'use strict';

  module('JSHint - lib/routes');
  test('lib/routes/crudedit.js should pass jshint', function() { 
    ok(true, 'lib/routes/crudedit.js should pass jshint.'); 
  });

});
define('admin-app/tests/lib/routes/crudindex.jshint', function () {

  'use strict';

  module('JSHint - lib/routes');
  test('lib/routes/crudindex.js should pass jshint', function() { 
    ok(true, 'lib/routes/crudindex.js should pass jshint.'); 
  });

});
define('admin-app/tests/lib/routes/unauthenticated.jshint', function () {

  'use strict';

  module('JSHint - lib/routes');
  test('lib/routes/unauthenticated.js should pass jshint', function() { 
    ok(true, 'lib/routes/unauthenticated.js should pass jshint.'); 
  });

});
define('admin-app/tests/lib/utils/register-helper.jshint', function () {

  'use strict';

  module('JSHint - lib/utils');
  test('lib/utils/register-helper.js should pass jshint', function() { 
    ok(true, 'lib/utils/register-helper.js should pass jshint.'); 
  });

});
define('admin-app/tests/models/category.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/category.js should pass jshint', function() { 
    ok(true, 'models/category.js should pass jshint.'); 
  });

});
define('admin-app/tests/models/model.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/model.js should pass jshint', function() { 
    ok(true, 'models/model.js should pass jshint.'); 
  });

});
define('admin-app/tests/models/order.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/order.js should pass jshint', function() { 
    ok(true, 'models/order.js should pass jshint.'); 
  });

});
define('admin-app/tests/models/user.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/user.js should pass jshint', function() { 
    ok(true, 'models/user.js should pass jshint.'); 
  });

});
define('admin-app/tests/router.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('router.js should pass jshint', function() { 
    ok(true, 'router.js should pass jshint.'); 
  });

});
define('admin-app/tests/routes/categories/create.jshint', function () {

  'use strict';

  module('JSHint - routes/categories');
  test('routes/categories/create.js should pass jshint', function() { 
    ok(true, 'routes/categories/create.js should pass jshint.'); 
  });

});
define('admin-app/tests/routes/categories/edit.jshint', function () {

  'use strict';

  module('JSHint - routes/categories');
  test('routes/categories/edit.js should pass jshint', function() { 
    ok(true, 'routes/categories/edit.js should pass jshint.'); 
  });

});
define('admin-app/tests/routes/categories/index.jshint', function () {

  'use strict';

  module('JSHint - routes/categories');
  test('routes/categories/index.js should pass jshint', function() { 
    ok(true, 'routes/categories/index.js should pass jshint.'); 
  });

});
define('admin-app/tests/routes/categories/show.jshint', function () {

  'use strict';

  module('JSHint - routes/categories');
  test('routes/categories/show.js should pass jshint', function() { 
    ok(true, 'routes/categories/show.js should pass jshint.'); 
  });

});
define('admin-app/tests/routes/dashboard.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/dashboard.js should pass jshint', function() { 
    ok(true, 'routes/dashboard.js should pass jshint.'); 
  });

});
define('admin-app/tests/routes/index.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/index.js should pass jshint', function() { 
    ok(true, 'routes/index.js should pass jshint.'); 
  });

});
define('admin-app/tests/routes/models/create.jshint', function () {

  'use strict';

  module('JSHint - routes/models');
  test('routes/models/create.js should pass jshint', function() { 
    ok(true, 'routes/models/create.js should pass jshint.'); 
  });

});
define('admin-app/tests/routes/models/edit.jshint', function () {

  'use strict';

  module('JSHint - routes/models');
  test('routes/models/edit.js should pass jshint', function() { 
    ok(true, 'routes/models/edit.js should pass jshint.'); 
  });

});
define('admin-app/tests/routes/models/index.jshint', function () {

  'use strict';

  module('JSHint - routes/models');
  test('routes/models/index.js should pass jshint', function() { 
    ok(true, 'routes/models/index.js should pass jshint.'); 
  });

});
define('admin-app/tests/routes/models/show.jshint', function () {

  'use strict';

  module('JSHint - routes/models');
  test('routes/models/show.js should pass jshint', function() { 
    ok(true, 'routes/models/show.js should pass jshint.'); 
  });

});
define('admin-app/tests/routes/orders/create.jshint', function () {

  'use strict';

  module('JSHint - routes/orders');
  test('routes/orders/create.js should pass jshint', function() { 
    ok(true, 'routes/orders/create.js should pass jshint.'); 
  });

});
define('admin-app/tests/routes/orders/edit.jshint', function () {

  'use strict';

  module('JSHint - routes/orders');
  test('routes/orders/edit.js should pass jshint', function() { 
    ok(true, 'routes/orders/edit.js should pass jshint.'); 
  });

});
define('admin-app/tests/routes/orders/index.jshint', function () {

  'use strict';

  module('JSHint - routes/orders');
  test('routes/orders/index.js should pass jshint', function() { 
    ok(true, 'routes/orders/index.js should pass jshint.'); 
  });

});
define('admin-app/tests/routes/orders/manage.jshint', function () {

  'use strict';

  module('JSHint - routes/orders');
  test('routes/orders/manage.js should pass jshint', function() { 
    ok(true, 'routes/orders/manage.js should pass jshint.'); 
  });

});
define('admin-app/tests/routes/orders/show.jshint', function () {

  'use strict';

  module('JSHint - routes/orders');
  test('routes/orders/show.js should pass jshint', function() { 
    ok(true, 'routes/orders/show.js should pass jshint.'); 
  });

});
define('admin-app/tests/routes/sessions/login.jshint', function () {

  'use strict';

  module('JSHint - routes/sessions');
  test('routes/sessions/login.js should pass jshint', function() { 
    ok(true, 'routes/sessions/login.js should pass jshint.'); 
  });

});
define('admin-app/tests/routes/sessions/logout.jshint', function () {

  'use strict';

  module('JSHint - routes/sessions');
  test('routes/sessions/logout.js should pass jshint', function() { 
    ok(true, 'routes/sessions/logout.js should pass jshint.'); 
  });

});
define('admin-app/tests/routes/users/create.jshint', function () {

  'use strict';

  module('JSHint - routes/users');
  test('routes/users/create.js should pass jshint', function() { 
    ok(true, 'routes/users/create.js should pass jshint.'); 
  });

});
define('admin-app/tests/routes/users/edit.jshint', function () {

  'use strict';

  module('JSHint - routes/users');
  test('routes/users/edit.js should pass jshint', function() { 
    ok(true, 'routes/users/edit.js should pass jshint.'); 
  });

});
define('admin-app/tests/routes/users/index.jshint', function () {

  'use strict';

  module('JSHint - routes/users');
  test('routes/users/index.js should pass jshint', function() { 
    ok(true, 'routes/users/index.js should pass jshint.'); 
  });

});
define('admin-app/tests/routes/users/show.jshint', function () {

  'use strict';

  module('JSHint - routes/users');
  test('routes/users/show.js should pass jshint', function() { 
    ok(true, 'routes/users/show.js should pass jshint.'); 
  });

});
define('admin-app/tests/test-helper', ['admin-app/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('admin-app/tests/test-helper.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('test-helper.js should pass jshint', function() { 
    ok(true, 'test-helper.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/adapters/api-key-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('adapter:api-key', 'ApiKeyAdapter', {});

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var adapter = this.subject();
    assert.ok(adapter);
  });

  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']

});
define('admin-app/tests/unit/adapters/api-key-test.jshint', function () {

  'use strict';

  module('JSHint - unit/adapters');
  test('unit/adapters/api-key-test.js should pass jshint', function() { 
    ok(true, 'unit/adapters/api-key-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/adapters/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('adapter:application', 'ApplicationAdapter', {});

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var adapter = this.subject();
    assert.ok(adapter);
  });

  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']

});
define('admin-app/tests/unit/adapters/application-test.jshint', function () {

  'use strict';

  module('JSHint - unit/adapters');
  test('unit/adapters/application-test.js should pass jshint', function() { 
    ok(true, 'unit/adapters/application-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/components/file-upload-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForComponent('file-upload', 'Unit | Component | file upload', {
    // Specify the other units that are required for this test
    // needs: ['component:foo', 'helper:bar'],
    unit: true
  });

  ember_qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Creates the component instance
    var component = this.subject();
    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    this.render();
    assert.equal(component._state, 'inDOM');
  });

});
define('admin-app/tests/unit/components/file-upload-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components');
  test('unit/components/file-upload-test.js should pass jshint', function() { 
    ok(true, 'unit/components/file-upload-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/components/item-show-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForComponent('item-show', {});

  ember_qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Creates the component instance
    var component = this.subject();
    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    this.render();
    assert.equal(component._state, 'inDOM');
  });

  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']

});
define('admin-app/tests/unit/components/item-show-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components');
  test('unit/components/item-show-test.js should pass jshint', function() { 
    ok(true, 'unit/components/item-show-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/components/items-list-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForComponent('items-list', {});

  ember_qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Creates the component instance
    var component = this.subject();
    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    this.render();
    assert.equal(component._state, 'inDOM');
  });

  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']

});
define('admin-app/tests/unit/components/items-list-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components');
  test('unit/components/items-list-test.js should pass jshint', function() { 
    ok(true, 'unit/components/items-list-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/controllers/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:application', {});

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/controllers/application-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/application-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/application-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/controllers/categories/edit-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:categories/edit', {});

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/controllers/categories/edit-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/categories');
  test('unit/controllers/categories/edit-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/categories/edit-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/controllers/login-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:login', {});

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/controllers/login-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/login-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/login-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/controllers/models/edit-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:models/edit', {});

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/controllers/models/edit-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/models');
  test('unit/controllers/models/edit-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/models/edit-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/controllers/models/index-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:models/index', {});

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/controllers/models/index-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/models');
  test('unit/controllers/models/index-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/models/index-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/controllers/orders/manage-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:orders/manage', {});

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/controllers/orders/manage-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/orders');
  test('unit/controllers/orders/manage-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/orders/manage-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/controllers/sessions-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:sessions', {});

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/controllers/sessions-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/sessions-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/sessions-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/controllers/sessions/login-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:sessions/login', {});

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/controllers/sessions/login-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/sessions');
  test('unit/controllers/sessions/login-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/sessions/login-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/helpers/each-property-test', ['admin-app/helpers/each-property', 'qunit'], function (each_property, qunit) {

  'use strict';

  qunit.module('EachPropertyHelper');

  // Replace this with your real tests.
  qunit.test('it works', function (assert) {
    var result = each_property.eachProperty(42);
    assert.ok(result);
  });

});
define('admin-app/tests/unit/helpers/each-property-test.jshint', function () {

  'use strict';

  module('JSHint - unit/helpers');
  test('unit/helpers/each-property-test.js should pass jshint', function() { 
    ok(true, 'unit/helpers/each-property-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/helpers/log-test', ['admin-app/helpers/log', 'qunit'], function (log, qunit) {

  'use strict';

  qunit.module('LogHelper');

  // Replace this with your real tests.
  qunit.test('it works', function (assert) {
    var result = log.log(42);
    assert.ok(result);
  });

});
define('admin-app/tests/unit/helpers/log-test.jshint', function () {

  'use strict';

  module('JSHint - unit/helpers');
  test('unit/helpers/log-test.js should pass jshint', function() { 
    ok(true, 'unit/helpers/log-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/helpers/object-to-row-test', ['admin-app/helpers/object-to-row', 'qunit'], function (object_to_row, qunit) {

  'use strict';

  qunit.module('ObjectToRowHelper');

  // Replace this with your real tests.
  qunit.test('it works', function (assert) {
    var result = object_to_row.objectToRow(42);
    assert.ok(result);
  });

});
define('admin-app/tests/unit/helpers/object-to-row-test.jshint', function () {

  'use strict';

  module('JSHint - unit/helpers');
  test('unit/helpers/object-to-row-test.js should pass jshint', function() { 
    ok(true, 'unit/helpers/object-to-row-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/initializers/custom-htmlbars-helpers-test', ['ember', 'admin-app/initializers/custom-htmlbars-helpers', 'qunit'], function (Ember, custom_htmlbars_helpers, qunit) {

  'use strict';

  var container, application;

  qunit.module('CustomHtmlbarsHelpersInitializer', {
    beforeEach: function beforeEach() {
      Ember['default'].run(function () {
        application = Ember['default'].Application.create();
        container = application.__container__;
        application.deferReadiness();
      });
    }
  });

  // Replace this with your real tests.
  qunit.test('it works', function (assert) {
    custom_htmlbars_helpers.initialize(container, application);

    // you would normally confirm the results of the initializer here
    assert.ok(true);
  });

});
define('admin-app/tests/unit/initializers/custom-htmlbars-helpers-test.jshint', function () {

  'use strict';

  module('JSHint - unit/initializers');
  test('unit/initializers/custom-htmlbars-helpers-test.js should pass jshint', function() { 
    ok(true, 'unit/initializers/custom-htmlbars-helpers-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/initializers/initializer-ajax-test', ['ember', 'admin-app/initializers/initializer-ajax', 'qunit'], function (Ember, initializer_ajax, qunit) {

  'use strict';

  var container, application;

  qunit.module('InitializerAjaxInitializer', {
    beforeEach: function beforeEach() {
      Ember['default'].run(function () {
        application = Ember['default'].Application.create();
        container = application.__container__;
        application.deferReadiness();
      });
    }
  });

  // Replace this with your real tests.
  qunit.test('it works', function (assert) {
    initializer_ajax.initialize(container, application);

    // you would normally confirm the results of the initializer here
    assert.ok(true);
  });

});
define('admin-app/tests/unit/initializers/initializer-ajax-test.jshint', function () {

  'use strict';

  module('JSHint - unit/initializers');
  test('unit/initializers/initializer-ajax-test.js should pass jshint', function() { 
    ok(true, 'unit/initializers/initializer-ajax-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/initializers/initializer-routes-authenticated-test', ['ember', 'admin-app/initializers/initializer-routes-authenticated', 'qunit'], function (Ember, initializer_routes_authenticated, qunit) {

  'use strict';

  var container, application;

  qunit.module('InitializerRoutesAuthenticatedInitializer', {
    beforeEach: function beforeEach() {
      Ember['default'].run(function () {
        application = Ember['default'].Application.create();
        container = application.__container__;
        application.deferReadiness();
      });
    }
  });

  // Replace this with your real tests.
  qunit.test('it works', function (assert) {
    initializer_routes_authenticated.initialize(container, application);

    // you would normally confirm the results of the initializer here
    assert.ok(true);
  });

});
define('admin-app/tests/unit/initializers/initializer-routes-authenticated-test.jshint', function () {

  'use strict';

  module('JSHint - unit/initializers');
  test('unit/initializers/initializer-routes-authenticated-test.js should pass jshint', function() { 
    ok(true, 'unit/initializers/initializer-routes-authenticated-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/initializers/utils-test', ['ember', 'admin-app/initializers/utils', 'qunit'], function (Ember, utils, qunit) {

  'use strict';

  var container, application;

  qunit.module('UtilsInitializer', {
    beforeEach: function beforeEach() {
      Ember['default'].run(function () {
        application = Ember['default'].Application.create();
        container = application.__container__;
        application.deferReadiness();
      });
    }
  });

  // Replace this with your real tests.
  qunit.test('it works', function (assert) {
    utils.initialize(container, application);

    // you would normally confirm the results of the initializer here
    assert.ok(true);
  });

});
define('admin-app/tests/unit/initializers/utils-test.jshint', function () {

  'use strict';

  module('JSHint - unit/initializers');
  test('unit/initializers/utils-test.js should pass jshint', function() { 
    ok(true, 'unit/initializers/utils-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/models/api-key-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('api-key', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('admin-app/tests/unit/models/api-key-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/api-key-test.js should pass jshint', function() { 
    ok(true, 'unit/models/api-key-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/models/category-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('category', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('admin-app/tests/unit/models/category-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/category-test.js should pass jshint', function() { 
    ok(true, 'unit/models/category-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/models/model-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('model', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('admin-app/tests/unit/models/model-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/model-test.js should pass jshint', function() { 
    ok(true, 'unit/models/model-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/models/order-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('order', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('admin-app/tests/unit/models/order-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/order-test.js should pass jshint', function() { 
    ok(true, 'unit/models/order-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/models/printer-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('printer', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('admin-app/tests/unit/models/printer-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/printer-test.js should pass jshint', function() { 
    ok(true, 'unit/models/printer-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/models/user-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('user', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('admin-app/tests/unit/models/user-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/user-test.js should pass jshint', function() { 
    ok(true, 'unit/models/user-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/routes/categories-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:categories', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/routes/categories-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/categories-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/categories-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/routes/categories/create-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:categories/create', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/routes/categories/create-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/categories');
  test('unit/routes/categories/create-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/categories/create-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/routes/categories/edit-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:categories/edit', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/routes/categories/edit-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/categories');
  test('unit/routes/categories/edit-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/categories/edit-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/routes/categories/index-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:categories/index', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/routes/categories/index-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/categories');
  test('unit/routes/categories/index-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/categories/index-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/routes/categories/show-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:categories/show', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/routes/categories/show-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/categories');
  test('unit/routes/categories/show-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/categories/show-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/routes/dashboard-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:dashboard', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/routes/dashboard-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/dashboard-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/dashboard-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/routes/index-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:index', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/routes/index-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/index-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/index-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/routes/models-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:models', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/routes/models-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/models-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/models-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/routes/models/create-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:models/create', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/routes/models/create-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/models');
  test('unit/routes/models/create-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/models/create-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/routes/models/edit-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:models/edit', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/routes/models/edit-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/models');
  test('unit/routes/models/edit-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/models/edit-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/routes/models/show-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:models/show', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/routes/models/show-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/models');
  test('unit/routes/models/show-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/models/show-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/routes/orders-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:orders', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/routes/orders-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/orders-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/orders-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/routes/orders/create-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:orders/create', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/routes/orders/create-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/orders');
  test('unit/routes/orders/create-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/orders/create-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/routes/orders/edit-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:orders/edit', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/routes/orders/edit-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/orders');
  test('unit/routes/orders/edit-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/orders/edit-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/routes/orders/index-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:orders/index', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/routes/orders/index-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/orders');
  test('unit/routes/orders/index-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/orders/index-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/routes/orders/manage-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:orders/manage', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/routes/orders/manage-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/orders');
  test('unit/routes/orders/manage-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/orders/manage-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/routes/orders/show-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:orders/show', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/routes/orders/show-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/orders');
  test('unit/routes/orders/show-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/orders/show-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/routes/sessions/login-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:sessions/login', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/routes/sessions/login-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/sessions');
  test('unit/routes/sessions/login-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/sessions/login-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/routes/sessions/logout-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:sessions/logout', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/routes/sessions/logout-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/sessions');
  test('unit/routes/sessions/logout-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/sessions/logout-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/routes/users-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:users', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/routes/users-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/users-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/users-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/routes/users/create-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:users/create', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/routes/users/create-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/users');
  test('unit/routes/users/create-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/users/create-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/routes/users/edit-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:users/edit', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/routes/users/edit-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/users');
  test('unit/routes/users/edit-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/users/edit-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/routes/users/index-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:users/index', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/routes/users/index-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/users');
  test('unit/routes/users/index-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/users/index-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/routes/users/show-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:users/show', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('admin-app/tests/unit/routes/users/show-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/users');
  test('unit/routes/users/show-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/users/show-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/serializers/api-key-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('api-key', {
    // Specify the other units that are required for this test.
    needs: ['serializer:api-key']
  });

  // Replace this with your real tests.
  ember_qunit.test('it serializes records', function (assert) {
    var record = this.subject();

    var serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });

});
define('admin-app/tests/unit/serializers/api-key-test.jshint', function () {

  'use strict';

  module('JSHint - unit/serializers');
  test('unit/serializers/api-key-test.js should pass jshint', function() { 
    ok(true, 'unit/serializers/api-key-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/serializers/order-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('order', {
    // Specify the other units that are required for this test.
    needs: ['serializer:order']
  });

  // Replace this with your real tests.
  ember_qunit.test('it serializes records', function (assert) {
    var record = this.subject();

    var serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });

});
define('admin-app/tests/unit/serializers/order-test.jshint', function () {

  'use strict';

  module('JSHint - unit/serializers');
  test('unit/serializers/order-test.js should pass jshint', function() { 
    ok(true, 'unit/serializers/order-test.js should pass jshint.'); 
  });

});
define('admin-app/tests/unit/transforms/order-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('transform:order', {});

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var transform = this.subject();
    assert.ok(transform);
  });

  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']

});
define('admin-app/tests/unit/transforms/order-test.jshint', function () {

  'use strict';

  module('JSHint - unit/transforms');
  test('unit/transforms/order-test.js should pass jshint', function() { 
    ok(true, 'unit/transforms/order-test.js should pass jshint.'); 
  });

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('admin-app/config/environment', ['ember'], function(Ember) {
  var prefix = 'admin-app';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("admin-app/tests/test-helper");
} else {
  require("admin-app/app")["default"].create({"LOG_TRANSITIONS":true,"name":"admin-app","version":"0.0.0.6340a3c1"});
}

/* jshint ignore:end */
//# sourceMappingURL=admin-app.map