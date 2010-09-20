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

- setup: initialize the map with values from the curret settings
- play: start the simulation
- stop: pause the simulation
- settings: set the starting conditions and make in-flight changes
- spacebar: start/stop
- return: open/close the settings panel and commit any changes if closing it

in-flight changes can be made for: human herding; human queueing; zombie herding; zombie brain-eating success; timelapse

## Assumptions

The math in this simulation depends on a number of baseline properties that were arrived at through educated guesswork. The accuracy and value of the program would be increased by replacing those with real numbers through further reasearch or measurement. The following is a list of those assumptions:

- Average human walking speed: 4.8km/hour (verified, Wikipedia)
- Average zombie walking speed: 1.6km/hour
- Walking speed variance: ±10%
- Range to see/notice another humanoid: 20m
- Range at which humans recognize zombies: 1m on day 1, increasing to 10m by day 3
- Range at which zombies recognize humans: 10m
- Chance in any one round of a fight that the human will be bitten: 10%
- Chance in any one round of a fight that the human will die: 10%
- Chance in any one round of a fight that the zombie will be stunned: 10%
- Chance in any one round of a fight that the zombie will be destroyed: 10%
- Variance in direction of humanoid travel, absent external influences: ±12.25 degrees/minute
- Effective human visual field: 120º
- Time to turn zombie: 3 hours

## Units

- Units are metric.
- Base distance is 1m.
- Two objects can't occupy the same space
- Heading is noted in radians, clockwise from North

## Glossary

- herding: tendency to gravitate to one's own kind
- queueing: used here to describe tendency to follow in same direction as those around you
- zombie brain-eating success rate: zombies' average likelihood to completely consume victims' brains, preventing them from coming back as a zombie
