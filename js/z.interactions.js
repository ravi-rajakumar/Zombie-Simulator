z.fight = function (humanoid,neighbor) {
	var biteChance = 0.1,
		humanDieChance = 0.01,
		zombieStunChance = 0.1,
		zombieDieChance = 0.01,
		zombie = null,
		human = null,
		seconds = 0;

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


	// how long (in whole seconds) since we last performed fight actions
	seconds = Math.floor(z.simulatedTimeElapsed - humanoid.lastActionTimeStamp);
	
	// check to see whather a whole second has gone by since the last action
	if (seconds >= 1)
	{	
		// do one action per second
		for (var i = 0; i < seconds; i++)
		{
			z.flash(human);
			z.flash(zombie);
		
			
			if (Math.random()<biteChance) 
			{
				human.zombify();
				z.message('human zombify coming...');
			}
			
			if (Math.random()<humanDieChance) 
			{
				human.die();
				z.message('human death');
				zombie.currentTarget = null;
			}
			
			if (Math.random()<zombieStunChance) 
			{
				for (i = 0; i < Math.floor(60 / z.secondsPerTurn()); i++)
				{
					zombie.actionQueue.push('stunned');	
				}
				human.currentTarget = null;
				return;
			}
			
			if (Math.random()<zombieDieChance) 
			{
				zombie.die();
				z.message('zombie death');
				human.currentTarget = null;
			}
		}
		humanoid.lastActionTimeStamp = z.simulatedTimeElapsed;
		neighbor.lastActionTimeStamp = z.simulatedTimeElapsed;
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
	
	if (distance < 0.25)
	{
		humanoid.heading = z.flockAngle;
		z.flockAngle = (z.flockAngle + Math.PI / 3) % (2 * Math.PI);
	}
	else if (distance < z.sightRange)
	{
		z.humanoidInfluence(humanoid, neighbor, distance);
	}
};