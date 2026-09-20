/**
 * Tests for Z-move support in the analysis API (docs/analysis/overview.md, "Z-moves").
 * Fork-owned: the analysis tool isn't part of upstream.
 *
 * Two halves, matching the two things the client needs:
 * - the **request** carries `zMoves`, the shape `BattleChoiceBuilder` reads (the play client derives it
 *   in `fixRequest`, which the analysis page can't call);
 * - the **calcs** have a `z` entry per Z-powered move, so hovering a move button with Z-Power ticked
 *   shows the Z-move's damage instead of the base move's.
 */
'use strict';

const assert = require('assert').strict;
const { Teams } = require('../../../dist/sim');
const { createAnalysisBattle } = require('../../../dist/tools/analysis-state');
const { getAnalysisCalcs } = require('../../../dist/tools/analysis-calc');

const SEED = 'sodium,00000000000000000000000000000001';

/** Ghostium Z powers up Shadow Ball only: the other three moves have no Z version here. */
const Z_TEAM = Teams.pack(Teams.import(`
Gengar @ Ghostium Z
Ability: Cursed Body
Level: 100
EVs: 4 HP
- Shadow Ball
- Sludge Wave
- Taunt
- Will-O-Wisp
`));

/** Not a Normal type: Gengar's Ghost moves have to actually land for the calcs to be comparable. */
const PLAIN_TEAM = Teams.pack(Teams.import(`
Garchomp @ Leftovers
Ability: Rough Skin
Level: 100
EVs: 4 HP
- Earthquake
- Dragon Claw
- Swords Dance
- Protect
`));

function battleAtTurnOne(team1 = Z_TEAM, team2 = PLAIN_TEAM, format = 'gen7ou') {
	const battle = createAnalysisBattle({ format, team1, team2, seed: SEED });
	battle.setPlayer('p1', {});
	battle.setPlayer('p2', {});
	battle.makeChoices('default', 'default'); // past Team Preview
	return battle;
}

describe('Analysis Z-moves', () => {
	it('offers the Z-move options the sim would offer', () => {
		const battle = battleAtTurnOne();
		const active = battle.getRequests('move')[0].active[0];
		assert.equal(active.canZMove[0].move, 'Never-Ending Nightmare');
		assert.deepEqual(active.canZMove.slice(1), [null, null, null]);
		// nothing to offer the side without a crystal
		assert.equal(battle.getRequests('move')[1].active[0].canZMove, undefined);
	});

	it('accepts `move N zmove` and runs the Z-move', () => {
		const battle = battleAtTurnOne();
		battle.choose('p1', 'move 1 zmove');
		battle.choose('p2', 'move 4');
		const log = battle.log.join('\n');
		assert(log.includes('|-zpower|p1a: Gengar'), log);
		assert(log.includes('Never-Ending Nightmare'), log);
	});

	it('calcs the Z-move under mode `z`, and only for moves that have one', () => {
		const battle = battleAtTurnOne();
		const results = getAnalysisCalcs(battle, ['>p1 move 1 zmove', '>p2 move 1'])
			.filter(result => result.attacker.side === 'p1');
		const zResults = results.filter(result => result.mode === 'z');
		assert.equal(zResults.length, 1, 'only Shadow Ball has a Z version here');
		assert.equal(zResults[0].moveId, 'shadowball', 'keyed by the base move, as the client is');
		assert.equal(zResults[0].moveName, 'Never-Ending Nightmare');
		const plain = results.find(result => result.mode === '' && result.moveId === 'shadowball');
		assert(zResults[0].targets[0].damage[0] > plain.targets[0].damage[0], 'the Z-move should hit harder');
	});

	it('has no `z` mode at all without a crystal', () => {
		const battle = battleAtTurnOne();
		const modes = new Set(getAnalysisCalcs(battle, [])
			.filter(result => result.attacker.side === 'p2').map(result => result.mode));
		assert.deepEqual([...modes], ['']);
	});

	/*
	 * A Z-move's target comes from the Z-move, not from the base move: every generic Z-move is
	 * single-target, so Z-Blizzard hits one Pokémon where Blizzard hits both. The calc has to agree with
	 * the request, or the tooltip would list targets the choice can't take.
	 */
	it('uses the Z-move\'s own target in doubles', () => {
		const spreadTeam = Teams.pack(Teams.import(`
Alolan Ninetales @ Icium Z
Ability: Snow Warning
Level: 100
EVs: 4 HP
- Blizzard
- Moonblast
- Aurora Veil
- Protect

Gengar @ Leftovers
Ability: Cursed Body
Level: 100
EVs: 4 HP
- Shadow Ball
- Sludge Wave
- Taunt
- Will-O-Wisp
`));
		const doublesPlain = Teams.pack(Teams.unpack(PLAIN_TEAM).concat(Teams.unpack(PLAIN_TEAM)));
		const battle = battleAtTurnOne(spreadTeam, doublesPlain, 'gen7doublesou');
		const active = battle.getRequests('move')[0].active[0];
		assert.equal(active.canZMove[0].move, 'Subzero Slammer');
		assert.equal(active.canZMove[0].target, 'normal', 'Blizzard is allAdjacentFoes, its Z-move is not');
		const results = getAnalysisCalcs(battle, []).filter(result =>
			result.attacker.side === 'p1' && result.attacker.slot === 0 && result.moveId === 'blizzard');
		const base = results.find(result => result.mode === '');
		const powered = results.find(result => result.mode === 'z');
		const hovered = result => result.targets.filter(target => target.onMoveHover).length;
		assert.equal(base.targets.length, 2, 'Blizzard hits both foes and nothing else');
		assert.equal(hovered(base), 2);
		// a single-target move can be aimed at the ally too, so it has a third candidate
		assert.equal(powered.targets.length, 3);
		assert.equal(hovered(powered), 2, 'only the foes are shown when hovering the button');
	});
});
