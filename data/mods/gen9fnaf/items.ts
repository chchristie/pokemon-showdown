// Custom item definitions.

export const Items: import('../../../sim/dex-items').ModdedItemDataTable = {
	remnant: {
		name: "Remnant",
		spritenum: 0,
		fling: {
			basePower: 30,
		},
		onBasePowerPriority: 15,
		onBasePower(basePower, user, target, move) {
			if (move.type === 'Steel' || move.type === 'Ghost') {
				return this.chainModify(1.25);
			}
		},
		onSourceBasePower(basePower, attacker, defender, move) {
			if (move.type === 'Fire') {
				return this.chainModify(1.25);
			}
		},
		num: -1,
		isNonstandard: "FNAF",
		shortDesc: "Steel and Ghost moves: 1.25x power. Weaker to Fire.",
		desc: "Holder's Steel- and Ghost-type moves have 1.25x power. The power of Fire-type moves is multiplied by 1.25x when used on the holder.",
	},
	illusiondisc: {
		name: "Illusion Disc",
		spritenum: 0,
		fling: {
			basePower: 100,
		},
		onBeforeSwitchIn(pokemon) {
			pokemon.illusion = null;
			pokemon.addVolatile('illusiondisc');
			// yes, you can Illusion an active pokemon but only if it's to your right
			for (let i = pokemon.side.pokemon.length - 1; i > pokemon.position; i--) {
				const possibleTarget = pokemon.side.pokemon[i];
				if (!possibleTarget.fainted) {
					// If Ogerpon is in the last slot while the Illusion Pokemon is Terastallized
					// Illusion will not disguise as anything
					if (!pokemon.terastallized || !['Ogerpon', 'Terapagos'].includes(possibleTarget.species.baseSpecies)) {
						pokemon.illusion = possibleTarget;
					}
					break;
				}
			}
		},
		onDamagingHit(damage, target, source, move) {
			target.useItem();
			if (target.illusion) {
				this.singleEvent('End', this.dex.abilities.get('Illusion'), target.abilityState, target, source, move);
			}
			target.removeVolatile('illusiondisc');
		},
		onEnd(pokemon) {
			if (pokemon.illusion && !pokemon.beingCalledBack) {
				this.debug('illusion cleared');
				pokemon.illusion = null;
				const details = pokemon.getUpdatedDetails();
				this.add('replace', pokemon, details);
				this.add('-end', pokemon, 'Illusion');
				if (this.ruleTable.has('illusionlevelmod')) {
					this.hint("Illusion Level Mod is active, so this Pok\u00e9mon's true level was hidden.", true);
				}
			}
		},
		onFaint(pokemon) {
			pokemon.illusion = null;
		},
		num: -2,
		isNonstandard: "FNAF",
		desc: "When this holder switches in, it appears as the last unfainted Pokemon in its party until it takes direct damage from another Pokemon's attack or until the end of the turn, upon either of which this item is consumed. This Pokemon's actual level and HP are displayed instead of those of the mimicked Pokemon.",
		shortDesc: "Holder disguised until taking damage or end of turn. Single use.",
	},
	musicbox: {
		name: "Music Box",
		spritenum: 0,
		onSwitchIn(pokemon) {
			this.boost({ atk: 1, spa: 1, spe: 1 }, pokemon);
			pokemon.addVolatile('yawn', pokemon);
		},
		num: -3,
		isNonstandard: "FNAF",
		desc: "When the holder switches in, its Attack, Special Attack, and Speed rise by 1 stage, and it becomes drowsy, as if it were hit by Yawn: at the end of the next turn, it falls asleep. The holder does not fall asleep if it switches out first, already has a non-volatile status condition, or cannot fall asleep.",
		shortDesc: "Switch-in: +1 Atk, SpA, Spe; holder becomes drowsy.",
	},
	missingbeak: {
		name: "Missing Beak",
		spritenum: 0,
		fling: {
			basePower: 30,
		},
		onBasePowerPriority: 15,
		onBasePower(basePower, user, target, move) {
			if (['peck', 'drillpeck', 'pluck', 'beakblast', 'boltbeak'].includes(move.id)) {
				return this.chainModify(1.5);
			}
		},
		num: -4,
		isNonstandard: "FNAF",
		shortDesc: "Holder's beak moves have 1.5x power.",
		desc: "Holder's Peck, Drill Peck, Pluck, Beak Blast, and Bolt Beak have 1.5x power.",
	},
	freddymask: {
		name: "Freddy Mask",
		spritenum: 0,
		fling: {
			basePower: 30,
		},
		onDisableMove(pokemon) {
			for (const moveSlot of pokemon.moveSlots) {
				if (this.dex.moves.get(moveSlot.id).category !== 'Status') {
					pokemon.disableMove(moveSlot.id);
				}
			}
		},
		onDamagePriority: 1,
		onDamage(damage, target, source, effect) {
			if (effect?.effectType === 'Move' && target.useItem()) {
				return target.baseMaxhp / 8;
			}
		},
		onCriticalHit(target, source, move) {
			if (!target?.hasItem('freddymask')) return;
			const hitSub = target.volatiles['substitute'] && !move.flags['bypasssub'] && !(move.infiltrates && this.gen >= 6);
			if (hitSub) return;
			if (!target.runImmunity(move)) return;
			return false;
		},
		onEffectiveness(typeMod, target, type, move) {
			if (!target || move.category === 'Status' || !target.hasItem('freddymask')) return;
			const hitSub = target.volatiles['substitute'] && !move.flags['bypasssub'] && !(move.infiltrates && this.gen >= 6);
			if (hitSub) return;
			if (!target.runImmunity(move)) return;
			return 0;
		},
		num: -5,
		isNonstandard: "FNAF",
		shortDesc: "Blocks first damaging hit. Holder cannot attack. Single use.",
		desc: "The first time the holder would take damage from a move, this item is consumed and the holder loses 1/8 of its maximum HP instead of taking the damage. While holding this item, the holder can only select status moves.",
	},

	// Item changes not related to balance changes but rather for implementing some other change
	bigroot: {
		// Implementing the logic for Regen Song
		inherit: true,
		onTryHeal(damage, target, source, effect) {
			const heals = ['drain', 'leechseed', 'ingrain', 'aquaring', 'strengthsap', 'regensong'];
			if (heals.includes(effect.id)) {
				return this.chainModify([5324, 4096]);
			}
		},
	},
	lightclay: {
		// Description only (mention Neon Wall).
		inherit: true,
		shortDesc: "Holder's Aurora Veil, Light Screen, Reflect last 8 turns; Neon Wall 5.",
		desc: "The holder's use of Aurora Veil, Light Screen, or Reflect lasts 8 turns instead of 5, and its use of Neon Wall lasts 5 turns instead of 3.",
	},
};
