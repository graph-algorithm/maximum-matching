export const neighbours = (nvertex, nedge, edges) => {
	const neighbend = [];

	for (let i = 0; i < nvertex; ++i) neighbend.push([]);

	for (let k = 0; k < nedge; ++k) {
		const i = edges[k][0];
		const j = edges[k][1];
		neighbend[i].push(2 * k + 1);
		neighbend[j].push(2 * k);
	}

	return neighbend;
};
