export const rotate = (a, n) => {
	const head = a.splice(0, n);
	for (let i = 0; i < n; ++i) {
		a.push(head[i]);
	}
};
