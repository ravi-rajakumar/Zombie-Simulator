z.fight = function (human,zombie) {
		var zombieTargetCount = zombie.targetCount,
			humanTargetCount = human.targetCount,
			biteChance = 0.1/zombieTargetCount,
			humanDieChance = 0.1/zombieTargetCount,
			zombieStunChance = 0.1/humanTargetCount,
			zombieDieChance = 0.1/humanTargetCount,
			states = ['alive', 'undead'],
			tick = 1,
			i = 0;
			
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

			biteChance = (Math.pow(2,tick)/10)/zombieTargetCount;
			humanDieChance = (tick/10)/zombieTargetCount;
			zombieStunChance = zombieDieChance = (tick/10)/humanTargetCount;
			
			if (states[0] === 'dead') 
			{
				for (i = 0; i < Math.round(tick / z.secondsPerTurn()); i++)
				{
					human.actionQueue.push('fighting');
					zombie.actionQueue.push('fighting');
				}
				human.actionQueue.push('die');
				console.log('human death');	//remove later
				zombie.targetCount -= 1;
				return;
			}	
			else if (states[1] === 'stunned') 
			{
				for (i = 0; i < Math.round(tick / z.secondsPerTurn()); i++)
				{
					human.actionQueue.push('fighting');
					zombie.actionQueue.push('fighting');
				}
				for (i = 0; i < Math.floor(60 / z.secondsPerTurn()); i++)
				{
					zombie.actionQueue.push('stunned');	
				}
				console.log('zombie stunned');	//remove later
				zombie.targetCount -= 1;
				human.targetCount -= 1;
				if (states[0] === 'bitten')
				{
					human.zombify();
					console.log('human zombify coming...');	//remove later
				}
				return;
			}
			else if (states[1] === 'destroyed') 
			{
				for (i = 0; i < Math.round(tick / z.secondsPerTurn()); i++)
				{
					human.actionQueue.push('fighting');
					zombie.actionQueue.push('fighting');
				}
				zombie.actionQueue.push('die');
				console.log('zombie death');	//remove later
				human.targetCount -= 1;
				if (states[0] === 'bitten')
				{
					human.zombify();
					console.log('human zombify coming...');	//remove later
				}
				return;
			}	
			tick++;
		}
};