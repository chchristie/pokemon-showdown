export const Abilities: import('../../../sim/dex-abilities').ModdedAbilityDataTable = {
	itsme: {
		isNonstandard: "FNAF",
		onSwitchIn(pokemon) {
			if (pokemon.abilityState.itsmeTriggered) return;
			pokemon.abilityState.itsmeTriggered = true;

			for (const foe of pokemon.adjacentFoes()) {
				if (!foe.hp || foe.fainted) continue;
				if (foe.volatiles['cursecounter']) continue;
				foe.addVolatile('cursecounter');
			}
		},
		flags: {},
		name: "It's Me",
		num: -1,
		rating: 4,
		shortDesc: "On first switch-in, curses adjacent foes at end of turn.",
		desc: "Each adjacent foe receives a curse count of 1 if it doesn't already have a curse count. At the end of each turn including the turn used, the curse count of the foe lowers by 1. If the number reaches 0, the foe becomes cursed and loses 1/4 of its maximum HP at the end of each turn. The curse count and the curse are removed from the foe if it switches out.",
	},
	hello: {
		isNonstandard: "FNAF",
		onSwitchIn(pokemon) {
			for (const foe of pokemon.adjacentFoes()) {
				let move: Move | ActiveMove | null = foe.lastMove;
				if (!move || move.isZ) continue;
				if (move.isMax && move.baseMove) move = this.dex.moves.get(move.baseMove);

				const ppDeducted = foe.deductPP(move.id, 4);
				if (!ppDeducted) continue;
				this.add("-activate", foe, 'ability: Hello', move.name, ppDeducted);
			}
		},
		flags: {},
		name: "Hello",
		num: -2,
		rating: 4,
		shortDesc: "On switch-in, reduces the PP of each foe's last move by 4.",
		desc: "When this Pokemon switches in, it reduces the PP of the each opposing Pokemon's last move by 4. If the foe has no last move or if the last move is a Z-Move, this ability does nothing.",
	},
	followme: {
		isNonstandard: "FNAF",
		onStart(pokemon) {
			if (this.activePerHalf <= 1) return;
			this.add('-ability', pokemon, 'Follow Me');
			pokemon.addVolatile('followme');
		},
		flags: {},
		name: "Follow Me",
		num: -3,
		rating: 3,
		shortDesc: "On switch-in, foes' single-target moves target this Pokemon.",
		desc: "On switch-in, until the end of the turn, all single-target attacks from the opposing side are redirected to this Pokemon. If this Pokemon switches in between turns, such as at the start of the battle or to replace a fainted Pokemon, the effect lasts until the end of the following turn. Attacks are redirected to this Pokemon before they can be reflected by Magic Coat or the Magic Bounce Ability, or drawn in by the Lightning Rod or Storm Drain Abilities. Has no effect if it is not a Double Battle or Battle Royal. This effect is ignored while this Pokemon is under the effect of Sky Drop.",
	},
	audiodisturbance: {
		isNonstandard: "FNAF",
		onSourceDamagingHit(damage, target, source, move) {
			// Once per target per move, so a multi-hit move doesn't stack the drop
			if (move.hit > 1 || !target.hp) return;
			this.add('-ability', source, 'Audio Disturbance');
			this.boost({ evasion: -1 }, target, source, null, true);
		},
		flags: {},
		name: "Audio Disturbance",
		num: -4,
		rating: 3,
		shortDesc: "This Pokemon's damaging moves lower the target's evasiveness by 1.",
		desc: "When this Pokemon damages a target with a move, that target's evasiveness is lowered by 1 stage. A multi-hit move lowers it only once per target. Has no effect if the move hits a substitute.",
	},
	blackout: {
		isNonstandard: "FNAF",
		onSourceDamagingHit(damage, target, source, move) {
			// Once per target per move, so a multi-hit move doesn't stack the drop
			if (move.hit > 1 || !target.hp) return;
			this.add('-ability', source, 'Blackout');
			this.boost({ accuracy: -1 }, target, source, null, true);
		},
		flags: {},
		name: "Blackout",
		num: -5,
		rating: 3.5,
		shortDesc: "This Pokemon's damaging moves lower the target's accuracy by 1.",
		desc: "When this Pokemon damages a target with a move, that target's accuracy is lowered by 1 stage. A multi-hit move lowers it only once per target. Has no effect if the move hits a substitute.",
	},
	funwithplushtrap: {
		isNonstandard: "FNAF",
		onStart(pokemon) {
			this.effectState.targeted = false;
			this.effectState.unwatched = false;
		},
		onTryHitPriority: 10,
		onTryHit(target, source, move) {
			if (target !== source && !target.isAlly(source) && !move.spreadHit) this.effectState.targeted = true;
		},
		onResidualOrder: 29,
		onResidual(pokemon) {
			// Only a full turn on the field counts
			this.effectState.unwatched = !this.effectState.targeted && pokemon.activeTurns > 0;
			this.effectState.targeted = false;
		},
		onModifyPriority(priority, pokemon, target, move) {
			if (this.effectState.unwatched && move?.category === 'Status') {
				this.add('-activate', pokemon, 'ability: Fun with Plushtrap');
				return priority + 1;
			}
		},
		flags: {},
		name: "Fun with Plushtrap",
		num: -6,
		rating: 3.5,
		shortDesc: "If no foe's move targeted only this Pokemon last turn, its Status moves get +1 priority.",
		desc: "If this Pokemon was not the only target of a move used by an opposing Pokemon during the previous turn, its non-damaging moves have their priority increased by 1. Has no effect unless this Pokemon was on the field for the full previous turn. A move used on this Pokemon is still counted if it missed or was blocked by a protection move.",
	},
	funwithballoonboy: {
		isNonstandard: "FNAF",
		onStart(pokemon) {
			this.effectState.targeted = false;
			this.effectState.unwatched = false;
		},
		onTryHitPriority: 10,
		onTryHit(target, source, move) {
			if (target !== source && !target.isAlly(source) && !move.spreadHit) this.effectState.targeted = true;
		},
		onResidualOrder: 29,
		onResidual(pokemon) {
			// Only a full turn on the field counts
			this.effectState.unwatched = !this.effectState.targeted && pokemon.activeTurns > 0;
			this.effectState.targeted = false;
		},
		onModifyPriority(priority, pokemon, target, move) {
			if (this.effectState.unwatched && move?.category !== 'Status') {
				this.add('-activate', pokemon, 'ability: Fun with Balloon Boy');
				return priority + 1;
			}
		},
		flags: {},
		name: "Fun with Balloon Boy",
		num: -7,
		rating: 3.5,
		shortDesc: "If no foe's move targeted only this Pokemon last turn, its attacks get +1 priority.",
		desc: "If this Pokemon was not the only target of a move used by an opposing Pokemon during the previous turn, its damaging moves have their priority increased by 1. Has no effect unless this Pokemon was on the field for the full previous turn. A move used on this Pokemon is still counted if it missed or was blocked by a protection move.",
	},
	// Allow Phantom Puppet to have the ability.
	poisonpuppeteer: {
		inherit: true,
		onAnyAfterSetStatus(status, target, source, effect) {
			if (!['Pecharunt', 'Phantom Puppet'].includes(source.baseSpecies.name)) return;
			if (source !== this.effectState.target || target === source || effect.effectType !== 'Move') return;
			if (status.id === 'psn' || status.id === 'tox') {
				target.addVolatile('confusion');
			}
		},
		desc: "If this Pokemon is a Pecharunt or a Phantom Puppet and poisons or badly poisons a target, the target also becomes confused.",
		shortDesc: "Pecharunt/Phantom Puppet: If this Pokemon poisons a target, it also becomes confused.",
	},
};
