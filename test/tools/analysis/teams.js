/**
 * Tests for how the analysis API turns a client's packed team into the team a battle starts from
 * (`validateAnalysisTeam` in tools/analysis-state.ts; docs/analysis/overview.md, "Teams").
 * Fork-owned: the analysis tool isn't part of upstream.
 *
 * The case that matters is the battle-only forme. A teambuilder stores Mega Charizard X as
 * `Charizard-Mega-X`, but a battle starts from `Charizard` holding a Charizardite X and Mega Evolves
 * during it — so a tool that hands the sim the team as typed puts a Mega on the field on turn 1.
 */
'use strict';

const assert = require('assert').strict;
const { Teams } = require('../../../dist/sim');
const { createAnalysisBattle, validateAnalysisTeam } = require('../../../dist/tools/analysis-state');
const { validateBatchRequest } = require('../../../dist/tools/analysis-batch');

const MEGA_TEAM = Teams.pack(Teams.import(`
Charizard-Mega-X @ Charizardite X
Ability: Tough Claws
Level: 100
EVs: 4 HP
- Dragon Dance
- Flare Blitz
- Dragon Claw
- Roost
`));

const LEGAL_TEAM = Teams.pack(Teams.import(`
Gengar @ Ghostium Z
Ability: Cursed Body
Level: 100
EVs: 4 HP
- Shadow Ball
- Sludge Wave
- Taunt
- Will-O-Wisp
`));

describe('Analysis team validation', () => {
	it('rewrites a battle-only forme to the forme the battle starts from', () => {
		const { problems, packedTeam } = validateAnalysisTeam('gen7ou', MEGA_TEAM);
		assert.deepEqual(problems, []);
		const [set] = Teams.unpack(packedTeam);
		assert.equal(set.species, 'Charizard');
		// the Mega's ability goes with the Mega; the base forme gets its own back
		assert.equal(set.ability, 'Blaze');
		assert.equal(set.item, 'Charizardite X');
	});

	it('starts the battle unevolved, with the Mega still available', () => {
		const { packedTeam } = validateAnalysisTeam('gen7ou', MEGA_TEAM);
		const battle = createAnalysisBattle({ format: 'gen7ou', team1: packedTeam, team2: LEGAL_TEAM });
		battle.setPlayer('p1', {});
		battle.setPlayer('p2', {});
		battle.makeChoices('default', 'default'); // gen 7 OU opens on Team Preview
		const pokemon = battle.sides[0].active[0];
		assert.equal(pokemon.species.name, 'Charizard');
		assert.equal(pokemon.canMegaEvo, 'Charizard-Mega-X');
	});

	it('leaves a legal team alone apart from the fields the sim fills in anyway', () => {
		const { problems, packedTeam } = validateAnalysisTeam('gen7ou', LEGAL_TEAM);
		assert.deepEqual(problems, []);
		const [set] = Teams.unpack(packedTeam);
		assert.equal(set.species, 'Gengar');
		assert.equal(set.ability, 'Cursed Body');
		assert.deepEqual(set.moves, ['Shadow Ball', 'Sludge Wave', 'Taunt', 'Will-O-Wisp']);
	});

	it('hands back the team untouched when it does not validate', () => {
		const illegal = Teams.pack(Teams.import(`
Mewtwo @ Leftovers
Ability: Pressure
Level: 100
EVs: 4 HP
- Psystrike
`));
		const { problems, packedTeam } = validateAnalysisTeam('gen7ou', illegal);
		assert(problems.length);
		assert.equal(packedTeam, illegal);
	});

	it('reports an empty team rather than throwing', () => {
		assert.deepEqual(validateAnalysisTeam('gen7ou', '').problems, ['Team is empty.']);
	});

	/*
	 * The workers build their own battles from the request, so a batch that skipped the rewrite would be
	 * simulating a position the analysis itself never reached.
	 */
	it('normalizes the teams a simulation batch runs on', () => {
		const request = {
			format: 'gen7ou', team1: MEGA_TEAM, team2: LEGAL_TEAM, inputLog: ['>p1 move 1', '>p2 move 1'], count: 1,
		};
		assert.equal(validateBatchRequest(request), null);
		assert.equal(Teams.unpack(request.team1)[0].species, 'Charizard');
	});

	it('leaves a sandbox team alone, deliberately illegal as it is', () => {
		const request = {
			format: 'gen7ou', team1: MEGA_TEAM, team2: LEGAL_TEAM, inputLog: ['>p1 move 1', '>p2 move 1'],
			count: 1, sandbox: true,
		};
		assert.equal(validateBatchRequest(request), null);
		assert.equal(Teams.unpack(request.team1)[0].species, 'Charizard-Mega-X');
	});
});
