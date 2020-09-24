/**
 * Generate the leaf vertices of a blossom.
 */
export default function* blossomLeaves(nvertex, nodes, b) {
	if (b < nvertex) yield b;
	else {
		for (const t of nodes[b]) {
			if (t < nvertex) yield t;
			else yield* blossomLeaves(nvertex, nodes, t);
		}
	}
}
