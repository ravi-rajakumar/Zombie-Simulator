# Version History

### 1.0.8
- 12-30-2010
- fix to cap human learning (by word-of-mouth) so that it's more realistic -- humans can only improve so far without first-hand experience
- fix to fight mechanics so that zombie 'stun' rate is inversely proporttional to human zombie-killing skill. This follows a steep, almost stepped curve; when humans know to destroy the brain, the chances that they will leave zombies stunned approach zero

### 1.0.7
- 12-19-2010
- fixed errors causing death events to fail
- finally fixed bug where zombification cancellations were failing to happen correctly, resulting in negative numbers of 'pending zombies'
- revisions to checks for alive/dead state
- refactored a lot of zombification code to remove logic that could result in immune humans
- data from this point forward is not comparable with past versions
- fix to make 'flash' function for highlighting fights asyncronous with steps in the main loop

### 1.0.6
- 12-18-2010
- fixed a problem where people attacked from outside their field of view were retaliating too quickly

### 1.0.5
- 12-16-2010
- fixed an inconsistency in combat logic for zombies
- reverted a change in human behavior that was rendered unnessecary byt a later improvement in combat logic
- fixed a bug where zombie timers left over from previous runs were persisting into new ones


### 1.0.4
- 12-13-2010
- fixes to human influence and learning to account for sleep

### 1.0.3
- 12-12-2010
- added inspector for analyzing information about individual humanoids by clicking them on the map
- minor improvement to combat-related logic
- bugfix to human aggression overcoming natural repulsion toward zombies

### 1.0.2
- 12-7-2010
- fix to combat logic so that humans who are directly attacked will defend themselves

### 1.0.1
- 12-5-2010
- more realistic default crowding density
- editable max crowding density

### 1.0
- 12-4-2010
- first release