import {addDefaultWeight} from '../../addDefaultWeight.js';
import {blossomNoChecks} from '../../core/blossomNoChecks.js';

export const general = (edges) =>
	blossomNoChecks(addDefaultWeight(edges), true);
