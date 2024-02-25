import assert from 'assert';

// Check optimized delta2 against a trivial computation.
export const checkDelta2 = ({
	nvertex,
	neighbend,
	label,
	endpoint,
	bestedge,
	slack,
	inblossom,
}) => {
	for (let v = 0; v < nvertex; ++v) {
		if (label[inblossom[v]] === 0) {
			let bd = null;
			let bk = -1;
			for (let i = 0; i < neighbend[v].length; ++i) {
				const p = neighbend[v][i];
				const k = Math.floor(p / 2);
				const w = endpoint[p];
				if (label[inblossom[w]] === 1) {
					const d = slack(k);
					if (bk === -1 || d < bd) {
						bk = k;
						bd = d;
					}
				}
			}

			if (
				(bestedge[v] !== -1 || bk !== -1) &&
				(bestedge[v] === -1 || bd !== slack(bestedge[v]))
			) {
				console.debug(
					'v=' +
						v +
						' bk=' +
						bk +
						' bd=' +
						bd +
						' bestedge=' +
						bestedge[v] +
						' slack=' +
						slack(bestedge[v]),
				);
			}

			assert(
				(bk === -1 && bestedge[v] === -1) ||
					(bestedge[v] !== -1 && bd === slack(bestedge[v])),
			);
		}
	}
};
