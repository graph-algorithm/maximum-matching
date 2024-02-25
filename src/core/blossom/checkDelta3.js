import assert from 'assert';

import {blossomLeaves} from './blossomLeaves.js';

// Check optimized delta3 against a trivial computation.
export const checkDelta3 = ({
	nvertex,
	edges,
	blossomparent,
	blossomchilds,
	neighbend,
	label,
	endpoint,
	bestedge,
	slack,
	inblossom,
}) => {
	let bk = -1;
	let bd = null;
	let tbk = -1;
	let tbd = null;
	for (let b = 0; b < 2 * nvertex; ++b) {
		if (blossomparent[b] === -1 && label[b] === 1) {
			for (const v of blossomLeaves(nvertex, blossomchilds, b)) {
				for (const p of neighbend[v]) {
					const k = Math.floor(p / 2);
					const w = endpoint[p];
					if (inblossom[w] !== b && label[inblossom[w]] === 1) {
						const d = slack(k);
						if (bk === -1 || d < bd) {
							bk = k;
							bd = d;
						}
					}
				}
			}

			if (bestedge[b] !== -1) {
				const i = edges[bestedge[b]][0];
				const j = edges[bestedge[b]][1];

				assert(inblossom[i] === b || inblossom[j] === b);
				assert(inblossom[i] !== b || inblossom[j] !== b);
				assert(label[inblossom[i]] === 1 && label[inblossom[j]] === 1);
				if (tbk === -1 || slack(bestedge[b]) < tbd) {
					tbk = bestedge[b];
					tbd = slack(bestedge[b]);
				}
			}
		}
	}

	if (bd !== tbd)
		console.debug('bk=' + bk + ' tbk=' + tbk + ' bd=' + bd + ' tbd=' + tbd);
	assert(bd === tbd);
};
