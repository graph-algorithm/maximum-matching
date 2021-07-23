import test from 'ava';
import {enumerate} from '@iterable-iterator/zip';

import maximumMatching from '../../src/index.js';
import blossom from '../../src/core/blossom/index.js';

const macro = (t, algorithm, edges, expected) => {
	const input = edges.map((edge) => edge.slice()); // Deepcopy
	const result = algorithm(edges);
	t.deepEqual(expected, result);
	t.deepEqual(input, edges);
};

macro.title = (title, algorithm, edges, expected) =>
	title ||
	`${algorithm.name}(${JSON.stringify(edges)}) = ${JSON.stringify(expected)}`;

const tests = {
	// Empty input graph
	test10_empty: {edges: [], expected: []},
	test11_singleedge:
		// Single edge
		{edges: [[0, 1, 1]], expected: [1, 0]},

	test12: {
		edges: [
			[1, 2, 10],
			[2, 3, 11],
		],
		expected: [-1, -1, 3, 2],
	},

	test13: {
		edges: [
			[1, 2, 5],
			[2, 3, 11],
			[3, 4, 5],
		],
		expected: [-1, -1, 3, 2, -1],
	},

	// Floating point weigths
	test15_float: {
		edges: [
			[1, 2, Math.PI],
			[2, 3, Math.E],
			[1, 3, 3],
			[1, 4, Math.sqrt(2)],
		],
		expected: [-1, 4, 3, 2, 1],
	},

	// Negative weights
	test16_negative: {
		edges: [
			[1, 2, 2],
			[1, 3, -2],
			[2, 3, 1],
			[2, 4, -1],
			[3, 4, -6],
		],
		expected: [-1, 2, 1, -1, -1],
	},

	// Create S-blossom and use it for augmentation
	test20_sblossom_1: {
		edges: [
			[1, 2, 8],
			[1, 3, 9],
			[2, 3, 10],
			[3, 4, 7],
		],
		expected: [-1, 2, 1, 4, 3],
	},
	test20_sblossom_2: {
		edges: [
			[1, 2, 8],
			[1, 3, 9],
			[2, 3, 10],
			[3, 4, 7],
			[1, 6, 5],
			[4, 5, 6],
		],
		expected: [-1, 6, 3, 2, 5, 4, 1],
	},

	// Create S-blossom, relabel as T-blossom, use for augmentation
	test21_tblossom_1: {
		edges: [
			[1, 2, 9],
			[1, 3, 8],
			[2, 3, 10],
			[1, 4, 5],
			[4, 5, 4],
			[1, 6, 3],
		],
		expected: [-1, 6, 3, 2, 5, 4, 1],
	},
	test21_tblossom_2: {
		edges: [
			[1, 2, 9],
			[1, 3, 8],
			[2, 3, 10],
			[1, 4, 5],
			[4, 5, 3],
			[1, 6, 4],
		],
		expected: [-1, 6, 3, 2, 5, 4, 1],
	},
	test21_tblossom_3: {
		edges: [
			[1, 2, 9],
			[1, 3, 8],
			[2, 3, 10],
			[1, 4, 5],
			[4, 5, 3],
			[3, 6, 4],
		],
		expected: [-1, 2, 1, 6, 5, 4, 3],
	},

	// Create nested S-blossom, use for augmentation
	test22_s_nest: {
		edges: [
			[1, 2, 9],
			[1, 3, 9],
			[2, 3, 10],
			[2, 4, 8],
			[3, 5, 8],
			[4, 5, 10],
			[5, 6, 6],
		],
		expected: [-1, 3, 4, 1, 2, 6, 5],
	},

	// Create S-blossom, relabel as S, include in nested S-blossom
	test23_s_relabel_nest: {
		edges: [
			[1, 2, 10],
			[1, 7, 10],
			[2, 3, 12],
			[3, 4, 20],
			[3, 5, 20],
			[4, 5, 25],
			[5, 6, 10],
			[6, 7, 10],
			[7, 8, 8],
		],
		expected: [-1, 2, 1, 4, 3, 6, 5, 8, 7],
	},

	// Create nested S-blossom, augment, expand recursively
	test24_s_nest_expand: {
		edges: [
			[1, 2, 8],
			[1, 3, 8],
			[2, 3, 10],
			[2, 4, 12],
			[3, 5, 12],
			[4, 5, 14],
			[4, 6, 12],
			[5, 7, 12],
			[6, 7, 14],
			[7, 8, 12],
		],
		expected: [-1, 2, 1, 5, 6, 3, 4, 8, 7],
	},

	// Create S-blossom, relabel as T, expand
	test25_s_t_expand: {
		edges: [
			[1, 2, 23],
			[1, 5, 22],
			[1, 6, 15],
			[2, 3, 25],
			[3, 4, 22],
			[4, 5, 25],
			[4, 8, 14],
			[5, 7, 13],
		],
		expected: [-1, 6, 3, 2, 8, 7, 1, 5, 4],
	},

	// Create nested S-blossom, relabel as T, expand
	test26_s_nest_t_expand: {
		edges: [
			[1, 2, 19],
			[1, 3, 20],
			[1, 8, 8],
			[2, 3, 25],
			[2, 4, 18],
			[3, 5, 18],
			[4, 5, 13],
			[4, 7, 7],
			[5, 6, 7],
		],
		expected: [-1, 8, 3, 2, 7, 6, 5, 4, 1],
	},

	// Create blossom, relabel as T in more than one way, expand, augment
	test30_tnasty_expand: {
		edges: [
			[1, 2, 45],
			[1, 5, 45],
			[2, 3, 50],
			[3, 4, 45],
			[4, 5, 50],
			[1, 6, 30],
			[3, 9, 35],
			[4, 8, 35],
			[5, 7, 26],
			[9, 10, 5],
		],
		expected: [-1, 6, 3, 2, 8, 7, 1, 5, 4, 10, 9],
	},

	// Again but slightly different
	test31_tnasty2_expand: {
		edges: [
			[1, 2, 45],
			[1, 5, 45],
			[2, 3, 50],
			[3, 4, 45],
			[4, 5, 50],
			[1, 6, 30],
			[3, 9, 35],
			[4, 8, 26],
			[5, 7, 40],
			[9, 10, 5],
		],
		expected: [-1, 6, 3, 2, 8, 7, 1, 5, 4, 10, 9],
	},

	// Create blossom, relabel as T, expand such that a new least-slack S-to-free edge is produced, augment
	test32_t_expand_leastslack: {
		edges: [
			[1, 2, 45],
			[1, 5, 45],
			[2, 3, 50],
			[3, 4, 45],
			[4, 5, 50],
			[1, 6, 30],
			[3, 9, 35],
			[4, 8, 28],
			[5, 7, 26],
			[9, 10, 5],
		],
		expected: [-1, 6, 3, 2, 8, 7, 1, 5, 4, 10, 9],
	},

	// Create nested blossom, relabel as T in more than one way, expand outer blossom such that inner blossom ends up on an augmenting path
	test33_nest_tnasty_expand: {
		edges: [
			[1, 2, 45],
			[1, 7, 45],
			[2, 3, 50],
			[3, 4, 45],
			[4, 5, 95],
			[4, 6, 94],
			[5, 6, 94],
			[6, 7, 50],
			[1, 8, 30],
			[3, 11, 35],
			[5, 9, 36],
			[7, 10, 26],
			[11, 12, 5],
		],
		expected: [-1, 8, 3, 2, 6, 9, 4, 10, 1, 5, 7, 12, 11],
	},

	// Create nested S-blossom, relabel as S, expand recursively
	test34_nest_relabel_expand: {
		edges: [
			[1, 2, 40],
			[1, 3, 40],
			[2, 3, 60],
			[2, 4, 55],
			[3, 5, 55],
			[4, 5, 50],
			[1, 8, 15],
			[5, 7, 30],
			[7, 6, 10],
			[8, 10, 10],
			[4, 9, 30],
		],
		expected: [-1, 2, 1, 5, 9, 3, 7, 6, 10, 4, 8],
	},
};

const btt = blossom(true, true);
const bdflt = blossom();

const algorithms = [
	maximumMatching,
	(edges) => btt(edges),
	(edges) => bdflt(edges),
];

for (const [i, algorithm] of enumerate(algorithms))
	for (const [key, {edges, expected}] of Object.entries(tests))
		test(`${key} ${i}`, macro, algorithm, edges, expected);
