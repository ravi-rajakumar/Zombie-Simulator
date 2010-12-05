# Zombie Simulator, AKA The Living Dead

- Version: 1.0.1
- Date: 27th August 2010
- GitHub Repository: <http://github.com/ravi-rajakumar/Zombie-Simulator>

## Synopsis

This is a web application for simulating interacting populations of humans and zombies. The application's purpose is to enable users to see what outcomes are produced based on various starting conditions and baseline assumptions about the populations' behaviors and physical constraints. Users can then test hypotheses about the relative advantages of specific characteristics by experimenting with different starting conditions. There are various game-like objectives that could arise from this framework, including:

- Achieving equillibrium
- Eradicating the zombies
- Minimizing human casualties

It experimentally implements mathematical modeling of the following behaviors:

- Herding
- Queueing
- Learning
- Fight and flight
- Idling
- Boredom
- Fear vs. Aggressiveness
- Selflessness
- Stamina, rest and recovery
- Sleep
- Communications and knowledge transfer

The following real world dynamics and behaviors are planned enhancements:

- Long-term friendship and loyalty
- Physical obstacles, shelter and hiding
- Global state changes based on events (ie. telecomms knocked out)

## Controls

Generally the intended use is to set the starting conditions and then run the simulation and allow it to take its course. The controls are:

- setup: initialize the map with values from the current settings
- play: start the simulation
- stop: pause the simulation
- settings: set the starting conditions and make in-flight changes
- spacebar: start/stop
- return: open/close the settings panel and commit any changes if closing it

In-flight changes can be made for: human herding; human queueing; zombie herding; zombie queueing; zombie brain-eating success; timelapse.

In-flight changes are meant for testing the simulator itself, and invalidate the outcome data.

The simulation automatically ends when either: humans are extinct; or zombies are extinct and zero zombie conversions are pending.

## Assumptions

The math in this simulation depends on a number of baseline properties that were arrived at through educated guesswork. The accuracy and value of the program would be increased by replacing those with real numbers through further research or measurement. The following is a list of those assumptions:

- Average human walking speed: 4.8km/hour (verified, Wikipedia)
- Average human running speed: 3x walking speed
- Average zombie walking speed: 1.6km/hour
- Humans are attracted to other humans (herding and queueing), but resist overcrowding
- Humanoid direction of travel is determined by applying a random variance to their existing heading and then adding all external influences to their choice of direction. Zombies, having no memory will completely drop their previous heading in the presence of any external influences.
- Walking speed variance: ±10%
- Range to see/notice another humanoid: 20m
- Range at which humans recognize zombies: 1m on day 1, increasing to 10m by day 3
- Humans get better at recognizing zombies after encountering them. Within three encounters they jump to the max of 10m.
- Range at which zombies recognize humans: 10m
- Range at which humanoids notice influences by hearing them: 3m
- Chance in any one round of a fight that the human will be bitten: 10%
- Chance in any one round of a fight that the human will die: 1%
- Humans learn from fights and their proficiency improves to a maximum of about 22 times a zombie's killing proficiency
- Zombies are five times as likely to be only temporarily killed in a fight as permanently killed
- Interval between actions in a fight: 1s
- Variance in direction of humanoid travel, absent external influences: ±11.25 degrees/turn
- Effective human visual field: 120º
- Time to turn zombie: 3 hours
- Natural Human Birth Rate: 14/k/year
- Natural Human Death Rate: 8/k/year
- Humans will 'idle' around one another for about 0-3 (randomized) hours before getting bored and wandering off
- Humans have reserves of both sleep and stamia, each of which decay and are replenished by particular rules. Either can dip into negative numbers indefinitely, but as stanina deficits increase, humans become more likely to choose rest to the exclusion of all else, and as sleep is depleted they become more likely to fall asleep while resting.
- Humans rest in stretches of approxinately 2 hours until their stamina is over 50%
- Humans will choose to sleep for around 8 hours if their stamina and sleep time get low enough
- Stamina decays at varying rates depending on the human's actions. 100% of stamina is lost for every: 1 hour of fighting; 2 hours of running; 8 hours of walking; 16 hours of idling.
- Agressiveness determines humans' tendency to attack vs. try to run away when encountering zombies, and is a randomly generated value that's ±10% of the setting for initial human aggressiveness.
- Agressiveness applies to situations where multiple humans are under attack and to the logic for calculating influences on the human's heading while travelling. 
- Agressiveness automatically increases following survival of fights with zombies.
- Selflessness (heroism) is a personality trait that doesn't increase over time, and that allows humans to overcome the urge to run away from a zombie attacking another human. It will overcome at most one negative influence, and then is reset every turn.
- Humans who idle around one another learn how to fight zombies better through conversation. 10 minutes of conversation will get the learner to halfway between their own ability and their teacher's.

## Units

- Units are metric.
- Base distance is 1m.
- Base time unit is 1s.
- Two objects can't occupy the same space
- Heading is noted in radians, clockwise from North

## Data

Results of completed simulations are stored to a database. Because the simulator is meant to record results for a constant set of behavioral and physical conditions, in-flight changes to settings invalidate the data. If the data is invalidated in this way, it isn't sent to the db.

## Glossary

- herding: tendency to gravitate to one's own kind
- queueing: used here to describe tendency to follow in same direction as those around you
- zombie brain-eating success rate: zombies' average likelihood to completely consume victims' brains, preventing them from coming back as a zombie

## Observations

- Some queueing behavior emerges on its own via herding + field of vision
- Human sucess rate (zombie extinction rate) greatly increased with the addition of idling
- Humans exhibit different crowding behaviors given different scales and densities. In larger-scale simulations they tend to idle for longer.