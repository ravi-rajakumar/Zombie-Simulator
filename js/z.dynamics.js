z.recalibrate = function () {
	if (z.lastTurnDuration === null)
	{
		z.lastTurnDuration = z.interval / 1000;
	}
	
	/* run speed should be based on the actual achieved performance. The 'actual turns per second' (actualTurnsPerSecond) tells us how long one turn is in real time. Each time we recalibrate, we check it against the last measurement and then adjust it proportionally.
	*/
	for (var index = 0; index < z.neighbors.length; index++) {
		z.neighbors[index].maxRunSpeed = z.neighbors[index].maxRunSpeed * (1 / (z.lastTurnDuration * z.actualTurnsPerSecond));
	}
	
	z.lastTurnDuration = 1 / z.actualTurnsPerSecond;
};

z.humanoidInfluence = function (currentHumanoid, neighbor, distance) {
	var attraction = 0,
		persuasion = 0,
		runSpeed = currentHumanoid.maxRunSpeed,
		neighborRunSpeed = neighbor.maxRunSpeed,
		currentHumanoidHorizontalDelta = Math.sin(currentHumanoid.heading) * runSpeed,
		currentHumanoidVerticalDelta = 0 - Math.cos(currentHumanoid.heading) * runSpeed,
		neighborHorizontalDelta = Math.sin(neighbor.heading),
		neighborVerticalDelta = 0 - Math.cos(neighbor.heading),
		headingScale = (distance > 0) ? runSpeed / distance : 1,
		currentHumanoidAngle = 0,
		newHeading = 0,
		influence = 0,
		allforces = 0;
	
	influence = ((neighbor.position.y - currentHumanoid.position.y) >= 0) ? Math.PI - Math.asin((neighbor.position.x - currentHumanoid.position.x) / distance) : (Math.PI * 2 + Math.asin((neighbor.position.x - currentHumanoid.position.x) / distance)) % (Math.PI * 2);
	
	// can currentHumanoid actually see neighbor?
	if (Math.abs(currentHumanoid.heading - influence) <= z.fieldOfView / 2)
	{
		if (!currentHumanoid.isZombie())
		{
			// humans are automatically attracted to other humanoids unless they recognize them as zombies
			if (!neighbor.isZombie() || z.range(currentHumanoid, neighbor) > z.humanRecognitionRange)
			{
				attraction = z.humanHerding;
				persuasion = z.humanQueueing;
			}
			else
			{
				attraction = -1;
				persuasion = -1;
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
		
		// sum magnitudes of forces to calculate averages
		allforces = 1 + Math.abs(attraction) + Math.abs(persuasion);
		
		// create dx and dy values for neighbor's physical influence, and add them to the existing heading
		var newHorizontalDelta = (headingScale * (neighbor.position.x - currentHumanoid.position.x) * attraction + (runSpeed * neighborHorizontalDelta * persuasion) + currentHumanoidHorizontalDelta) / allforces,
			newVerticalDelta = (headingScale * (neighbor.position.y - currentHumanoid.position.y) * attraction + (runSpeed * neighborVerticalDelta * persuasion) + currentHumanoidVerticalDelta) / allforces;
		
		currentHumanoidAngle = Math.asin(Math.round(100 * newHorizontalDelta / runSpeed) / 100);
		 
		newHeading = (newVerticalDelta >= 0) ? Math.PI - currentHumanoidAngle : (Math.PI * 2 + currentHumanoidAngle) % (Math.PI * 2);
		
		// here we set the new heading based on proximity (herding)
		currentHumanoid.heading = Math.round(newHeading * 1000) / 1000;
		
		// slow down if near an attractor
		if (attraction > 0)
		{
			currentHumanoid.runSpeed = currentHumanoid.maxRunSpeed * distance / 40;
		}
	}
};