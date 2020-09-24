import blossomNoChecks from '../../core/blossomNoChecks';
import addDefaultWeight from '../../addDefaultWeight';

const general = (edges) => blossomNoChecks(addDefaultWeight(edges), true);

export default general;
