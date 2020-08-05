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

- [x] Singleton asset loader module to prevent the passing of textures from one scene to another.

- [x] Singleton sound manager to control sound across scene boundaries.

- [ ] Singleton species lookup module to track the different available species and their traits.

- [ ] Singleton settings manager to control settings across scene boundaries.

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

### First Contact (World/Ship/Station) Scene

- [ ] Create tutorial for this scene.

- [ ] Add launch section in dev menu for this scene.

- [ ] Add dev menu options for this scene.

- [ ] A panel to show leader of species with which first contact is being made. Their profile and a section for their dialogue.

- [ ] Add meters for leader to show various moods that first officer, communications oficer, and anthropologist are able to make out.

- [ ] Add a panel for communications officer profile and dialogue with options on how to decode language both verbal and non-verbal.

- [ ] Add a panel for first officer and dialogue with options on how they should procede.

- [ ] Add a panel for the anthropologist and dialogue with options on how to "interpret" alien language, and what items to use for ceremonial trade at final stage.

- [ ] If player makes it to ceremonial trade stage of first contact, and player has chosen item(s) for trade, a new centrally located panel appears over the others to display mini-cutscene.

- [ ] Add cutscene for successful exchange of items to finish first contact.

- [ ] Add cutscene of unsuccessful first contact (If ship, they leave. If station or planet, player is "escorted" to border, and returns to node-vertex map view).

### Improve Relations Scene

- [ ] Create tutorial for this scene.

- [ ] Add launch section in dev menu for this scene.

- [ ] Add dev menu options for this scene.

- [ ] Identical to the trade with world/ship/station scene except all items move in one direction: from player to other race.

- [ ] Meters suggesting mood will appear around the race's leader like in trade scene, but more specific to political temperment.

- [ ] The overall relationship meter will be centralized.

- [ ] The overall success of the encounter meter will be a miniature version of the overall, and when hovered over, it will show the modification it has on the overall meter.

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

### Orbit Around Planetary Body Scene

- [ ] Create tutorial for this scene.

- [ ] Add launch section in dev menu for this scene.

- [ ] Add dev menu options for this scene, which need to include which set of scenes are possible to player.

- [ ] Use dev options from other sections to populate the scene player chooses.

- [ ] Depending on planet type, pick randomly from that category of texture to use in scene. Either store texture id once shown, or have it already chosen at initial galaxy generation.

- [ ] Depending on species and tech level, present only the relevant communication options.

- [ ] This is an intermediate scene between node-vertex map and mini-games available to user at this planet.

- [ ] Add panel for science officer with dialogue to describe the planet's details.

- [ ] Add panel for communications officer with dialogue to describe if there are any signals coming from the planet, and languages in those signals if any.

- [ ] Add panel for anthropologist (if there is intelligent life) with dialogue to describe the cultural details of those lifeforms.

- [ ] Add panel for list of options player can choose at this stage.

- [ ] Add player option for Land & Mine scene.

- [ ] Add player option for Ancient Ruins scene.

- [ ] Add player option for First Contact scene.

- [ ] Add player option for Trade scene (if species is advanced enough).

- [ ] Add player option for Improve Relations scene.

- [ ] Add player option for Ransack scene.

- [ ] Add player option for Take on Crew scene.

### Pirate Encounter Scene

- [ ] Create tutorial for this scene.

- [ ] Add launch section in dev menu for this scene.

- [ ] Add dev menu options for this scene.

- [ ] Add a panel for priate leader profile and dialogue.

- [ ] Add a meter to show relative strength in offensive weaponry between your ship and pirate fleet.

- [ ] Add a meter to show relative strength in defensive weaponry between your ship and pirate fleet.

- [ ] Add panel for list of player choices.

- [ ] Add player choice to pay the requested tribute.

- [ ] Add a meter to show how probable the pirates are to attack even with the tribute.

- [ ] Add player option to refuse to pay tribute.

- [ ] Add player option to sneak attack.

- [ ] Add option to secretly hide a bomb in the tribute to cripple pirate ship (Only available if player possesses x amount of a rare material tbd).

- [ ] Add dialogue for when pirates attack anyway after tribute.

- [ ] Add dialogue for when pirates attack after tribute refused.

- [ ] Add dialogue for when pirates accept tribute and leave. "Pleasure doing business with you."

- [ ] Add possibility where player's offensive/defensive stats far outway that of the pirates, th eplayer can demand tribute from the pirates.

- [ ] If player cripples pirate ship via sneak attack or hidden bomb, pirates will offer tribute. You can accept and take the tribute, or refuse and destroy them. Destroyed, they offer little more than scraps and crew morale drops a little.

- [ ] If pirates attack, scene transitions battle scene (prepopulated for pirate mode).

- [ ] Losing in pirate battle mode due to surrender by player will lead to heavy loses in crew and material (crippling).

- [ ] Losing in pirate battle mode without surrendering ends in destruction and an end to the game.

- [ ] Winning in pirate battle mode due to pirate surrender results in large tribute.

- [ ] Winning in pirate battle mode without pirate surrender leads to their destruction and very little material reward (maps maybe). This won't decrease crew morale.

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

- [x] Add launch section in dev menu for this scene.

- [ ] Add dev menu options for this scene.

- [ ] Create help screen button.

- [ ] Create tutorial for this scene.

### Ship/Station in Distress Scene

- [ ] Create tutorial for this scene.

- [ ] Add launch section in dev menu for this scene.

- [ ] Add dev menu options for this scene.

- [ ] Add case where player arrives too late, and the ship is adrift without crew.

- [ ] Add case where ship has hull damage and needs repair soon (dangerous).

- [ ] Add case where reactor is melting down and needs repair soon (very dangerous).

- [ ] Add case where ship needs something (fuel, materials, etc.) in order to be on their way again (not dangerous).

- [ ] Add case where ship has some kind of plague, and need medical attention (dangerous). In some cases, not solving this will mean the spread of disease across systems.

- [ ] Add way for level of sensor tech to improve the amount of info available.

- [ ] Success could mean more crew, materials, improved relations, or discovered nodes on the node-vertex map (helps find points like ancient ruins).

- [ ] Failure can result in loss of crew, materials, decreased relations with that species, and possibly the spread of disease across systems.

### Take on Crew Scene

- [ ] Create tutorial for this scene.

- [ ] Add launch section in dev menu for this scene.

- [ ] Add dev menu options for this scene.

- [ ] Any planet/ship/station/encounter can have an opportunity to gain crew.

- [ ] Reputation with that species and/or culture will affect whether this comes up as an option.

- [ ] One panel shows current crew roster. Allows you to cycle through to see name, species, origin, skillset, and morale.

- [ ] Another panel shows over stats affected by your total crew.

- [ ] A final panel shows the current crew member trying to enlist. Like the crew roster panel, this person is not in your crew.

- [ ] The enlisting crew member panel should have a CTA that when hovered over, it shows the crew member's affect on the stats panel.

- [ ] Option only eligible if first contact scene already successfully completed with that species.

- [ ] First officer has to first succeed in a charisma check before crew are interested. Failed attempts could lower reputation with that species.

### Trade World/Ship/Station Scene

- [ ] Create tutorial for this scene.

- [ ] Add launch section in dev menu for this scene.

- [ ] Add dev menu options for this scene.

- [ ] Two dialogue boxes: one for your side, and the other for the leader of those being traded with.

- [ ] Use a profile image for trade leader.

- [ ] Use a profile image of your assigned first officer (communications officer if first officer not assigned) in left box.

- [ ] No communications officer assigned precludes the possibility of this scene taking place.

- [ ] Add character noise in trader's dialogue to demonstrate ship's ability to translate the language.

- [ ] Depending on the experience with the species, the translation is better. Having crew of that species will help, but even different dialects can confuse meaning.

- [ ] Add another panel to show what you have available to trade.

- [ ] Some of the items you have to trade might have special meaning to the trader. More crew of that species and experiences with that species might reveal those meanings.

- [ ] Add another panel to show what the aliens are "willing" to trade.

- [ ] Every trade involves round involves putting what you are willing to trade. The trader will put up what they want to trade for it, or vice versa. The person who went first can "encourage" the other party that they expect more.

- [ ] Add meters around trader profile to signal mood reflectors (some hidden with lack of experience of that species and culture). Frustration meter, deception, disappointment, offence, etc.

- [ ] Multi-system species or federations of species that span multiple systems will have currencies. Some will be material like gold, and some will be electronic. Player can choose to stockpile these currencies if the trader lacks goods the player wants, and still needs to offload some surplus. The electronic currencies take up no inventory, and can be used with traders of that species/federation in other systems.

- [ ] It's possible to improve or worsen reputation when trading. Usually undercutting a desperate trader or being overly generous.

### Travel In-progress Scene

- [ ] Create tutorial for this scene.

- [ ] Add launch section in dev menu for this scene.

- [ ] Add dev menu options for this scene. Among them should be random encounter possibilities: wormholes, asteroid/rogue-planets for mining or ancient ruins to explore, black holes, pirate battles, ship in distress (could be pirates, or two parties duking it out), military engagement against player.

- [ ] Add 3D model of ship from engines in forefront, looking over the ship's top with head pointing toward background.

- [ ] Add stars in motion closer ones as lines, and farther ones as pin points.

- [ ] Add star textured background to account for 80% or more of the stars.

- [ ] Every vertex between major nodes has unseen "smaller" nodes that can only be "noticed" as the player passes through them. These are random encounters, and are decided after player confirms jump between those two larger nodes.

- [ ] Add question mark graphic thing blinking in the corner of HUD that shows something is in range. Clicking it brings up a lit of options. Sensor tech might give more details. Options include: Stopping to investigate, mark it on the node-vertex map, ignoring it, or expending resources to boost the sensors for more info.

- [ ] Add alert to user if they stop to investigate, they will not regain the fuel they spent to make the jump.

- [ ] Regardless of user choice, the smaller node will appear on the node-vertex map. If they chose to ignore it, it will just be a question mark without details.

- [ ] No steering, only watching and waiting. The engine's exhaust should be swirling color, almost hypnotic. The head of the ship should have a light energy half-sphere that randomly flickers (as debris hits it).

- [ ] A few random encounters force user to stop without a choice. Some advanced species have the equivalent of a net that interferes with this almost FTL travel. This is most likely used by either a warlike race's military encounter, or that of a species the player has royally pissed off somehow. Also, blackholes can pull player from their course.

### Wormhole Scene

- [ ] Create tutorial for this scene.

- [ ] Add launch section in dev menu for this scene.

- [ ] Add dev menu options for this scene.

- [ ] Show wormhole swirling large in the center of the screen through the bridge's main viewscreen.

- [ ] Add sounds of beeps, click, and murmur from the crew. From outside there is a loud whooshing sound from the wormhole (made possible by speakers on the bridge to amplify whatever sensor picks up as their is no sound in space).

- [ ] In one corner their needs to be a readout of remaining fuel, and another to show the cost in fuel for each action.

- [ ] Add an area that shows a signal coming from the wormhole in some cases (also relevant to sensor tech level and science officer skill). Faded if not available.

- [ ] Add an area where there might be a "glimpse" of what's on the other side (very high sensor level tech and science officer skills only). Faded if not available.

- [ ] Add text description area to display explanations of these areas and readouts when player hovers over them.

- [ ] At best, the player can glean from these sensors and skills one of the following about the wormhole: closer to home, farther from home, and same distance but different location.

- [ ] The mysteries uncovered in some ancient ruins will reveal the above about a specific wormhole. If that wormhole is not yet discovered, the "connection" will be made when they do discover it. "We'll know it when we see it" the anthrolopolgist with reassure you when discovering such a mystery in an ancient ruin.