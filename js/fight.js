// returns an array containing two states -- one for he human and one for the zombie
z.fight = function (human,zombie) {
		var zh = zombie.targetCount,
			hz = human.targetCount,
			biteChance = .1/zh,
			humanDieChance = .1/zh,
			zombieStunChance = .1/hz,
			zombieDieChance = .1/hz,
			states = ['alive', 'undead'],
			tick = 1;
			
		// When the fight returns, it's over
		while (true) {
			if (Math.random()<biteChance) {
				states[0] = 'bitten';
			}
			
			if (Math.random()<humanDieChance) {
				states[0] = 'brain-eaten';
			}
			
			if (Math.random()<zombieStunChance) {
				states[1] = 'stunned';
			}
			
			if (Math.random()<zombieDieChance) {
				states[1] = 'dead';
			}

			biteChance = (Math.pow(2,tick)/10)/zh;
			humanDieChance = (tick/10)/zh;
			zombieStunChance = zombieDieChance = (tick/10)/hz;
			
			if (states[0] === 'brain-eaten' || states[1] === 'stunned' || states[1] === 'dead') {
				return states.join(',') + ', ticks: ' + tick;
			}		
			
			tick++;
		}
}