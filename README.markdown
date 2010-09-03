# Zombie Simulator #

- Version: 0
- Date: 27th August 2010
- Github Repository: <http://ravi-rajakumar/Zombie-Simulator>


## Synopsis

The idea of this is to create an application that can simulate two interacting populations of humans and zombies, modeling their behaviors: herding; queueing; fight/flight; food seeking etc. The idea is to see what outcomes are produced based on varying baseline assumptions about their behaviors and physical contraints, and to allow users to modify those starting conditions. There are various game-like interactions that could arise from that framework including:

- achieving equillibrium
- eradicating the zombies
- minimizing human casualties


## Assumptions/Constants

The math in this simulation depends on a number of baseline properties that were arrived at through educated guesswork. The accuracy and value of the program would be increased by replacing those with real numbers through further reasearch or measurement. The following is a list of those assumptions:

- Human walking speed: 3km/hour
- Zombie walking speed: 1km/hour
- Walking speed variance: ± 10%
- Range to see/notice another humanoid: 20m
- Range at which humans recognize zombies: 1m on day 1, increasing to 10m by day 3
- Range at which zombies recognize humans: 10m
- Chance in any one round of a fight that the human will be bitten: 10%
- Chance in any one round of a fight that the human will die: 10%
- Chance in any one round of a fight that the zombie will be stunned: 10%
- Chance in any one round of a fight that the zombie will be destroyed: 10%
- Variance in direction of humanoid travel, absent external influences: ± 45 degrees/minute


## Units

- Units are metric.
- Base distance is 1m.
- One turn = 1 minute. One day = 1440 turns.
- Two objects can't occupy the same space; for humanoids this can be represented by not allowing - the distance between two humanoids to be less than 1m.
- We can start with a roughly 480px square canvas to be iPhone compatible, and have 1px = 20m for the initial scale.
- Heading could be noted in radians, clockwise from North

