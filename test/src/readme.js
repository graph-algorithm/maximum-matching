import test from 'ava';

import maximumMatching, {iter} from '../../src';

test('README', (t) => {
	const edges = [
		[1, 2, 10],
		[2, 3, 11]
	];
	const matching = maximumMatching(edges); // [-1, -1, 3, 2]
	t.deepEqual([-1, -1, 3, 2], matching);
	t.deepEqual([[2, 3]], [...iter(matching)]);
});
