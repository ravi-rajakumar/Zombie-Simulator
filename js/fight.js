// returns an array containing two states -- one for he human and one for the zombie
z.fight = function (human,zombie) {
		var zh = zombie.targetCount,
			hz = human.targetCount,
			biteChance = 0.1/zh,
			humanDieChance = 0/zh,
			zombieStunChance = 0.1/hz,
			zombieDieChance = 0/hz,
			states = ['alive', 'undead'],
			tick = 1,
			i = 0;
			
		// When the fight returns, it's over
		while (true) {
			if (Math.random()<biteChance) 
			{
				states[0] = 'bitten';
			}
			
			if (Math.random()<humanDieChance) 
			{
				states[0] = 'dead';
			}
			
			if (Math.random()<zombieStunChance) 
			{
				states[1] = 'stunned';
			}
			
			if (Math.random()<zombieDieChance) 
			{
				states[1] = 'destroyed';
			}

			biteChance = (Math.pow(2,tick)/10)/zh;
			humanDieChance = (tick/10)/zh;
			zombieStunChance = zombieDieChance = (tick/10)/hz;
			
			if (states[0] === 'dead') 
			{
				for (i = 0; i < Math.round(tick / z.secondsperturn()); i++)
				{
					human.actionQueue.push('fighting');
					zombie.actionQueue.push('fighting');
				}
				human.actionQueue.push('die');
				zombie.targetCount -= 1;
				return;
			}	
			else if (states[1] === 'stunned') 
			{
				for (i = 0; i < Math.round(tick / z.secondsperturn()); i++)
				{
					human.actionQueue.push('fighting');
					zombie.actionQueue.push('fighting');
				}
				for (i = 0; i < Math.floor(60 / z.secondsperturn()); i++)
				{
					zombie.actionQueue.push('stunned');	
				}
				zombie.targetCount -= 1;
				human.targetCount -= 1;
				if (states[0] === 'bitten')
				{
					human.zombify();
				}
				return;
			}
			else if (states[1] === 'destroyed') 
			{
				for (i = 0; i < Math.round(tick / z.secondsperturn()); i++)
				{
					human.actionQueue.push('fighting');
					zombie.actionQueue.push('fighting');
				}
				zombie.actionQueue.push('die');
				human.targetCount -= 1;
				if (states[0] === 'bitten')
				{
					human.zombify();
				}
				return;
			}	
			tick++;
		}
};