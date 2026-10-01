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
		onStart(pokemon) {
			let activated = false;
			for (const foe of pokemon.adjacentFoes()) {
				if (!activated) {
					this.add('-ability', pokemon, 'Audio Disturbance');
					activated = true;
				}
				foe.addVolatile('audiodisturbance', pokemon);
			}
		},
		flags: {},
		name: "Audio Disturbance",
		num: -4,
		rating: 3,
		shortDesc: "On switch-in, adjacent foes can't use sound moves for 2 turns.",
		desc: "On switch-in, each adjacent opposing Pokemon becomes unable to use sound-based moves until the end of the next turn, or for the following 2 turns if this Pokemon switches in between turns such as at the start of the battle or to replace a fainted Pokemon. The effect is removed if the affected Pokemon switches out, and it is not given to Pokemon that switch in later. It continues if this Pokemon leaves the field.",
	},
};
