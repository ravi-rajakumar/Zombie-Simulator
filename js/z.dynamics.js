z.humanoidInfluence = function (currentHumanoid, neighbor, distance) {
	var attraction = 0,
		persuasion = 0,
		walkingSpeed = currentHumanoid.maxWalkingSpeed,
		neighborHorizontalDelta = Math.sin(neighbor.heading),
		neighborVerticalDelta = 0 - Math.cos(neighbor.heading),
		diffX = neighbor.position.x - currentHumanoid.position.x,
		diffY = neighbor.position.y - currentHumanoid.position.y,
		headingScale = (distance > 0) ? walkingSpeed / distance : 1,
		currentHumanoidAngle = 0,
		newHeading = 0,
		influence = 0,
		allforces = 0,
		influenceEffect = {x:0,y:0,w:0};
	
	// humans automatically bounce off of other bodies that are too close to them
	if (distance < 0.25 && !currentHumanoid.isZombie() && !neighbor.isZombie()) {
		currentHumanoid.setPosition(currentHumanoid.position.x - (diffX * 0.25 / distance), currentHumanoid.position.y - (diffY * 0.25 / distance));
	} else {
		influence = ((diffY) >= 0) ? Math.PI - Math.asin((diffX) / distance) : (Math.PI * 2 + Math.asin((neighbor.position.x - currentHumanoid.position.x) / distance)) % (Math.PI * 2);
		
		// can currentHumanoid actually see or hear the neighbor?
		if (Math.abs(currentHumanoid.heading - influence) <= z.fieldOfView / 2) {
			if (!currentHumanoid.isZombie()) {
				// humans are automatically attracted to other humanoids unless they recognize them as zombies
				if (!neighbor.isZombie() || !currentHumanoid.recognizes(neighbor)) {
					attraction = z.humanHerding;
					persuasion = z.humanQueueing;
					
				} else {
					attraction = -1;
					persuasion = 0;
					// drop everything and run away for 10 seconds
					currentHumanoid.actionQueue = [];
					for (var i = 0; i < (10 / z.secondsPerTurn()); i++) {
						currentHumanoid.actionQueue.push('run');
					}
					// after an encounter with a zombie, humans learn to recognize them better
					if (currentHumanoid.recognitionRange < 10) {
						currentHumanoid.recognitionRange += 3;
					}
				}
			}
			
			// zombies are strongly attracted to humans
			if (currentHumanoid.isZombie() && !neighbor.isZombie()) {
				attraction = 10;
				persuasion = 1;
			}
			
			if (currentHumanoid.isZombie() && neighbor.isZombie()) {
				// zombies are somewhat attracted to each other
				attraction = z.zombieHerding;
				persuasion = z.zombieQueueing;
			}
			
			// apply herding effect
			currentHumanoid.influences.x += headingScale * (neighbor.position.x - currentHumanoid.position.x) * attraction;
			currentHumanoid.influences.y += headingScale * (neighbor.position.y - currentHumanoid.position.y) * attraction;
			
			// apply queueing effect, with a random chance, based on boredom coefficient of breaking out of the pack
			if (Math.random() < z.humanBoredomFactor() * 2 * z.secondsPerTurn() && persuasion > 0 && !currentHumanoid.isZombie()) {
				currentHumanoid.heading = (currentHumanoid.heading + Math.PI) % (Math.PI * 2);
			} else {
				currentHumanoid.influences.x += neighbor.lastMove.dx / z.secondsPerTurn() * persuasion;
				currentHumanoid.influences.y += neighbor.lastMove.dy / z.secondsPerTurn() * persuasion;
			}
			
			// add to count of influences
			currentHumanoid.influences.w += 1;
	
			// too much crowding in one spot makes that location less appealing
			if (currentHumanoid.influences.w > 16 * z.humanHerding) {
				// this reflects the value off of an upper bound and applies it to 'attractiveness' of the location
				currentHumanoid.influences.a -= currentHumanoid.influences.w - (16 * z.humanHerding);
			} else {
				currentHumanoid.influences.a += attraction / distance;
			}
				
			// store the distance to the nearest attractor for calculating whether to idle
			if (distance < currentHumanoid.influences.r && attraction > 0) {
				currentHumanoid.influences.r = distance;
			}	
		}
	}
};

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

	// how long (in whole seconds) since we last performed fight actions
	seconds = Math.floor(z.simulatedTimeElapsed - humanoid.lastActionTimeStamp);
	
	// check to see whether a whole second has gone by since the last action and to be sure that oth humanoids are still on the field
	if (seconds >= 1) {
		try {
			if (humanoid.isZombie()) {
				zombie = humanoid;
				human = neighbor;
			} else {
				human = humanoid;
				zombie = neighbor;
			}	
			
			zombieStunChance = (human.zombieKillingFitness <= 0.18) ? human.zombieKillingFitness * 5 : 0.9; // 5% chance by default but improved in more experienced humans
			zombieDieChance = human.zombieKillingFitness; // 1% chance by default but improved in more experienced humans
			
			// update the human's zombie killing skill for the next fight they have
			if (human.zombieKillingFitness < 0.16) {
				human.zombieKillingFitness += 0.07;
			}
			
			// over-tired humans will fight less efficiently, bottoming out at -100 stamina
			if (human.stamina < 0) {
				zombieDieChance = zombieDieChance * (100 - Math.abs(human.stamina)) / 100;
			}
			
			humanTargeted = (zombie.currentTarget === human);
			zombieTargeted = (human.currentTarget === zombie);
		
			// do one action per second
			for (var i = 0; i < seconds; i++) {
	
				z.flash(human);
				z.flash(zombie);
				
				/* handling multiple parties in a fight in a new way. participants can only have one focus at a time and only act on that focus.
				*/
				// this only happens if the zombie is actually focused on this human
				if (humanTargeted) {			
					if (Math.random() < biteChance) {
						if (human.zombify !== null) {
							human.zombify();
							human.currentTarget = zombie;
							z.message('human zombify coming...');
						}
					}
					
					if (Math.random() < humanDieChance) {
						if (Math.random() < (z.zombieBrainEatingEfficiency / 100)) {
							human.zombify = null; // the brain is destroyed so this person can't zombify
						}
						human.die();
						z.message('human death');
						zombie.currentTarget = null;
						exit = true;
					}
				}
				
				// this only happens if the human is actually focused on this zombie
				if (zombieTargeted) {	
					if (Math.random() < zombieStunChance) {
						for (var j = 0; j < Math.floor(60 / z.secondsPerTurn()); j++) {
							zombie.actionQueue.push('stunned');	
						}
						human.currentTarget = null;
						exit = true;
					}
					
					if (Math.random() < zombieDieChance) {
						zombie.die();
						z.message('zombie death');
						human.currentTarget = null;
						exit = true;
					}
					
					// fights drain human stamina very quickly
					human.stamina -= (z.simulatedTimeElapsed - human.lastActionTimeStamp) * 100 / 3600;
					// while humans are awake, accrued sleep decays at a rate of 1hr/2hrs awake, resulting in a natural 8 hour per day sleep schedule
					human.slept -= (z.simulatedTimeElapsed - human.lastActionTimeStamp) / 2;
				}
				human.lastActionTimeStamp = z.simulatedTimeElapsed;
				zombie.lastActionTimeStamp = z.simulatedTimeElapsed;
				
				// if they weren't fighting before, they are now
				humanoid.actionQueue = ['fight'];
				neighbor.actionQueue = ['fight'];
				
				// wake up! (later factor in latency in waking up)
				human.sleeping = false;	
				
				if (exit) {		
					human.aggressiveness += Math.random() * 0.2;	
					return;
				}
			}
		} catch (err) {
			// nothing to do here for now
		}
	}
};

z.interact = function (humanoid, neighbor) 
{	
	var distance = z.range(humanoid, neighbor);
	
	// this checks whether the two humanoids should be in combat. The answer is true for zombies who are not stunned and true for humans who are not resting, are encountering a zombie that is not stunned and who meet other criteria for aggressiveness and cooperative.
	if ((distance <= 1) && ((humanoid.isZombie() && humanoid.nextAction() !== 'stunned' && !neighbor.isZombie()) || (neighbor.isZombie() && neighbor.nextAction() !== 'stunned' && !humanoid.isZombie() && humanoid.actionQueue[0] !== 'rest' && !humanoid.sleeping && Math.random() < humanoid.aggressiveness))) {
		humanoid.currentTarget = neighbor;
		humanoid.actionQueue = ['fight'];
	} else if (distance < z.sightRange) {
		z.humanoidInfluence(humanoid, neighbor, distance);
	}
};