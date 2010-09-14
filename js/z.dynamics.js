z.recalibrate = function () {
	if (z.lastTPS === null)
	{
		z.lastTPS = z.interval / 1000;
	}
	
	$.each(z.neighbors, function (index, humanoid) {
		humanoid.maxRunSpeed = humanoid.maxRunSpeed * (1 / (z.lastTPS * z.actualTPS));
		
	});
	z.lastTPS = 1 / z.actualTPS;
};

z.humanoidInfluence = function (currentHumanoid, neighbor, distance) {
	var attraction = 0,
			runSpeed = currentHumanoid.maxRunSpeed,
			currentHumanoidHorizontalDelta = Math.sin(currentHumanoid.heading) * runSpeed,
			currentHumanoidVerticalDelta = 0 - Math.cos(currentHumanoid.heading) * runSpeed,
			headingScale = (distance > 0) ? Math.round(1000 * runSpeed / distance) / 1000 : 1,
			currentHumanoidAngle = 0,
			newHeading = 0,
			influence = 0;
	
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
			}
			else
			{
				attraction = -1;
			}
		}
		
		// zombies are strongly attracted to humans
		if (currentHumanoid.isZombie() && !neighbor.isZombie())
		{
			attraction = 1;
		}
		
		// zombies are lightly attracted to each other
		if (currentHumanoid.isZombie() && neighbor.isZombie())
		{
			attraction = z.zombieHerding;
		}
		
		// humans are automatically repulsed by other bodies being too close to them
		if (distance < 0.5 && !currentHumanoid.isZombie() && !neighbor.isZombie())
		{
			attraction = -0.5;
		}
		
		// create dx and dy values for neighbor's physical influence, and add them to the existing heading
		var neighborHorizontalDelta = (headingScale * (neighbor.position.x - currentHumanoid.position.x) * attraction + currentHumanoidHorizontalDelta) / 2,
				neighborVerticalDelta = (headingScale * (neighbor.position.y - currentHumanoid.position.y) * attraction + currentHumanoidVerticalDelta) / 2;
		
		currentHumanoidAngle = Math.asin(Math.round(100 * neighborHorizontalDelta / runSpeed) / 100);
		newHeading = (neighborVerticalDelta >= 0) ? Math.PI - currentHumanoidAngle : (Math.PI * 2 + currentHumanoidAngle) % (Math.PI * 2);
		
		// here we set the new heading based on proximity (herding)
		currentHumanoid.heading = Math.round(newHeading * 1000) / 1000;
		
		// slow down if near an attractor
		if (attraction > 0)
		{
			currentHumanoid.runSpeed = currentHumanoid.maxRunSpeed * distance / 40;
		}
	}
};