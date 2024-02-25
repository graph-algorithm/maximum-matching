import assert from 'assert';

import {min} from './min.js';

// Verify that the optimum solution has been reached.
export const verifyOptimum = ({
	nvertex,
	edges,
	maxCardinality,
	nedge,
	blossomparent,
	mate,
	endpoint,
	dualvar,
	blossombase,
	blossomendps,
}) => {
	let i;
	let j;
	let wt;
	let v;
	let b;
	let p;
	let k;
	let s;
	let iblossoms;
	let jblossoms;
	// Vertices may have negative dual when maxCardinality = true;
	// find a constant non-negative number to add to all vertex duals.
	const vdualoffset = maxCardinality
		? Math.max(0, -min(dualvar, 0, nvertex))
		: 0;
	// 0. all dual variables are non-negative
	assert(min(dualvar, 0, nvertex) + vdualoffset >= 0);
	assert(min(dualvar, nvertex, 2 * nvertex) >= 0);
	// 0. all edges have non-negative slack and
	// 1. all matched edges have zero slack;
	for (k = 0; k < nedge; ++k) {
		i = edges[k][0];
		j = edges[k][1];
		wt = edges[k][2];

		s = dualvar[i] + dualvar[j] - 2 * wt;
		iblossoms = [i];
		jblossoms = [j];
		while (blossomparent[iblossoms.at(-1)] !== -1)
			iblossoms.push(blossomparent[iblossoms.at(-1)]);
		while (blossomparent[jblossoms.at(-1)] !== -1)
			jblossoms.push(blossomparent[jblossoms.at(-1)]);
		iblossoms.reverse();
		jblossoms.reverse();
		const length = Math.min(iblossoms.length, jblossoms.length);
		for (let x = 0; x < length; ++x) {
			const bi = iblossoms[x];
			const bj = jblossoms[x];
			if (bi !== bj) break;
			s += 2 * dualvar[bi];
		}

		assert(s >= 0);
		if (Math.floor(mate[i] / 2) === k || Math.floor(mate[j] / 2) === k) {
			assert(Math.floor(mate[i] / 2) === k && Math.floor(mate[j] / 2) === k);
			assert(s === 0);
		}
	}

	// 2. all single vertices have zero dual value;
	for (v = 0; v < nvertex; ++v)
		assert(mate[v] >= 0 || dualvar[v] + vdualoffset === 0);
	// 3. all blossoms with positive dual value are full.
	for (b = nvertex; b < 2 * nvertex; ++b) {
		if (blossombase[b] >= 0 && dualvar[b] > 0) {
			assert(blossomendps[b].length % 2 === 1);
			for (i = 1; i < blossomendps[b].length; i += 2) {
				p = blossomendps[b][i];
				assert((mate[endpoint[p]] === p) ^ 1);
				assert(mate[endpoint[p ^ 1]] === p);
			}
		}
	}
	// Ok.
};
