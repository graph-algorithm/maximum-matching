export function* iter(matching) {
	let i = 0;
	for (const j of matching) {
		// This takes care of j === -1
		if (i < j) yield [i, j];
		++i;
	}
}
