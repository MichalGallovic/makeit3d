import { registerHelper } from '../lib/utils/register-helper';
import { eachPropertyHelper } from '../lib/helpers/each-property';



export function initialize(/* container, application */) {
	registerHelper('eachProperty', eachPropertyHelper);
}

export default {
  name: 'custom-htmlbars-helpers',
  initialize: initialize
};
