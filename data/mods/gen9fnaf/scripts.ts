import { initCustomMod } from '../../custom-mod-init';
import { BattleActions } from '../../../sim/battle-actions';

export const Scripts: ModdedBattleScriptsData = {
	inherit: 'gen9modbase',
	// `init` is the one part of scripts.ts that is not inherited, so every custom content mod has
	// to call this itself. See data/custom-mod-init.ts.
	init() {
		initCustomMod(this);
	},
	actions: {
		useMoveInner(moveOrMoveName, pokemon, options) {
			const result = BattleActions.prototype.useMoveInner.call(this, moveOrMoveName, pokemon, options);
			const move = this.battle.activeMove;
			if (move && move.category !== 'Status') {
				this.battle.formatData.lastAttackingMove = move;
			}
			return result;
		},
	},
};
