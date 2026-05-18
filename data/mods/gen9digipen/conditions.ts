// DigiPen custom volatile conditions.

export const Conditions: import('../../../sim/dex-conditions').ModdedConditionDataTable = {
	procrastinator: {
		name: 'procrastinator',
		onDisableMove(pokemon) {
			for (const moveSlot of pokemon.moveSlots) {
				const move = this.dex.moves.get(moveSlot.id);
				if (move.category !== 'Status') {
					pokemon.disableMove(moveSlot.id);
				}
			}
		}
	},
};
