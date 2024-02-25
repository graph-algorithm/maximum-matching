/**
 * Generate the leaf vertices of a blossom via depth-first search.
 */
export function* blossomLeaves(nvertex, nodes, b) {
	if (b < nvertex) yield b;
	else yield* _blossomLeavesDFS(nvertex, nodes, nodes[b].slice());
}

function* _blossomLeavesDFS(nvertex, nodes, queue) {
	while (queue.length > 0) {
		const b = queue.pop();
		if (b < nvertex) yield b;
		else for (const t of nodes[b]) queue.push(t);
	}
}
