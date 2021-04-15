import blossomNoChecks from '../../core/blossomNoChecks.js';
import addDefaultWeight from '../../addDefaultWeight.js';

const general = (edges) => blossomNoChecks(addDefaultWeight(edges), true);

export default general;
