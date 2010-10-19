z.fight = function (humanoid,neighbor) {
	var biteChance = 0.1,
		humanDieChance = 0.01,
		zombieStunChance = 0.05,
		zombieDieChance = 0.01,
		zombie = null,
		human = null,
		zombieTargeted = true,
		humanTargeted = true,
		seconds = 0,
		exit = false;

	if (humanoid.isZombie()) 
	{
		zombie = humanoid;
		human = neighbor;
	}
	else
	{
		human = humanoid;
		zombie = neighbor;
	}
	
	zombieStunChance = (human.zombieKillingFitness <= 0.18) ? human.zombieKillingFitness * 5 : 0.9; // 5% chance by default but improved in more experienced humans
	zombieDieChance = human.zombieKillingFitness; // 1% chance by default but improved in more experienced humans
	
	// update the human's zombie killing skill for the next fight they have
	if (human.zombieKillingFitness < 0.16) {
		human.zombieKillingFitness += 0.07;
	}
	
	humanTargeted = (zombie.currentTarget === human);
	zombieTargeted = (human.currentTarget === zombie);

	// how long (in whole seconds) since we last performed fight actions
	seconds = Math.floor(z.simulatedTimeElapsed - humanoid.lastActionTimeStamp);
	
	// check to see whether a whole second has gone by since the last action
	if (seconds >= 1)
	{	
	
		// do one action per second
		for (var i = 0; i < seconds; i++)
		{

			z.flash(human);
			z.flash(zombie);
			
			/* handling multiple parties in a fight in a new way. participants can only have one focus at a time and only act on that focus.
			*/
			// this only happens if the zombie is actually focused on this human
			if (humanTargeted) 
			{			
				if (Math.random() < biteChance) 
				{
					if (human.zombify !== null)
					{
						human.zombify();
						human.currentTarget = zombie;
						z.message('human zombify coming...');
					}
				}
				
				if (Math.random() < humanDieChance) 
				{
					if (Math.random() < (z.zombieBrainEatingEfficiency / 100))
					{
						human.zombify = null; // the brain is destroyed so this person can't zombify
					}
					human.die();
					z.message('human death');
					zombie.currentTarget = null;
					exit = true;
				}
			}
			
			// this only happens if the human is actually focused on this zombie
			if (zombieTargeted) 
			{	
				if (Math.random() < zombieStunChance)
				{
					for (var j = 0; j < Math.floor(60 / z.secondsPerTurn()); j++)
					{
						zombie.actionQueue.push('stunned');	
					}
					human.currentTarget = null;
					exit = true;
				}
				
				if (Math.random() < zombieDieChance) 
				{
					zombie.die();
					z.message('zombie death');
					human.currentTarget = null;
					exit = true;
				}
			}
			human.lastActionTimeStamp = z.simulatedTimeElapsed;
			zombie.lastActionTimeStamp = z.simulatedTimeElapsed;
			
			if (exit) 
			{
				return;
			}
		}
	}
};

z.interact = function (humanoid, neighbor) 
{	
	var distance = z.range(humanoid, neighbor);
	
	if ((distance <= 1) && ((humanoid.isZombie() && humanoid.nextAction() !== 'stunned' && !neighbor.isZombie()) || (neighbor.isZombie() && neighbor.nextAction() !== 'stunned' && !humanoid.isZombie())))
	{
		humanoid.currentTarget = neighbor;
		humanoid.actionQueue = ['fight'];
	}
	else if (distance < z.sightRange)
	{
		z.humanoidInfluence(humanoid, neighbor, distance);
	}
};