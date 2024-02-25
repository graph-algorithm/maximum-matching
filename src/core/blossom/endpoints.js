export const endpoints = (nedge, edges) => {
	const endpoint = [];
	for (let p = 0; p < nedge; ++p) {
		endpoint.push(edges[p][0], edges[p][1]);
	}

	return endpoint;
};
