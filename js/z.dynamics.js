z.humanoidInfluence = function (currentHumanoid, neighbor, distance) {
	var attraction = 0,
		persuasion = 0,
		walkingSpeed = currentHumanoid.maxWalkingSpeed,
		neighborHorizontalDelta = Math.sin(neighbor.heading),
		neighborVerticalDelta = 0 - Math.cos(neighbor.heading),
		headingScale = (distance > 0) ? walkingSpeed / distance : 1,
		currentHumanoidAngle = 0,
		newHeading = 0,
		influence = 0,
		allforces = 0,
		influenceEffect = {x:0,y:0,w:0};
	
	influence = ((neighbor.position.y - currentHumanoid.position.y) >= 0) ? Math.PI - Math.asin((neighbor.position.x - currentHumanoid.position.x) / distance) : (Math.PI * 2 + Math.asin((neighbor.position.x - currentHumanoid.position.x) / distance)) % (Math.PI * 2);
	
	// can currentHumanoid actually see or hear the neighbor?
	if (Math.abs(currentHumanoid.heading - influence) <= z.fieldOfView / 2)
	{
		if (!currentHumanoid.isZombie())
		{
			// humans are automatically attracted to other humanoids unless they recognize them as zombies
			if (!neighbor.isZombie() || !currentHumanoid.recognizes(neighbor))
			{
				attraction = z.humanHerding;
				persuasion = z.humanQueueing;
				
			}
			else
			{
				attraction = -1;
				persuasion = 0;
				// drop everything and run away for 10 seconds
				currentHumanoid.actionQueue = [];
				for (var i = 0; i < (10/z.secondsPerTurn()); i++)
				{
					currentHumanoid.actionQueue.push('run');
				}
				// after an encounter with a zombie, humans learn to recognize them better
				if (currentHumanoid.recognitionRange < 10) {
					currentHumanoid.recognitionRange += 3;
				}
			}
		}
		
		// zombies are strongly attracted to humans
		if (currentHumanoid.isZombie() && !neighbor.isZombie())
		{
			attraction = 1;
			persuasion = 1;
		}
		
		if (currentHumanoid.isZombie() && neighbor.isZombie())
		{
			// zombies are somewhat attracted to each other
			attraction = z.zombieHerding;
			persuasion = z.zombieQueueing;
			
		}
		
		// humans are automatically repulsed by other bodies being too close to them
		if (distance < 0.5 && !currentHumanoid.isZombie() && !neighbor.isZombie())
		{
			attraction = -0.5;
		}
		
		// apply herding effect
		currentHumanoid.influences.x += headingScale * (neighbor.position.x - currentHumanoid.position.x) * attraction;
		currentHumanoid.influences.y += headingScale * (neighbor.position.y - currentHumanoid.position.y) * attraction;
		currentHumanoid.influences.w += Math.abs(attraction);
		
		// apply queueing effect
		currentHumanoid.influences.x += walkingSpeed * neighborHorizontalDelta * persuasion;
		currentHumanoid.influences.y += walkingSpeed * neighborVerticalDelta * persuasion;
		currentHumanoid.influences.w += Math.abs(persuasion);
		
		// slow down if near an attractor 
		currentHumanoid.influences.a += attraction / distance;
	}
};