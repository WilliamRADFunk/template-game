# The Enzmann
(In Progress) A space odyssey to reach home after being flung far into the deep reaches of the galaxy.</br></br>

***

## Intro

Reach home.</br></br>

***

## Instructions

Do stuff

***

## Endgame

Reach home or die

***

## Classes

Detailed [documentation](docs/README.md)</br></br>

***

## First Steps

1. Navigate to the root folder where you want your project to reside.</br></br>

2. Run `git clone https://github.com/WilliamRADFunk/enzmann.git`.</br></br>

3. Run `npm install`. If failure, see Common Gotchas section below.</br></br>

4. Run `npm run start` and then simply navigate to `http://localhost:8080` in your browser.</br></br>

***

## New to Gulp

-- Make sure to install Gulp at the global level, as this is a necessary step to make the boilerplate's scripts run.</br></br>

`npm install -g gulp`</br></br>

***

## Common Gotchas

--Might get a failure to fully install when running `npm install`</br></br>

Try running `npm install --ignore-scripts`</br></br>

-- Might get the error</br>
"Error: ENOENT: no such file or directory, scandir 'your-path/small-project-boilerplate\node_modules\node-sass\vendor'"</br></br>

To remedy this, simply run `npm rebuild node-sass`</br></br>

-- If you're running the `npm run readme` command, and your classes are not all present.</br></br>

Make sure you aren't importing a capitalized version of the name (ie. `import { Doug } from './Doug'` when it should in fact be `import { Doug } from './doug'`) assuming of course you've name the file with standard camelCase.

## Remaining TODOs

### All Global Modules

- [ ] Singleton repair module that updates the repair state of the ship even when not in repair ship scene.

- [ ] Singleton game state module that tracks larger state factor such as is ship in jump motion, which precludes repairs being made during that time.

### Ancient Ruins Scene

- [ ] Add tiles with animated graphics (fish jump in and out of water, tentacles in water, flying bird-like critters).

- [x] Add moving clouds overhead.

- [x] Add fog of war.

- [x] Make overhead tiles semi-transparent when a crew member is within certain range.

- [x] Make terrain of various colors and types (ie. purple grass, yellow water, etc.).

- [ ] Add obstruction objects like bounders, cliffs, and so on.

- [x] Add multiple types of water bodies: large and small lakes, rivers with a bridge, narrow creeks, and beaches.

- [x] Add text description of tiles player clicks on as well as descriptions about the crew members they choose to activate.

- [ ] Make cemetery ruins, city ruins, library ruins, military ruins, monastery ruins, town ruins, village ruins.

- [x] Add crew members according to their positions (red for security, blue for science and medical, and yellow for command).

- [ ] Add mystery tiles (20 earth-like things that have disappeared over the years. Collect them to gain bonuses with wormholes).

- [ ] Add dev menu options for the mystery tile options.

- [ ] Create return type for when scene is complete.

- [ ] Animation of ship landing, and leaving.

- [ ] Create "action" buttons for each crew member.

- [ ] Create hazard suit and health bars for each crew member.

- [ ] Add action buttons for each team member type.

- [ ] Path finding algo to verify every interactable tile can be reached.

- [x] Path finding algo for team member to follow.

- [ ] Generate trigger tiles that spawn random encounters (ie. traps that potentially hurt crew, fights against monsters, etc.).

- [ ] Add reward tiles. Valuable materials, technology, food, and potentially new crew members if discovered.

- [ ] (Optional) Reduce the memory footprint of using so many tiles.

### Land & Mine Scene

- [x] Create a lander module that is pulled by gravity, and has both vertical and horizontal thrusters.

- [x] Create collision detection with land to crash if speed is too high, or not enough solid adjacent blocks (3 or 4) beneath ship.

- [x] Create oxygen meter for crew. When empty, kill crew but return rocket.

- [x] Create fuel meter for lander module. When empty, disable all thrusters.

- [x] Enable ability for lander improvements to improve gameplay (ie. Can land at greater speed, slower fuel burn, etc.).

- [x] Create an exit area the lander must reach to be considered "escaped", and materials recovered (successful minigame end).

- [x] Create help screen button.

- [x] Create tutorial for this scene.

- [x] Add dev menu options for this scene.

- [ ] (Optional) - Give up to three landers if player has built them. They must spend more crew to operate the new landers, though.

### Load Screen

- [x] Create main menu option for load screen.

- [ ] Create dev menu option for load screen.

- [ ] Detect if save code is in url, and prepopulate load field with that code.

- [ ] Add clear all option to remove code present, and set cursor over first spot.

- [ ] Add load from url button that populates code area with code from url.

- [ ] Add more code slots for a larger more complex code.

### Main Help Screen

- [x] Create main menu option for help screen.

- [ ] Create dev menu option for help screen.

- [ ] Create big picture help in main help screen, pointing out that each scene will have greater help details relevant to that given scene.

### Ransack Planet Scene

- [ ] Create scene launch section in dev menu.

- [ ] Create limited ability to move the tiny ship because it is far away in perspective of the planet.

- [ ] Create an escape/leave area that the ship must navigate to if it is to leave. Note: player will never reach this if their engines have been disabled by damage.

- [ ] Create variable number of planet defense weapons: nuke silo, satellite missile launchers, possible EMP weapon that disables ship when shields down, and just shields when they were up.

- [ ] Planet defenses primarily block ships incoming weapons, and secondary fire at ship.

- [ ] Both planet and ship must have a finite amount of ammunition.

- [ ] Player can lose crew when ship is hit.

- [ ] Player will have multiple target possibilities: defenses, civilian buildings, power providers (shields).

- [ ] Destroying civilian targets will break the will of the planet faster, but make rewards fewer, crew morale lower, and lower reputation.

- [ ] Destroying military targets will reduce the accuracy of the planets weapons.

- [ ] Destroying the defenses will obvious render them inoperable.

- [ ] Destroying power providers will render their shield (if they have one) inoperable.

- [ ] Any use of this scene will lower crew morale, and ship reputation, regardless of the outcome.

- [ ] Depending on the number of civilian targets destroyed, a little ship will rise from the planet to greet player's ship containing the tribute. The end.

- [ ] Reputation is can rise and fall depending on race being ransacked. If it's a race at war with everyone else, reputation will fall with them, but possible rise with those other races.

### Repair Ship Scene

- [ ] Create scene launch section in dev menu.

- [ ] Show ship in profile with interior sections.

- [ ] Add little red dots that move about the ship's image as repair crew.

- [ ] Add list of existing repair crews available to players. Make clickable.

- [ ] Allow repair crew list expandable to show individual crew part of each team.

- [ ] Not all crews are equal as their ability to move quickly and repair quickly depends on the skills of their individual members.

- [ ] Repair crew team health and effectiveness is a sum of the individuals. Dead crew in one means they might move slower and repair slower.

- [ ] When instructing a repair crew to repair a section of the ship, there is a resource cost. Without resources, they can always repair it to a bare minimum (Gerry-rigged), and likely to break at the first sign of trouble.

- [ ] Repairs can't be down while ship is in jump motion, and repair time is done in-game time.

- [ ] Ships sections should be color coded based on their level of damage.

- [ ] Ship statistics should be available for each room, showing how the damage is affecting that portion of the ship.

- [ ] Must be able to enter, leave, and re-enter this scene and maintain state. Global controller must be monitoring and updating repairs (Global singleton).

- [ ] Add dev menu options for all of the above features.

- [ ] (Optional) - Create an initial mock scene that demonstrates the global updating of the repairs even in dev menu mode.

### Settings Panel

- [ ] Populate the "Settings" Panel with settings related options.

### Ship Layout Scene

- [x] Create grid of squares to represent areas of ship for interaction.

- [x] Create text that changes depending on which grid square the user hovers the mouse.

- [x] Create menu options associated with a selected grid square (Add or remove tech points).

- [x] Add descriptions of the rooms when selected.

- [x] Prefill some of the tech points for some of the room as minimum requirements (Must have engines...obviously).

- [x] Create limit on tech point upgrading overall and in specific rooms.

- [x] Add a confirm layout button.

- [x] Return user selection in an expected format when user clicks submit.

- [x] Add a reset to starting values button.

- [ ] Add dev menu options for this scene.

- [ ] Create help screen button.

- [ ] Create tutorial for this scene.
