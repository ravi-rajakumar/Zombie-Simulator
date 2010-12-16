z.humanoidInfluence = function (currentHumanoid, neighbor, distance) {
	var attraction = 0,
		persuasion = 0,
		walkingSpeed = currentHumanoid.maxWalkingSpeed,
		headingScale = (distance > 0) ? walkingSpeed / distance : 1,
		currentHerding = 0,
		currentQueueing = 0,
		crowding = 0;
		
	// can currentHumanoid actually see or hear the neighbor?
	if (currentHumanoid.isFacing(neighbor, distance) && !currentHumanoid.sleeping || (distance < z.hearingRange && !neighbor.sleeping && neighbor.actionQueue[0] !== 'rest')) {
		currentHerding = currentHumanoid.herding();
		currentQueueing = currentHumanoid.queueing();
		crowding = currentHumanoid.lastInfluences.w;
	
		// add to count of current influences
		currentHumanoid.influences.w += 1;
		
		// too much crowding in one spot makes that location less appealing
		if (crowding > z.maxAttraction * currentHerding / 2) {
			// this reflects the value off of an upper bound and applies it to 'attractiveness' of the location
			currentHerding = currentHerding - (crowding / z.maxAttraction);
			if (currentHerding < -1) {
				currentHerding = -1;
			}
		}
	
		// are the current humanoid and neighbor the same type or assumed to be? humans are automatically attracted to other humanoids unless they recognize them as zombies
		if (currentHumanoid.isZombie() === neighbor.isZombie() || !currentHumanoid.recognizes(neighbor)) {
			attraction = currentHerding;
			persuasion = currentQueueing;
			// learn how to fight from neghboring humans who are close enough to communicate
			if (distance < 2 && !currentHumanoid.isZombie() && currentHumanoid.zombieKillingFitness < neighbor.zombieKillingFitness && !neighbor.sleeping) {
				// 10 minutes of conversation will get the learner to halfway between their own ability and their teacher's
				var ck = currentHumanoid.zombieKillingFitness, nk = neighbor.zombieKillingFitness;
				currentHumanoid.zombieKillingFitness += ((ck + nk) / 2 - ck) * z.secondsPerTurn() / 600;
			}
		} else if (!currentHumanoid.isZombie()) {
			if (neighbor.currentTarget !== null) {	
				// overcome negative influence with any heroism that the human possesses, expending it in the process
				attraction = currentHumanoid.showHeroism() + (currentHumanoid.aggressiveness * 2) - 1;
				persuasion = 0;
			} else {
				attraction = (currentHumanoid.aggressiveness * 2) - 1;
				persuasion = 0;
				if (attraction < 0) {
					// drop everything and run away for 10 seconds if the human is not going to fight
					currentHumanoid.actionQueue = [];
					for (var i = 0; i < (10 / z.secondsPerTurn()); i++) {
						currentHumanoid.actionQueue.push('run');
					}
				}
			}
			// after an encounter with a zombie, humans learn to recognize  them better
			if (currentHumanoid.recognitionRange < 10) {
				currentHumanoid.recognitionRange += 3;
			}
		// zombies are strongly attracted to humans
		} else {
			// drop everything
			currentHumanoid.influences = {x:0,y:0,w:1,a:0,r:20};
			attraction = 1;
			persuasion = 0;
		}
		
		// apply herding effect
		currentHumanoid.influences.x += headingScale * (neighbor.position.x - currentHumanoid.position.x) * attraction;
		currentHumanoid.influences.y += headingScale * (neighbor.position.y - currentHumanoid.position.y) * attraction;
		
		// apply queueing effect, with a random chance, based on boredom coefficient of breaking out of the pack
		if (Math.random() < z.humanBoredomFactor() * 2 * z.secondsPerTurn() && persuasion > 0 && !currentHumanoid.isZombie()) {
			currentHumanoid.heading = (currentHumanoid.heading + Math.PI) % (Math.PI * 2);
		} else {
			currentHumanoid.influences.x += neighbor.nextMove.dx / z.secondsPerTurn() * persuasion;
			currentHumanoid.influences.y += neighbor.nextMove.dy / z.secondsPerTurn() * persuasion;
		}
		
		currentHumanoid.influences.a += attraction / distance;
			
		// store the distance to the nearest attractor for calculating whether to idle
		if (distance < currentHumanoid.influences.r && attraction > 0) {
			currentHumanoid.influences.r = distance;
		}	
	}
};

z.collide = function (humanoid, neighbor, distance) {
	var newX = 0,
		newY = 0;
		
	// coordinates to simply bounce to minimum distance
	newX = humanoid.position.x - (neighbor.position.x - humanoid.position.x) * ((0.25 / distance) - 1);
	newY = humanoid.position.y - (neighbor.position.y - humanoid.position.y) * ((0.25 / distance) - 1);
	
	if (isNaN(newX) || isNaN(newY) || newX < 0 || newX > z.canvasWidth * z.scale || newY < 0 || newY > z.canvasHeight * z.scale) {
		// this more complex collision/flocking is only performed when the simpler bounce won't work
		z.flock(humanoid);
	} else {
		humanoid.setPosition(newX, newY);
	}
};

z.flock = function (humanoid) {
	// pick a random heading on a hexagonal grid
	humanoid.heading = z.flockAngle;
	humanoid.heading = humanoid.adjustHeading();		
	humanoid.nextMove.dx = Math.sin(humanoid.heading) * humanoid.walkingSpeed * z.secondsPerTurn();
	humanoid.nextMove.dy = 0 - Math.cos(humanoid.heading) * humanoid.walkingSpeed * z.secondsPerTurn();
	humanoid.move();
	// humanoid turns back around to face the way they came
	humanoid.heading = (humanoid.heading + Math.PI) % (2 * Math.PI);
	z.flockAngle = (z.flockAngle + (Math.PI / 3)) % (2 * Math.PI);
};

z.fight = function (humanoid, neighbor) {
	var biteChance = 0.1,
		humanDieChance = 0.01,
		zombieStunChance = 0.05,
		zombieDieChance = 0.01,
		zombie = null,
		human = null,
		zombieTargeted = true,
		humanTargeted = true,
		seconds = 0,
		distance = 0,
		exit = false;

	// how long (in whole seconds) since we last performed fight actions
	seconds = Math.floor(z.simulatedTimeElapsed - humanoid.lastActionTimeStamp);
	
	// check to see whether a whole second has gone by since the last action
	if (seconds >= 1) {
		try {
			// check to be sure that targets are still in range
			distance = z.range(humanoid, neighbor);
			if (distance <= 1) {
				if (humanoid.isZombie()) {
					zombie = humanoid;
					human = neighbor;
				} else {
					human = humanoid;
					zombie = neighbor;
				}	
				
				zombieStunChance = (human.zombieKillingFitness <= 0.18) ? human.zombieKillingFitness * 5 : 0.9; // 5% chance by default but improved in more experienced humans
				zombieDieChance = human.zombieKillingFitness; // 1% chance by default but improved in more experienced humans
				
				// over-tired humans will fight less efficiently, bottoming out at -100 stamina
				if (human.stamina < 0) {
					zombieDieChance = zombieDieChance * (100 - Math.abs(human.stamina)) / 100;
				}			
				
				// if they weren't fighting before, they are now
				if (human.currentTarget === null) {
					if (human.isFacing(neighbor, distance)) {
						human.currentTarget = zombie;
					} else {
						human.face(zombie);
						human.actionQueue = ['fight'];
					}
				}
				if (zombie.currentTarget === null) {
					if (zombie.isFacing(human, distance)) {
						zombie.currentTarget = human;
					} else {
						zombie.face(human);
						zombie.actionQueue = ['fight'];
					}
				}
				
				humanTargeted = (zombie.currentTarget === human);
				zombieTargeted = (human.currentTarget === zombie);
			
				// do one action per second
				for (var i = 0; i < seconds; i++) {
		
					z.flash(human);
					z.flash(zombie);
					
					/* handling multiple parties in a fight in a new way. participants can only have one focus at a time and only act on that focus.
					*/
					// check to see if the zombie is actually focused on this human
					if (humanTargeted) {	
						// check to see whether the human is already dead
						if (human.isAlive()) {
							if (Math.random() < biteChance) {
								if (human.zombify !== null) {
									human.zombify();
									human.currentTarget = zombie;
									z.message('human zombify coming...');
									z.updateStatistics();
								}
							}
						
							if (Math.random() < humanDieChance) {
								if (Math.random() < (z.zombieBrainEatingEfficiency / 100)) {
									// the brain is destroyed so this person can't zombify
									human.zombify = null;
									// remove any pending zombification if the brain is destroyed
									if (human.livetimer !== null) {
										z.clearTimeout(human.livetimer,z.zombieCancel);
									}
								}
								human.die();		
								z.message('human death');							
								z.updateStatistics();
								exit = true;
							}
						zombie.lastActionTimeStamp = z.simulatedTimeElapsed;
						} else {
							exit = true;
						}
					}
					
					// this only happens if the human is actually focused on this zombie
					if (zombieTargeted) {
						// check to see whether the zombie is already dead
						if (zombie.isAlive()) {	
							if (Math.random() < zombieStunChance) {
								for (var j = 0; j < Math.floor(60 / z.secondsPerTurn()); j++) {
									zombie.actionQueue.push('stunned');	
								}	
								exit = true;
							}
							
							if (Math.random() < zombieDieChance) {
								zombie.die();
								z.message('zombie death');							
								z.updateStatistics();
								exit = true;
							}
							
							// fights drain human stamina very quickly
							human.stamina -= (z.simulatedTimeElapsed - human.lastActionTimeStamp) * 100 / 3600;
							// while humans are awake, accrued sleep decays at a rate of 1hr/2hrs awake, resulting in a natural 8 hour per day sleep schedule
							human.slept -= (z.simulatedTimeElapsed - human.lastActionTimeStamp) / 2;
							
							human.lastActionTimeStamp = z.simulatedTimeElapsed;
						} else {
							exit = true;
						}
					}
					
					// wake up! (later factor in latency in waking up)
					human.sleeping = false;	
					
					if (exit) {
						// update the human's zombie killing skill for the next fight they have
						if (human.zombieKillingFitness < 0.16) {
							human.zombieKillingFitness += 0.07;
						}
						if (human.aggressiveness < 1) {
							human.aggressiveness += Math.random() * 0.2;
						}
						
						human.currentTarget = null;
						zombie.currentTarget = null;
						
						// if human survives, they distance themselves from the site of the attack and the zombie body by walking away for 10 seconds
						if (human.isAlive()) {
							human.actionQueue = [];
							for (var k = 0; k < (10 / z.secondsPerTurn()); k++) {
								human.actionQueue.push('walk');
							}
						}
						
						return;
					}
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
	
	// humanoids automatically bounce off of other bodies that are too close to them
	if (distance < 0.25) {
		z.collide(humanoid, neighbor, distance);
	} 
	// this checks whether the two humanoids should be in combat. The answer is true for zombies who are not stunned and true for humans who are not resting, are encountering a zombie that is not stunned and who meet other criteria for aggressiveness and cooperative.
	if (distance <= 1) {
		if (humanoid.isZombie() && humanoid.actionQueue[0] !== 'stunned' && !neighbor.isZombie()) {		
			humanoid.currentTarget = neighbor;
			humanoid.actionQueue = ['fight'];
		} else if (neighbor.isZombie() && !humanoid.isZombie() && neighbor.actionQueue[0] !== 'stunned' && humanoid.actionQueue[0] !== 'rest' && !humanoid.sleeping) {
			if (Math.random() < humanoid.aggressiveness + humanoid.showHeroism()) {
				humanoid.currentTarget = neighbor;
				humanoid.actionQueue = ['fight'];
			} else {
				humanoid.actionQueue = ['run'];
				z.humanoidInfluence(humanoid, neighbor, distance);
			}
		}
	} else if (distance < z.sightRange) {
		z.humanoidInfluence(humanoid, neighbor, distance);
	}
};