import assert from 'assert';

import blossomEdges from './blossomEdges.js';
import blossomLeaves from './blossomLeaves.js';
import checkDelta2 from './checkDelta2.js';
import checkDelta3 from './checkDelta3.js';
import endpoints from './endpoints.js';
import min from './min.js';
import neighbours from './neighbours.js';
import rotate from './rotate.js';
import statistics from './statistics.js';
import verifyOptimum from './verifyOptimum.js';

// Adapted from http://jorisvr.nl/maximummatching.html
// All credit for the implementation goes to Joris van Rantwijk [http://jorisvr.nl].

// ** Original introduction below **

// Weighted maximum matching in general graphs.

// The algorithm is taken from "Efficient Algorithms for Finding Maximum
// Matching in Graphs" by Zvi Galil, ACM Computing Surveys, 1986.
// It is based on the "blossom" method for finding augmenting paths and
// the "primal-dual" method for finding a matching of maximum weight, both
// due to Jack Edmonds.
// Some ideas came from "Implementation of algorithms for maximum matching
// on non-bipartite graphs" by H.J. Gabow, Standford Ph.D. thesis, 1973.

// A C program for maximum weight matching by Ed Rothberg was used extensively
// to validate this new code.

export default function blossom(CHECK_OPTIMUM, CHECK_DELTA) {
	// Check delta2/delta3 computation after every substage;
	// only works on integer weights, slows down the algorithm to O(n^4).
	if (CHECK_DELTA === undefined) CHECK_DELTA = false;

	// Check optimality of solution before returning; only works on integer weights.
	if (CHECK_OPTIMUM === undefined) CHECK_OPTIMUM = true;

	/**
	 * Compute a maximum-weighted matching in the general undirected
	 * weighted graph given by "edges". If "maxCardinality" is true,
	 * only maximum-cardinality matchings are considered as solutions.
	 *
	 * Edges is a sequence of tuples (i, j, wt) describing an undirected
	 * edge between vertex i and vertex j with weight wt.  There is at most
	 * one edge between any two vertices; no vertex has an edge to itthis.
	 * Vertices are identified by consecutive, non-negative integers.
	 *
	 * Return a list "mate", such that mate[i] === j if vertex i is
	 * matched to vertex j, and mate[i] === -1 if vertex i is not matched.
	 *
	 * This function takes time O(n^3)
	 *
	 * @param {Array} edges
	 * @param {Boolean} maxCardinality
	 * @return {Array}
	 */

	const maxWeightMatching = (edges, maxCardinality = false) => {
		// Vertices are numbered 0 .. (nvertex-1).
		// Non-trivial blossoms are numbered nvertex .. (2*nvertex-1)
		//
		// Edges are numbered 0 .. (nedge-1).
		// Edge endpoints are numbered 0 .. (2*nedge-1), such that endpoints
		// (2*k) and (2*k+1) both belong to edge k.
		//
		// Many terms used in the comments (sub-blossom, T-vertex) come from
		// the paper by Galil; read the paper before reading this code.

		// Deal swiftly with empty graphs.
		if (edges.length === 0) return [];

		// Count vertices + find the maximum edge weight.
		const [nvertex, nedge, maxweight] = statistics(edges);

		// If p is an edge endpoint,
		// endpoint[p] is the vertex to which endpoint p is attached.
		// Not modified by the algorithm.
		const endpoint = endpoints(nedge, edges);

		// If v is a vertex,
		// neighbend[v] is the list of remote endpoints of the edges attached to v.
		// Not modified by the algorithm.
		const neighbend = neighbours(nvertex, nedge, edges);

		// If v is a vertex,
		// mate[v] is the remote endpoint of its matched edge, or -1 if it is single
		// (i.e. endpoint[mate[v]] is v's partner vertex).
		// Initially all vertices are single; updated during augmentation.
		const mate = new Array(nvertex).fill(-1);

		// If b is a top-level blossom,
		// label[b] is 0 if b is unlabeled (free);
		//             1 if b is an S-vertex/blossom;
		//             2 if b is a T-vertex/blossom.
		// The label of a vertex is found by looking at the label of its
		// top-level containing blossom.
		// If v is a vertex inside a T-blossom,
		// label[v] is 2 iff v is reachable from an S-vertex outside the blossom.
		// Labels are assigned during a stage and reset after each augmentation.
		const label = new Array(2 * nvertex).fill(0);

		// If b is a labeled top-level blossom,
		// labelend[b] is the remote endpoint of the edge through which b obtained
		// its label, or -1 if b's base vertex is single.
		// If v is a vertex inside a T-blossom and label[v] === 2,
		// labelend[v] is the remote endpoint of the edge through which v is
		// reachable from outside the blossom.
		const labelend = new Array(2 * nvertex).fill(-1);

		// If v is a vertex,
		// inblossom[v] is the top-level blossom to which v belongs.
		// If v is a top-level vertex, v is itthis a blossom (a trivial blossom)
		// and inblossom[v] === v.
		// Initially all vertices are top-level trivial blossoms.
		const inblossom = new Array(nvertex);
		for (let i = 0; i < nvertex; ++i) inblossom[i] = i;

		// If b is a sub-blossom,
		// blossomparent[b] is its immediate parent (sub-)blossom.
		// If b is a top-level blossom, blossomparent[b] is -1.
		const blossomparent = new Array(2 * nvertex).fill(-1);

		// If b is a non-trivial (sub-)blossom,
		// blossomchilds[b] is an ordered list of its sub-blossoms, starting with
		// the base and going round the blossom.
		const blossomchilds = new Array(2 * nvertex).fill(null);

		// If b is a (sub-)blossom,
		// blossombase[b] is its base VERTEX (i.e. recursive sub-blossom).
		const blossombase = new Array(2 * nvertex);
		for (let i = 0; i < nvertex; ++i) blossombase[i] = i;
		blossombase.fill(-1, nvertex, 2 * nvertex);

		// If b is a non-trivial (sub-)blossom,
		// blossomendps[b] is a list of endpoints on its connecting edges,
		// such that blossomendps[b][i] is the local endpoint of blossomchilds[b][i]
		// on the edge that connects it to blossomchilds[b][wrap(i+1)].
		const blossomendps = new Array(2 * nvertex).fill(null);

		// If v is a free vertex (or an unreached vertex inside a T-blossom),
		// bestedge[v] is the edge to an S-vertex with least slack,
		// or -1 if there is no such edge.
		// If b is a (possibly trivial) top-level S-blossom,
		// bestedge[b] is the least-slack edge to a different S-blossom,
		// or -1 if there is no such edge.
		// This is used for efficient computation of delta2 and delta3.
		const bestedge = new Array(2 * nvertex).fill(-1);

		// If b is a non-trivial top-level S-blossom,
		// blossombestedges[b] is a list of least-slack edges to neighbouring
		// S-blossoms, or null if no such list has been computed yet.
		// This is used for efficient computation of delta3.
		const blossombestedges = new Array(2 * nvertex).fill(null);

		// List of currently unused blossom numbers.
		const unusedblossoms = new Array(nvertex);
		for (let i = 0; i < nvertex; ++i) unusedblossoms[i] = nvertex + i;

		// If v is a vertex,
		// dualvar[v] = 2 * u(v) where u(v) is the v's variable in the dual
		// optimization problem (multiplication by two ensures integer values
		// throughout the algorithm if all edge weights are integers).
		// If b is a non-trivial blossom,
		// dualvar[b] = z(b) where z(b) is b's variable in the dual optimization
		// problem.
		const dualvar = new Array(2 * nvertex);
		dualvar.fill(maxweight, 0, nvertex);
		dualvar.fill(0, nvertex, 2 * nvertex);

		// If allowedge[k] is true, edge k has zero slack in the optimization
		// problem; if allowedge[k] is false, the edge's slack may or may not
		// be zero.
		const allowedge = new Array(nedge).fill(false);

		// Queue of newly discovered S-vertices.
		let queue = [];

		// Return 2 * slack of edge k (does not work inside blossoms).
		const slack = (k) => {
			const [i, j, wt] = edges[k];
			return dualvar[i] + dualvar[j] - 2 * wt;
		};

		// Assign label t to the top-level blossom containing vertex w
		// and record the fact that w was reached through the edge with
		// remote endpoint p.
		const assignLabel = (w, t, p) => {
			console.debug('DEBUG: assignLabel(' + w + ',' + t + ',' + p + ')');
			const b = inblossom[w];
			assert(label[w] === 0 && label[b] === 0);
			assert(t === 1 || t === 2);
			label[w] = t;
			label[b] = t;
			labelend[w] = p;
			labelend[b] = p;
			bestedge[w] = -1;
			bestedge[b] = -1;
			if (t === 1) {
				// B became an S-vertex/blossom; add it(s vertices) to the queue.
				for (const v of blossomLeaves(nvertex, blossomchilds, b)) {
					queue.push(v);
				}

				console.debug('DEBUG: PUSH ' + queue);
			} else {
				// B became a T-vertex/blossom; assign label S to its mate.
				// (If b is a non-trivial blossom, its base is the only vertex
				// with an external mate.)
				const base = blossombase[b];
				assert(mate[base] >= 0);
				assignLabel(endpoint[mate[base]], 1, mate[base] ^ 1);
			}
		};

		// Trace back from vertices v and w to discover either a new blossom
		// or an augmenting path. Return the base vertex of the new blossom or -1.
		const scanBlossom = (v, w) => {
			console.debug('DEBUG: scanBlossom(' + v + ',' + w + ')');
			// Trace back from v and w, placing breadcrumbs as we go.
			const path = [];
			let base = -1;
			while (v !== -1 || w !== -1) {
				// Look for a breadcrumb in v's blossom or put a new breadcrumb.
				let b = inblossom[v];
				if (label[b] & 4) {
					base = blossombase[b];
					break;
				}

				assert(label[b] === 1);
				path.push(b);
				label[b] = 5;
				// Trace one step back.
				assert(labelend[b] === mate[blossombase[b]]);
				if (labelend[b] === -1) {
					// The base of blossom b is single; stop tracing this path.
					v = -1;
				} else {
					v = endpoint[labelend[b]];
					b = inblossom[v];
					assert(label[b] === 2);
					// B is a T-blossom; trace one more step back.
					assert(labelend[b] >= 0);
					v = endpoint[labelend[b]];
				}

				// Swap v and w so that we alternate between both paths.
				if (w !== -1) {
					const temporary_ = v;
					v = w;
					w = temporary_;
				}
			}

			// Remove breadcrumbs.
			for (const b of path) label[b] = 1;

			// Return base vertex, if we found one.
			return base;
		};

		// Construct a new blossom with given base, containing edge k which
		// connects a pair of S vertices. Label the new blossom as S; set its dual
		// variable to zero; relabel its T-vertices to S and add them to the queue.
		const addBlossom = (base, k) => {
			let v = edges[k][0];
			let w = edges[k][1];
			const bb = inblossom[base];
			let bv = inblossom[v];
			let bw = inblossom[w];
			// Create blossom.
			const b = unusedblossoms.pop();
			console.debug(
				'DEBUG: addBlossom(' +
					base +
					',' +
					k +
					') (v=' +
					v +
					' w=' +
					w +
					') -> ' +
					b,
			);
			blossombase[b] = base;
			blossomparent[b] = -1;
			blossomparent[bb] = b;
			// Make list of sub-blossoms and their interconnecting edge endpoints.
			const path = [];
			blossomchilds[b] = path;
			const endps = [];
			blossomendps[b] = endps;
			// Trace back from v to base.
			while (bv !== bb) {
				// Add bv to the new blossom.
				blossomparent[bv] = b;
				path.push(bv);
				endps.push(labelend[bv]);
				assert(
					label[bv] === 2 ||
						(label[bv] === 1 && labelend[bv] === mate[blossombase[bv]]),
				);
				// Trace one step back.
				assert(labelend[bv] >= 0);
				v = endpoint[labelend[bv]];
				bv = inblossom[v];
			}

			// Reverse lists, add endpoint that connects the pair of S vertices.
			path.push(bb);
			path.reverse();
			endps.reverse();
			endps.push(2 * k);
			// Trace back from w to base.
			while (bw !== bb) {
				// Add bw to the new blossom.
				blossomparent[bw] = b;
				path.push(bw);
				endps.push(labelend[bw] ^ 1);
				assert(
					label[bw] === 2 ||
						(label[bw] === 1 && labelend[bw] === mate[blossombase[bw]]),
				);
				// Trace one step back.
				assert(labelend[bw] >= 0);
				w = endpoint[labelend[bw]];
				bw = inblossom[w];
			}

			// Set label to S.
			assert(label[bb] === 1);
			label[b] = 1;
			labelend[b] = labelend[bb];
			// Set dual variable to zero.
			dualvar[b] = 0;
			// Relabel vertices.
			for (const v of blossomLeaves(nvertex, blossomchilds, b)) {
				if (label[inblossom[v]] === 2) {
					// This T-vertex now turns into an S-vertex because it becomes
					// part of an S-blossom; add it to the queue.
					queue.push(v);
				}

				inblossom[v] = b;
			}

			// Compute blossombestedges[b].

			const bestedgeto = new Array(2 * nvertex).fill(-1);

			const length_ = path.length;
			for (let z = 0; z < length_; ++z) {
				const bv = path[z];
				// Walk this subblossom's least-slack edges.
				let nblist = blossombestedges[bv];
				if (nblist === null) {
					// This subblossom does not have a list of least-slack edges;
					// get the information from the vertices.
					nblist = blossomEdges(nvertex, blossomchilds, neighbend, bv);
				}

				for (const k of nblist) {
					const [i, j] = edges[k];
					const bj = inblossom[j] === b ? inblossom[i] : inblossom[j];

					if (
						bj !== b &&
						label[bj] === 1 &&
						(bestedgeto[bj] === -1 || slack(k) < slack(bestedgeto[bj]))
					) {
						bestedgeto[bj] = k;
					}
				}

				// Forget about least-slack edges of the subblossom.
				blossombestedges[bv] = null;
				bestedge[bv] = -1;
			}

			blossombestedges[b] = [];
			const length_2 = bestedgeto.length;
			for (let i = 0; i < length_2; ++i) {
				k = bestedgeto[i];
				if (k !== -1) blossombestedges[b].push(k);
			}

			// Select bestedge[b].

			const length_3 = blossombestedges[b].length;
			if (length_3 > 0) {
				bestedge[b] = blossombestedges[b][0];
				for (let i = 1; i < length_3; ++i) {
					k = blossombestedges[b][i];
					if (slack(k) < slack(bestedge[b])) {
						bestedge[b] = k;
					}
				}
			} else bestedge[b] = -1;

			console.debug('DEBUG: blossomchilds[' + b + ']=' + blossomchilds[b]);
		};

		// Expand the given top-level blossom.
		const expandBlossom = (b, endstage) => {
			console.debug(
				'DEBUG: expandBlossom(' + b + ',' + endstage + ') ' + blossomchilds[b],
			);
			// Convert sub-blossoms into top-level blossoms.
			for (let i = 0; i < blossomchilds[b].length; ++i) {
				const s = blossomchilds[b][i];

				blossomparent[s] = -1;
				if (s < nvertex) inblossom[s] = s;
				else if (endstage && dualvar[s] === 0) {
					// Recursively expand this sub-blossom.
					expandBlossom(s, endstage);
				} else {
					for (const v of blossomLeaves(nvertex, blossomchilds, s)) {
						inblossom[v] = s;
					}
				}
			}

			// If we expand a T-blossom during a stage, its sub-blossoms must be
			// relabeled.
			if (!endstage && label[b] === 2) {
				// Start at the sub-blossom through which the expanding
				// blossom obtained its label, and relabel sub-blossoms untili
				// we reach the base.
				// Figure out through which sub-blossom the expanding blossom
				// obtained its label initially.
				assert(labelend[b] >= 0);
				const entrychild = inblossom[endpoint[labelend[b] ^ 1]];
				// Decide in which direction we will go round the blossom.
				let j = blossomchilds[b].indexOf(entrychild);
				let jstep;
				let endptrick;
				let stop;
				let base;
				if (j & 1) {
					// Start index is odd; go forward.
					jstep = 1;
					endptrick = 0;
					stop = blossomchilds[b].length;
					base = 0;
				} else {
					// Start index is even; go backward.
					jstep = -1;
					endptrick = 1;
					stop = 0;
					base = blossomchilds[b].length;
				}

				// Move along the blossom until we get to the base.
				let p = labelend[b];
				while (j !== stop) {
					// Relabel the T-sub-blossom.
					label[endpoint[p ^ 1]] = 0;
					label[endpoint[blossomendps[b][j - endptrick] ^ endptrick ^ 1]] = 0;
					assignLabel(endpoint[p ^ 1], 2, p);
					// Step to the next S-sub-blossom and note its forward endpoint.
					allowedge[Math.floor(blossomendps[b][j - endptrick] / 2)] = true;
					j += jstep;
					p = blossomendps[b][j - endptrick] ^ endptrick;
					// Step to the next T-sub-blossom.
					allowedge[Math.floor(p / 2)] = true;
					j += jstep;
				}

				// Relabel the base T-sub-blossom WITHOUT stepping through to
				// its mate (so don't call assignLabel).
				let bv = blossomchilds[b][0];
				label[endpoint[p ^ 1]] = 2;
				label[bv] = 2;
				labelend[endpoint[p ^ 1]] = p;
				labelend[bv] = p;
				bestedge[bv] = -1;
				// Continue along the blossom until we get back to entrychild.
				j = base + jstep;
				while (blossomchilds[b][j] !== entrychild) {
					// Examine the vertices of the sub-blossom to see whether
					// it is reachable from a neighbouring S-vertex outside the
					// expanding blossom.
					bv = blossomchilds[b][j];
					if (label[bv] === 1) {
						// This sub-blossom just got label S through one of its
						// neighbours; leave it.
						j += jstep;
						continue;
					}

					for (const v of blossomLeaves(nvertex, blossomchilds, bv)) {
						if (label[v] === 0) continue;
						// If the sub-blossom contains a reachable vertex, assign
						// label T to the sub-blossom.
						assert(label[v] === 2);
						assert(inblossom[v] === bv);
						label[v] = 0;
						label[endpoint[mate[blossombase[bv]]]] = 0;
						assignLabel(v, 2, labelend[v]);
						break;
					}

					j += jstep;
				}
			}

			// Recycle the blossom number.
			label[b] = -1;
			labelend[b] = -1;
			blossomchilds[b] = null;
			blossomendps[b] = null;
			blossombase[b] = -1;
			blossombestedges[b] = null;
			bestedge[b] = -1;
			unusedblossoms.push(b);
		};

		// Swap matched/unmatched edges over an alternating path through blossom b
		// between vertex v and the base vertex. Keep blossom bookkeeping consistent.
		const augmentBlossom = (b, v) => {
			console.debug('DEBUG: augmentBlossom(' + b + ',' + v + ')');
			// Bubble up through the blossom tree from vertex v to an immediate
			// sub-blossom of b.
			let j;
			let jstep;
			let endptrick;
			let stop;
			let p;
			let t = v;
			while (blossomparent[t] !== b) t = blossomparent[t];
			// Recursively deal with the first sub-blossom.
			if (t >= nvertex) augmentBlossom(t, v);
			// Decide in which direction we will go round the blossom.
			j = blossomchilds[b].indexOf(t);
			const i = j;
			const length_ = blossomchilds[b].length;
			if (i & 1) {
				// Start index is odd; go forward.
				jstep = 1;
				endptrick = 0;
				stop = length_;
			} else {
				// Start index is even; go backward.
				jstep = -1;
				endptrick = 1;
				stop = 0;
			}

			// Move along the blossom until we get to the base.
			while (j !== stop) {
				// Step to the next sub-blossom and augment it recursively.
				j += jstep;
				t = blossomchilds[b][j];
				p = blossomendps[b][j - endptrick] ^ endptrick;
				if (t >= nvertex) augmentBlossom(t, endpoint[p]);
				// Step to the next sub-blossom and augment it recursively.
				j += jstep;
				t = blossomchilds[b][Math.abs(j % length_)];
				if (t >= nvertex) augmentBlossom(t, endpoint[p ^ 1]);
				// Match the edge connecting those sub-blossoms.
				mate[endpoint[p]] = p ^ 1;
				mate[endpoint[p ^ 1]] = p;
				console.debug(
					'DEBUG: PAIR ' +
						endpoint[p] +
						' ' +
						endpoint[p ^ 1] +
						' (k=' +
						Math.floor(p / 2) +
						')',
				);
			}

			// Rotate the list of sub-blossoms to put the new base at the front.
			rotate(blossomchilds[b], i);
			rotate(blossomendps[b], i);
			blossombase[b] = blossombase[blossomchilds[b][0]];
			assert(blossombase[b] === v);
		};

		// Swap matched/unmatched edges over an alternating path between two
		// single vertices. The augmenting path runs through edge k, which
		// connects a pair of S vertices.
		const augmentMatching = (k) => {
			const v = edges[k][0];
			const w = edges[k][1];

			console.debug(
				'DEBUG: augmentMatching(' + k + ') (v=' + v + ' w=' + w + ')',
			);
			console.debug('DEBUG: PAIR ' + v + ' ' + w + ' (k=' + k + ')');

			matchVerticesAndFix(v, 2 * k + 1);
			matchVerticesAndFix(w, 2 * k);
		};

		const matchVerticesAndFix = (s, p) => {
			// Match vertex s to remote endpoint p. Then trace back from s
			// until we find a single vertex, swapping matched and unmatched
			// edges as we go.
			// eslint-disable-next-line no-constant-condition
			while (true) {
				const bs = inblossom[s];
				assert(label[bs] === 1);
				assert(labelend[bs] === mate[blossombase[bs]]);
				// Augment through the S-blossom from s to base.
				if (bs >= nvertex) augmentBlossom(bs, s);
				// Update mate[s]
				mate[s] = p;
				// Trace one step back.
				if (labelend[bs] === -1) {
					// Reached single vertex; stop.
					break;
				}

				const t = endpoint[labelend[bs]];
				const bt = inblossom[t];
				assert(label[bt] === 2);
				// Trace one step back.
				assert(labelend[bt] >= 0);
				s = endpoint[labelend[bt]];
				const j = endpoint[labelend[bt] ^ 1];
				// Augment through the T-blossom from j to base.
				assert(blossombase[bt] === t);
				if (bt >= nvertex) augmentBlossom(bt, j);
				// Update mate[j]
				mate[j] = labelend[bt];
				// Keep the opposite endpoint;
				// it will be assigned to mate[s] in the next step.
				p = labelend[bt] ^ 1;
				console.debug(
					'DEBUG: PAIR ' + s + ' ' + t + ' (k=' + Math.floor(p / 2) + ')',
				);
			}
		};

		let d;
		let kslack;
		let base;
		let deltatype;
		let delta;
		let deltaedge;
		let deltablossom;

		// Main loop: continue until no further improvement is possible.
		for (let t = 0; t < nvertex; ++t) {
			// Each iteration of this loop is a "stage".
			// A stage finds an augmenting path and uses that to improve
			// the matching.
			console.debug('DEBUG: STAGE ' + t);

			// Remove labels from top-level blossoms/vertices.
			label.fill(0);

			// Forget all about least-slack edges.
			bestedge.fill(-1);
			blossombestedges.fill(null, nvertex, 2 * nvertex);

			// Loss of labeling means that we can not be sure that currently
			// allowable edges remain allowable througout this stage.
			allowedge.fill(false);

			// Make queue empty.
			queue = [];

			// Label single blossoms/vertices with S and put them in the queue.
			for (let v = 0; v < nvertex; ++v) {
				if (mate[v] === -1 && label[inblossom[v]] === 0) assignLabel(v, 1, -1);
			}

			// Loop until we succeed in augmenting the matching.
			let augmented = false;
			// eslint-disable-next-line no-constant-condition
			while (true) {
				// Each iteration of this loop is a "substage".
				// A substage tries to find an augmenting path;
				// if found, the path is used to improve the matching and
				// the stage ends. If there is no augmenting path, the
				// primal-dual method is used to pump some slack out of
				// the dual variables.
				console.debug('DEBUG: SUBSTAGE');

				// Continue labeling until all vertices which are reachable
				// through an alternating path have got a label.
				while (queue.length > 0 && !augmented) {
					// Take an S vertex from the queue.
					const v = queue.pop();
					console.debug('DEBUG: POP v=' + v);
					assert(label[inblossom[v]] === 1);

					// Scan its neighbours:
					const length = neighbend[v].length;
					for (let i = 0; i < length; ++i) {
						const p = neighbend[v][i];
						const k = Math.floor(p / 2);
						const w = endpoint[p];
						// W is a neighbour to v
						if (inblossom[v] === inblossom[w]) {
							// This edge is internal to a blossom; ignore it
							continue;
						}

						if (!allowedge[k]) {
							kslack = slack(k);
							if (kslack <= 0) {
								// Edge k has zero slack => it is allowable
								allowedge[k] = true;
							}
						}

						if (allowedge[k]) {
							if (label[inblossom[w]] === 0) {
								// (C1) w is a free vertex;
								// label w with T and label its mate with S (R12).
								assignLabel(w, 2, p ^ 1);
							} else if (label[inblossom[w]] === 1) {
								// (C2) w is an S-vertex (not in the same blossom);
								// follow back-links to discover either an
								// augmenting path or a new blossom.
								base = scanBlossom(v, w);
								if (base >= 0) {
									// Found a new blossom; add it to the blossom
									// bookkeeping and turn it into an S-blossom.
									addBlossom(base, k);
								} else {
									// Found an augmenting path; augment the
									// matching and end this stage.
									augmentMatching(k);
									augmented = true;
									break;
								}
							} else if (label[w] === 0) {
								// W is inside a T-blossom, but w itthis has not
								// yet been reached from outside the blossom;
								// mark it as reached (we need this to relabel
								// during T-blossom expansion).
								assert(label[inblossom[w]] === 2);
								label[w] = 2;
								labelend[w] = p ^ 1;
							}
						} else if (label[inblossom[w]] === 1) {
							// Keep track of the least-slack non-allowable edge to
							// a different S-blossom.
							const b = inblossom[v];
							if (bestedge[b] === -1 || kslack < slack(bestedge[b]))
								bestedge[b] = k;
						} else if (
							label[w] === 0 && // W is a free vertex (or an unreached vertex inside
							// a T-blossom) but we can not reach it yet;
							// keep track of the least-slack edge that reaches w.
							(bestedge[w] === -1 || kslack < slack(bestedge[w]))
						)
							bestedge[w] = k;
					}
				}

				if (augmented) break;

				// There is no augmenting path under these constraints;
				// compute delta and reduce slack in the optimization problem.
				// (Note that our vertex dual variables, edge slacks and delta's
				// are pre-multiplied by two.)
				deltatype = -1;
				delta = null;
				deltaedge = null;
				deltablossom = null;

				// Verify data structures for delta2/delta3 computation.
				if (CHECK_DELTA) {
					checkDelta2({
						nvertex,
						neighbend,
						label,
						endpoint,
						bestedge,
						slack,
						inblossom,
					});
					checkDelta3({
						nvertex,
						edges,
						blossomparent,
						blossomchilds,
						neighbend,
						label,
						endpoint,
						bestedge,
						slack,
						inblossom,
					});
				}

				// Compute delta1: the minumum value of any vertex dual.
				if (!maxCardinality) {
					deltatype = 1;
					delta = min(dualvar, 0, nvertex);
				}

				// Compute delta2: the minimum slack on any edge between
				// an S-vertex and a free vertex.
				for (let v = 0; v < nvertex; ++v) {
					if (label[inblossom[v]] === 0 && bestedge[v] !== -1) {
						d = slack(bestedge[v]);
						if (deltatype === -1 || d < delta) {
							delta = d;
							deltatype = 2;
							deltaedge = bestedge[v];
						}
					}
				}

				// Compute delta3: half the minimum slack on any edge between
				// a pair of S-blossoms.
				for (let b = 0; b < 2 * nvertex; ++b) {
					if (blossomparent[b] === -1 && label[b] === 1 && bestedge[b] !== -1) {
						kslack = slack(bestedge[b]);
						d = kslack / 2;
						if (deltatype === -1 || d < delta) {
							delta = d;
							deltatype = 3;
							deltaedge = bestedge[b];
						}
					}
				}

				// Compute delta4: minimum z variable of any T-blossom.
				for (let b = nvertex; b < 2 * nvertex; ++b) {
					if (
						blossombase[b] >= 0 &&
						blossomparent[b] === -1 &&
						label[b] === 2 &&
						(deltatype === -1 || dualvar[b] < delta)
					) {
						delta = dualvar[b];
						deltatype = 4;
						deltablossom = b;
					}
				}

				if (deltatype === -1) {
					// No further improvement possible; max-cardinality optimum
					// reached. Do a final delta update to make the optimum
					// verifyable.
					assert(maxCardinality);
					deltatype = 1;
					delta = Math.max(0, min(dualvar, 0, nvertex));
				}

				// Update dual variables according to delta.
				for (let v = 0; v < nvertex; ++v) {
					if (label[inblossom[v]] === 1) {
						// S-vertex: 2*u = 2*u - 2*delta
						dualvar[v] -= delta;
					} else if (label[inblossom[v]] === 2) {
						// T-vertex: 2*u = 2*u + 2*delta
						dualvar[v] += delta;
					}
				}

				for (let b = nvertex; b < 2 * nvertex; ++b) {
					if (blossombase[b] >= 0 && blossomparent[b] === -1) {
						if (label[b] === 1) {
							// Top-level S-blossom: z = z + 2*delta
							dualvar[b] += delta;
						} else if (label[b] === 2) {
							// Top-level T-blossom: z = z - 2*delta
							dualvar[b] -= delta;
						}
					}
				}

				// Take action at the point where minimum delta occurred.
				console.debug('DEBUG: delta' + deltatype + '=' + delta);
				assert(
					deltatype === 1 ||
						deltatype === 2 ||
						deltatype === 3 ||
						deltatype === 4,
				);
				// eslint-disable-next-line unicorn/prefer-switch
				if (deltatype === 1) {
					// No further improvement possible; optimum reached.
					break;
				} else if (deltatype === 2) {
					// Use the least-slack edge to continue the search.
					allowedge[deltaedge] = true;
					let i = edges[deltaedge][0];
					if (label[inblossom[i]] === 0) i = edges[deltaedge][1];
					assert(label[inblossom[i]] === 1);
					queue.push(i);
				} else if (deltatype === 3) {
					// Use the least-slack edge to continue the search.
					allowedge[deltaedge] = true;
					const i = edges[deltaedge][0];
					assert(label[inblossom[i]] === 1);
					queue.push(i);
				} else {
					// Expand the least-z blossom.
					expandBlossom(deltablossom, false);
				}
			}

			// End of a this substage.

			// Stop when no more augmenting path can be found.
			if (!augmented) break;

			// End of a stage; expand all S-blossoms which have dualvar = 0.
			for (let b = nvertex; b < 2 * nvertex; ++b) {
				if (
					blossomparent[b] === -1 &&
					blossombase[b] >= 0 &&
					label[b] === 1 &&
					dualvar[b] === 0
				) {
					expandBlossom(b, true);
				}
			}
		}

		// Verify that we reached the optimum solution.
		if (CHECK_OPTIMUM)
			verifyOptimum({
				nvertex,
				edges,
				maxCardinality,
				nedge,
				blossomparent,
				mate,
				endpoint,
				dualvar,
				blossombase,
				blossomendps,
			});

		// Transform mate[] such that mate[v] is the vertex to which v is paired.
		for (let v = 0; v < nvertex; ++v) {
			if (mate[v] >= 0) {
				mate[v] = endpoint[mate[v]];
			}
		}

		for (let v = 0; v < nvertex; ++v) {
			assert(mate[v] === -1 || mate[mate[v]] === v);
		}

		return mate;
	};

	return maxWeightMatching;
}
