# Zombie Simulator, AKA The Living Dead

- Version: 0
- Date: 27th August 2010
- GitHub Repository: <http://github.com/ravi-rajakumar/Zombie-Simulator>

## Synopsis

This is a web application for simulating interacting populations of humans and zombies. It should mathematically model such behaviors as:

- Herding
- Queueing
- Fight and flight
- Competition
- Selflessness
- Rest and recovery

The application's purpose is to enable users to see what outcomes are produced based on various starting conditions and baseline assumptions about the populations' behaviors and physical constraints. Users can then test hypotheses about the relative advantages of specific characteristics by experimenting with different starting conditions. There are various game-like objectives that could arise from this framework, including:

- Achieving equillibrium
- Eradicating the zombies
- Minimizing human casualties

## Controls

Generally the intended use is to set the starting conditions and then run the simulation and allow it to take its course. The controls are:

- setup: initialize the map with values from the current settings
- play: start the simulation
- stop: pause the simulation
- settings: set the starting conditions and make in-flight changes
- spacebar: start/stop
- return: open/close the settings panel and commit any changes if closing it

in-flight changes can be made for: human herding; human queueing; zombie herding; zombie brain-eating success; timelapse

## Assumptions

The math in this simulation depends on a number of baseline properties that were arrived at through educated guesswork. The accuracy and value of the program would be increased by replacing those with real numbers through further research or measurement. The following is a list of those assumptions:

- Average human walking speed: 4.8km/hour (verified, Wikipedia)
- Average human running speed: 3x walking speed
- Average zombie walking speed: 1.6km/hour
- Walking speed variance: ±10%
- Range to see/notice another humanoid: 20m
- Range at which humans recognize zombies: 1m on day 1, increasing to 10m by day 3
- Humans get better at recognizing zombies after encountering them. Within three encounters they jump to the max of 10m.
- Range at which zombies recognize humans: 10m
- Chance in any one round of a fight that the human will be bitten: 10%
- Chance in any one round of a fight that the human will die: 1%
- Humans learn from fights and their proficiency improves to a maximum of 22 times a zombie's killing proficiency (about a 63% chance of killing the zombie in an average 4-round fight)
- Zombies are five times as likely to be only temporarily killed in a fight as permanently killed
- Interval between actions in a fight: 1s
- Variance in direction of humanoid travel, absent external influences: ±12.25 degrees/minute
- Effective human visual field: 120º
- Time to turn zombie: 3 hours
- Natural Human Birth Rate: 14/k/year
- Natural Human Death Rate: 8/k/year

## Units

- Units are metric.
- Base distance is 1m.
- Two objects can't occupy the same space
- Heading is noted in radians, clockwise from North

## Glossary

- herding: tendency to gravitate to one's own kind
- queueing: used here to describe tendency to follow in same direction as those around you
- zombie brain-eating success rate: zombies' average likelihood to completely consume victims' brains, preventing them from coming back as a zombie
