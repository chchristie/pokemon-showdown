// Custom volatile conditions. Useful for making custom abilities and moves with persistent effects.

export const Conditions: import('../../../sim/dex-conditions').ModdedConditionDataTable = {
	illusiondisc: {
		name: 'illusiondisc',
		onResidual(pokemon) {
			pokemon.useItem();
			if (!pokemon.illusion) return;
			this.debug('illusion cleared');
			pokemon.illusion = null;
			const details = pokemon.getUpdatedDetails();
			this.add('replace', pokemon, details);
			this.add('-end', pokemon, 'Illusion');
			if (this.ruleTable.has('illusionlevelmod')) {
				this.hint("Illusion Level Mod is active, so this Pok\u00e9mon's true level was hidden.", true);
			}
			pokemon.removeVolatile('illusiondisc');
		},
	},
	cursecounter: {
		name: 'cursecounter',
		duration: 1,
		onStart(target) {
			this.add('-start', target, 'cursecounter1');
		},
		onEnd(target) {
			this.add('-start', target, 'cursecounter0');
			target.addVolatile('itsmecurse');
		},
		onResidualOrder: 24,
		onResidual(pokemon) {
			const duration = pokemon.volatiles['cursecounter'].duration;
			this.add('-start', pokemon, `cursecounter${duration}`);
		},
	},
	itsmecurse: {
		name: 'itsmecurse',
		onStart(target, source) {
			this.add('-start', target, 'Curse', `[of] ${source}`);
		},
		onResidualOrder: 12,
		onResidual(pokemon) {
			this.damage(pokemon.baseMaxhp / 4);
		},
	},
	bleeding: {
		name: 'Bleeding',
		noCopy: true,
		onStart(pokemon) {
			this.add('-start', pokemon, 'Bleeding');
		},
		onResidualOrder: 13,
		onResidual(pokemon) {
			this.damage(pokemon.baseMaxhp / 8);
		},
		onEnd(pokemon) {
			this.add('-end', pokemon, 'Bleeding');
		},
	},
	poppers: {
		name: 'Poppers',
		onStart(target, source) {
			this.effectState.source = source;
			this.effectState.volleys = 0;
			this.add('-start', source, 'move: Poppers');
		},
		onResidualOrder: 3,
		onResidual(target) {
			const data = this.effectState;
			data.volleys++;
			if (!target.fainted && target !== data.source) {
				this.add('-activate', target, 'move: Poppers');
				const hitMove = new this.dex.Move({
					id: 'poppers',
					name: "Poppers",
					num: -28,
					accuracy: 100,
					basePower: 15,
					category: "Physical",
					priority: 0,
					flags: { allyanim: 1, metronome: 1, futuremove: 1 },
					multihit: [2, 5],
					ignoreImmunity: false,
					effectType: 'Move',
					target: 'normal',
					type: 'Fire',
				}) as ActiveMove;
				this.actions.trySpreadMoveHit([target], data.source, hitMove, true);
				if (data.source.isActive && data.source.hasItem('lifeorb')) {
					this.singleEvent('AfterMoveSecondarySelf', data.source.getItem(), data.source.itemState, data.source, target, data.source.getItem());
				}
				this.activeMove = null;
				this.checkWin();
			}
			if (data.volleys >= 3) target.side.removeSlotCondition(target, 'poppers');
		},
		onEnd(target) {
			this.add('-end', target, 'move: Poppers');
		},
	},
};
