export const min = (a, i, j) => {
	let o = a[i];
	for (++i; i < j; ++i) if (a[i] < o) o = a[i];
	return o;
};
