/**
 * Generate the leaf vertices of a blossom.
 */
const blossomLeaves = (nvertex, nodes, b, fn) => {
	if (b < nvertex) {
		if (fn(b)) return true;
	} else {
		const length_ = nodes[b].length;
		for (let i = 0; i < length_; ++i) {
			const t = nodes[b][i];
			if (t < nvertex) {
				if (fn(t)) return true;
			} else if (blossomLeaves(nvertex, nodes, t, fn)) return true;
		}
	}
};

export default blossomLeaves;
