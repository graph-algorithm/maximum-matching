import assert from 'assert';

export const statistics = (edges) => {
	const nedge = edges.length;
	let nvertex = 0;
	let maxweight = 0;

	let length = nedge;
	while (length--) {
		const i = edges[length][0];
		const j = edges[length][1];
		const w = edges[length][2];

		assert(i >= 0 && j >= 0 && i !== j);
		if (i >= nvertex) nvertex = i + 1;
		if (j >= nvertex) nvertex = j + 1;

		maxweight = Math.max(maxweight, w);
	}

	return [nvertex, nedge, maxweight];
};
