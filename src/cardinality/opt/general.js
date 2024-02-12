import addDefaultWeight from '../../addDefaultWeight.js';
import blossomNoChecks from '../../core/blossomNoChecks.js';

const general = (edges) => blossomNoChecks(addDefaultWeight(edges), true);

export default general;
