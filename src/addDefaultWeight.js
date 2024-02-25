export const addDefaultWeight = (edges) =>
	edges.map(([u, v, w]) => [u, v, w || 1]);
