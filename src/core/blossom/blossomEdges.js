import blossomLeaves from './blossomLeaves.js';

export default function* blossomEdges(nvertex, blossomchilds, neighbend, bv) {
	for (const v of blossomLeaves(nvertex, blossomchilds, bv)) {
		for (const p of neighbend[v]) yield Math.floor(p / 2);
	}
}
