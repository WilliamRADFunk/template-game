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

:black_square_button: Singleton repair module that updates the repair state of the ship even when not in repair ship scene.

:white_check_mark: Singleton asset loader module to prevent the passing of textures from one scene to another.

:white_check_mark: Singleton sound manager to control sound across scene boundaries.

:black_square_button: Singleton species lookup module to track the different available species and their traits.

:black_square_button: Singleton settings manager to control settings across scene boundaries.

:black_square_button: Singleton game state module that tracks larger state factor such as is ship in jump motion, which precludes repairs being made during that time.

### Ancient Ruins Scene

:black_square_button: Add tiles with animated graphics (fish jump in and out of water, tentacles in water, flying bird-like critters).

:white_check_mark: Add moving clouds overhead.

:white_check_mark: Add fog of war.

:white_check_mark: Make overhead tiles semi-transparent when a crew member is within certain range.

:white_check_mark: Make terrain of various colors and types (ie. purple grass, yellow water, etc.).

:black_square_button: Add obstruction objects like bounders, cliffs, and so on.

:white_check_mark: Add multiple types of water bodies: large and small lakes, rivers with a bridge, narrow creeks, and beaches.

:white_check_mark: Add text description of tiles player clicks on as well as descriptions about the crew members they choose to activate.

:black_square_button: Make cemetery ruins, city ruins, library ruins, military ruins, monastery ruins, town ruins, village ruins.

:white_check_mark: Add crew members according to their positions (red for security, blue for science and medical, and yellow for command).

:black_square_button: Add mystery tiles (20 earth-like things that have disappeared over the years. Collect them to gain bonuses with wormholes).

:black_square_button: Add dev menu options for the mystery tile options.

:black_square_button: Create return type for when scene is complete.

:black_square_button: Animation of ship landing, and leaving.

:black_square_button: Create "action" buttons for each crew member.

:black_square_button: Create hazard suit and health bars for each crew member.

:black_square_button: Add action buttons for each team member type.

:black_square_button: Path finding algo to verify every interactable tile can be reached.

:white_check_mark: Path finding algo for team member to follow.

:black_square_button: Generate trigger tiles that spawn random encounters (ie. traps that potentially hurt crew, fights against monsters, etc.).

:black_square_button: Add reward tiles. Valuable materials, technology, food, and potentially new crew members if discovered.

:black_square_button: (Optional) Reduce the memory footprint of using so many tiles.

### Battle Ship to Ship(s) Scene

:black_square_button: Create tutorial for this scene.

:black_square_button: Add launch section in dev menu for this scene.

:black_square_button: Add dev menu options for this scene.

:black_square_button: Adds the enzmann at medium size to the map, starting location dependent on type of battle: if military engagement enzmann starts at side with opponent on opposite side, pirate battle has enzmann at center and pirates circling it, interrupted battle between two sides has both enemies in center battling and ensmann entering from the bottom.

:black_square_button: Opponent ships should be color-coded: all-red for enemies, blue if allies (if player interrupts a battle and takes a side, the side they didn't attack is blue).

:black_square_button: Make enzmann's movements slow and cumbersome.

:black_square_button: Add shields for enzmann.

:black_square_button: Add shields for enemy vessels if they have the tech.

:black_square_button: Add missiles for the enzmann (finite number).

:black_square_button: Add missiles for the enemy if they have the tech (infinite).

:black_square_button: Add lasers for the enzmann if player has the tech (finite based on power supplies).

:black_square_button: Add lasers for the enemy if they have the tech (infinite).

:black_square_button: Add algorithm for movement of enemy ships.

:black_square_button: Add algorithm for enemy ships to use shields.

:black_square_button: Add algorithm for enemy ships to use missiles.

:black_square_button: Add algorithm for enemy ships to use lasers.

:black_square_button: Add algorithm for ship to try and surrender.

:black_square_button: Add algorithm for ship to try and flee.

:black_square_button: Add physics for the collision of ships.

:black_square_button: Add physics for ships to rebound when they strike each other.

:black_square_button: Add debris on the field that can interrupt weapons and block ships (astroids).

:black_square_button: Add basic physics for ships to rebound slightly when hit.

:black_square_button: (Optional) add basic physics for ships to have recoil when firing weapons.

### Black Hole Scene

:black_square_button: Create tutorial for this scene.

:black_square_button: Add launch section in dev menu for this scene.

:black_square_button: Add dev menu options for this scene.

:black_square_button: Add map with large central, swirling black hole, a mini-enzmann on one side, and one or two points to reach on opposing sides of the black hole.

:black_square_button: If more than one endpoint available to user, user must select the point they wish to reach and confirm.

:black_square_button: Once begun, the player must make a series of skill checks to safely reach the point. A or left key held for a period of time to reach the green zone of a radial fillbar. Any combination of A-left, W-up, S-down, d-right.

:black_square_button: Player gets sets number of fails before complete destruction and death.

:black_square_button: For each fail, player loses materials, crew, hull points, or a combo of those.

:black_square_button: If successful, player can pass around the blackhole between those points in the future without the skill checks.

- Note: main map has a number of blackholes that will block player from progressing unless they complete these.

:black_square_button: Add benefits from improved sensor tech or navigation officer skills.

### Crew Roster Scene

:black_square_button: Create tutorial for this scene.

:black_square_button: Add launch section in dev menu for this scene.

:black_square_button: Add dev menu options for this scene.

:black_square_button: Add scrollable list of crew members with basic info: name, species, job category.

:black_square_button: Add filter options for the table: species, job category, skills.

:black_square_button: Add search option to find by name.

:black_square_button: Add ability to click on crew member, and expand to show more detailed information about that crew member: all stats, background, health, etc..

:black_square_button: Add dismiss options to each crew member (faded if not in a position to dismiss crew member).

:black_square_button: Add imprison options to each crew member (faded if not enough room available in the brig).

:black_square_button: Add option to put crew member in medical quarantine.

:black_square_button: Add option to force crew member in for training (which renders them unusable until they are done).

### First Contact (World/Ship/Station) Scene

:black_square_button: Create tutorial for this scene.

:black_square_button: Add launch section in dev menu for this scene.

:black_square_button: Add dev menu options for this scene.

:black_square_button: A panel to show leader of species with which first contact is being made. Their profile and a section for their dialogue.

:black_square_button: Add meters for leader to show various moods that first officer, communications oficer, and anthropologist are able to make out.

:black_square_button: Add a panel for communications officer profile and dialogue with options on how to decode language both verbal and non-verbal.

:black_square_button: Add a panel for first officer and dialogue with options on how they should procede.

:black_square_button: Add a panel for the anthropologist and dialogue with options on how to "interpret" alien language, and what items to use for ceremonial trade at final stage.

:black_square_button: If player makes it to ceremonial trade stage of first contact, and player has chosen item(s) for trade, a new centrally located panel appears over the others to display mini-cutscene.

:black_square_button: Add cutscene for successful exchange of items to finish first contact.

:black_square_button: Add cutscene of unsuccessful first contact (If ship, they leave. If station or planet, player is "escorted" to border, and returns to node-vertex map view).

### Improve Relations Scene

:black_square_button: Create tutorial for this scene.

:black_square_button: Add launch section in dev menu for this scene.

:black_square_button: Add dev menu options for this scene.

:black_square_button: Identical to the trade with world/ship/station scene except all items move in one direction: from player to other race.

:black_square_button: Meters suggesting mood will appear around the race's leader like in trade scene, but more specific to political temperment.

:black_square_button: The overall relationship meter will be centralized.

:black_square_button: The overall success of the encounter meter will be a miniature version of the overall, and when hovered over, it will show the modification it has on the overall meter.

### Land & Mine Scene

:white_check_mark: Create a lander module that is pulled by gravity, and has both vertical and horizontal thrusters.

:white_check_mark: Create collision detection with land to crash if speed is too high, or not enough solid adjacent blocks (3 or 4) beneath ship.

:white_check_mark: Create oxygen meter for crew. When empty, kill crew but return rocket.

:white_check_mark: Create fuel meter for lander module. When empty, disable all thrusters.

:white_check_mark: Enable ability for lander improvements to improve gameplay (ie. Can land at greater speed, slower fuel burn, etc.).

:white_check_mark: Create an exit area the lander must reach to be considered "escaped", and materials recovered (successful minigame end).

:white_check_mark: Create help screen button.

:white_check_mark: Create tutorial for this scene.

:white_check_mark: Add dev menu options for this scene.

:black_square_button: (Optional) - Give up to three landers if player has built them. They must spend more crew to operate the new landers, though.

### Load Screen

:white_check_mark: Create main menu option for load screen.

:black_square_button: Create dev menu option for load screen.

:black_square_button: Detect if save code is in url, and prepopulate load field with that code.

:black_square_button: Add clear all option to remove code present, and set cursor over first spot.

:black_square_button: Add load from url button that populates code area with code from url.

:black_square_button: Add more code slots for a larger more complex code.

### Main Help Screen

:white_check_mark: Create main menu option for help screen.

:black_square_button: Create dev menu option for help screen.

:black_square_button: Create big picture help in main help screen, pointing out that each scene will have greater help details relevant to that given scene.

### Node Vertex (Travel) Map Scene

:black_square_button: Create tutorial for this scene.

:black_square_button: Add launch section in dev menu for this scene.

:black_square_button: Add dev menu options for this scene, especially how many nodes to have, how many "rings" to use, and which ring the ship should start at.

:black_square_button: Add algorithm to generate the nodes and vertices for the map. Vertices should have a set length of, 0, 1, 2, and 3. These numbers signifying how many minor nodes can fit on the vertex between those two major nodes.

:black_square_button: Add wormholes randomly.

:black_square_button: Ensure all nodes have a path to any other node, and for those that don't they have a path to a wormhole that connects them to a path that does.

:black_square_button: Add culdesac nodes that initially don't appear connected to any others, but can be revealed through other game experiences like trade or destroying pirates. Player can't start on one of these.

:black_square_button: Ensure all wormholes are one-way. When player uses a wormhole for the first time, a new "dotted" line connectes the input and output wormhole nodes.

:black_square_button: Player can only choose to travel to a node that's connected to their node by a single vertex. This reduces complexity on how player chooses to travel.

:black_square_button: Add click functionality to each visible node.

:black_square_button: When nodes are clicked, a readout appears in a panel with whatever info player has access to about that node with the science officer profile.

:black_square_button: When nodes in range are clicked, a button will appear. The button will be disabled if player doesn't have enough fuel to make the jump. Enabled if they do.

:black_square_button: Most minor nodes won't be visible until player passes by them, revealed by high tech sensor sweeps, or revealed during gameplay via trade, or ancient ruins discoveries, etc..

:black_square_button: Add animation of ships engines starting glow before transitioning to the "Travel In-progress" scene.

:black_square_button: Add option to transition to "Repair Ship" scene.

:black_square_button: Add option to transition to "Crew Roster" scene.

:black_square_button: Add meter to show how long ship has been lost.

:black_square_button: Add meterfor remaining fuel, and additional portion that shows how much will be used for a jump.

:black_square_button: Add meter for structural integrity.

:black_square_button: Add meter to show sensor range and power.

:black_square_button: Add meter for how many crew on board, how many different species.

:black_square_button: Add meter for remaining food stocks, and rate at which crew is moving through it.

:black_square_button: Add meter for remaining water stocks, and rate at which crew is moving through it.

:black_square_button: Add fog of war for areas outside sensor range.

:black_square_button: Add option to view a overlay map that shows all map nodes and vertices player has visited. Hovering over a node gives a vague summary of it's properties. A shadow of the real node-vertex map, it's meant to simulate the enzmann can keep track of previous locations via digital maps despite fog of war not shoing it on real-time map.

:black_square_button: Add overlay map described above.

:black_square_button: Add graphics for the major and minor nodes.

:black_square_button: Add graphics for the connecting vertices.

:black_square_button: Add graphics for the nodes' contents on overlay map on hover (mini-blackholes, mini-wormholes, mini-pirate ships, mini-space stations, mini-planets, etc.).

:black_square_button: Add the above for the realtime map, but only when player clicks on the node.

### Orbit Around Planetary Body Scene

:black_square_button: Create tutorial for this scene.

:black_square_button: Add launch section in dev menu for this scene.

:black_square_button: Add dev menu options for this scene, which need to include which set of scenes are possible to player.

:black_square_button: Use dev options from other sections to populate the scene player chooses.

:black_square_button: Depending on planet type, pick randomly from that category of texture to use in scene. Either store texture id once shown, or have it already chosen at initial galaxy generation.

:black_square_button: Depending on species and tech level, present only the relevant communication options.

:black_square_button: This is an intermediate scene between node-vertex map and mini-games available to user at this planet.

:black_square_button: Add panel for science officer with dialogue to describe the planet's details.

:black_square_button: Add panel for communications officer with dialogue to describe if there are any signals coming from the planet, and languages in those signals if any.

:black_square_button: Add panel for anthropologist (if there is intelligent life) with dialogue to describe the cultural details of those lifeforms.

:black_square_button: Add panel for list of options player can choose at this stage.

:black_square_button: Add player option for Land & Mine scene.

:black_square_button: Add player option for Ancient Ruins scene.

:black_square_button: Add player option for First Contact scene.

:black_square_button: Add player option for Trade scene (if species is advanced enough).

:black_square_button: Add player option for Improve Relations scene.

:black_square_button: Add player option for Ransack scene.

:black_square_button: Add player option for Take on Crew scene.

### Pirate Encounter Scene

:black_square_button: Create tutorial for this scene.

:black_square_button: Add launch section in dev menu for this scene.

:black_square_button: Add dev menu options for this scene.

:black_square_button: Add a panel for priate leader profile and dialogue.

:black_square_button: Add a meter to show relative strength in offensive weaponry between your ship and pirate fleet.

:black_square_button: Add a meter to show relative strength in defensive weaponry between your ship and pirate fleet.

:black_square_button: Add panel for list of player choices.

:black_square_button: Add player choice to pay the requested tribute.

:black_square_button: Add a meter to show how probable the pirates are to attack even with the tribute.

:black_square_button: Add player option to refuse to pay tribute.

:black_square_button: Add player option to sneak attack.

:black_square_button: Add option to secretly hide a bomb in the tribute to cripple pirate ship (Only available if player possesses x amount of a rare material tbd).

:black_square_button: Add dialogue for when pirates attack anyway after tribute.

:black_square_button: Add dialogue for when pirates attack after tribute refused.

:black_square_button: Add dialogue for when pirates accept tribute and leave. "Pleasure doing business with you."

:black_square_button: Add possibility where player's offensive/defensive stats far outway that of the pirates, th eplayer can demand tribute from the pirates.

:black_square_button: If player cripples pirate ship via sneak attack or hidden bomb, pirates will offer tribute. You can accept and take the tribute, or refuse and destroy them. Destroyed, they offer little more than scraps and crew morale drops a little.

:black_square_button: If pirates attack, scene transitions battle scene (prepopulated for pirate mode).

:black_square_button: Losing in pirate battle mode due to surrender by player will lead to heavy loses in crew and material (crippling).

:black_square_button: Losing in pirate battle mode without surrendering ends in destruction and an end to the game.

:black_square_button: Winning in pirate battle mode due to pirate surrender results in large tribute.

:black_square_button: Winning in pirate battle mode without pirate surrender leads to their destruction and very little material reward (maps maybe). This won't decrease crew morale.

### Ransack Planet Scene

:black_square_button: Create scene launch section in dev menu.

:black_square_button: Create limited ability to move the tiny ship because it is far away in perspective of the planet.

:black_square_button: Create an escape/leave area that the ship must navigate to if it is to leave. Note: player will never reach this if their engines have been disabled by damage.

:black_square_button: Create variable number of planet defense weapons: nuke silo, satellite missile launchers, possible EMP weapon that disables ship when shields down, and just shields when they were up.

:black_square_button: Planet defenses primarily block ships incoming weapons, and secondary fire at ship.

:black_square_button: Both planet and ship must have a finite amount of ammunition.

:black_square_button: Player can lose crew when ship is hit.

:black_square_button: Player will have multiple target possibilities: defenses, civilian buildings, power providers (shields).

:black_square_button: Destroying civilian targets will break the will of the planet faster, but make rewards fewer, crew morale lower, and lower reputation.

:black_square_button: Destroying military targets will reduce the accuracy of the planets weapons.

:black_square_button: Destroying the defenses will obvious render them inoperable.

:black_square_button: Destroying power providers will render their shield (if they have one) inoperable.

:black_square_button: Any use of this scene will lower crew morale, and ship reputation, regardless of the outcome.

:black_square_button: Depending on the number of civilian targets destroyed, a little ship will rise from the planet to greet player's ship containing the tribute. The end.

:black_square_button: Reputation is can rise and fall depending on race being ransacked. If it's a race at war with everyone else, reputation will fall with them, but possible rise with those other races.

### Repair Ship Scene

:black_square_button: Create scene launch section in dev menu.

:black_square_button: Show ship in profile with interior sections.

:black_square_button: Add little red dots that move about the ship's image as repair crew.

:black_square_button: Add list of existing repair crews available to players. Make clickable.

:black_square_button: Allow repair crew list expandable to show individual crew part of each team.

:black_square_button: Not all crews are equal as their ability to move quickly and repair quickly depends on the skills of their individual members.

:black_square_button: Repair crew team health and effectiveness is a sum of the individuals. Dead crew in one means they might move slower and repair slower.

:black_square_button: When instructing a repair crew to repair a section of the ship, there is a resource cost. Without resources, they can always repair it to a bare minimum (Gerry-rigged), and likely to break at the first sign of trouble.

:black_square_button: Repairs can't be down while ship is in jump motion, and repair time is done in-game time.

:black_square_button: Ships sections should be color coded based on their level of damage.

:black_square_button: Ship statistics should be available for each room, showing how the damage is affecting that portion of the ship.

:black_square_button: Must be able to enter, leave, and re-enter this scene and maintain state. Global controller must be monitoring and updating repairs (Global singleton).

:black_square_button: Add dev menu options for all of the above features.

:black_square_button: (Optional) - Create an initial mock scene that demonstrates the global updating of the repairs even in dev menu mode.

### Settings Panel

:black_square_button: Populate the "Settings" Panel with settings related options.

### Ship Layout Scene

:white_check_mark: Create grid of squares to represent areas of ship for interaction.

:white_check_mark: Create text that changes depending on which grid square the user hovers the mouse.

:white_check_mark: Create menu options associated with a selected grid square (Add or remove tech points).

:white_check_mark: Add descriptions of the rooms when selected.

:white_check_mark: Prefill some of the tech points for some of the room as minimum requirements (Must have engines...obviously).

:white_check_mark: Create limit on tech point upgrading overall and in specific rooms.

:white_check_mark: Add a confirm layout button.

:white_check_mark: Return user selection in an expected format when user clicks submit.

:white_check_mark: Add a reset to starting values button.

:white_check_mark: Add launch section in dev menu for this scene.

:black_square_button: Add dev menu options for this scene.

:black_square_button: Create help screen button.

:black_square_button: Create tutorial for this scene.

### Ship/Station in Distress Scene

:black_square_button: Create tutorial for this scene.

:black_square_button: Add launch section in dev menu for this scene.

:black_square_button: Add dev menu options for this scene.

:black_square_button: Add case where player arrives too late, and the ship is adrift without crew.

:black_square_button: Add case where ship has hull damage and needs repair soon (dangerous).

:black_square_button: Add case where reactor is melting down and needs repair soon (very dangerous).

:black_square_button: Add case where ship needs something (fuel, materials, etc.) in order to be on their way again (not dangerous).

:black_square_button: Add case where ship has some kind of plague, and need medical attention (dangerous). In some cases, not solving this will mean the spread of disease across systems.

:black_square_button: Add way for level of sensor tech to improve the amount of info available.

:black_square_button: Success could mean more crew, materials, improved relations, or discovered nodes on the node-vertex map (helps find points like ancient ruins).

:black_square_button: Failure can result in loss of crew, materials, decreased relations with that species, and possibly the spread of disease across systems.

### Take on Crew Scene

:black_square_button: Create tutorial for this scene.

:black_square_button: Add launch section in dev menu for this scene.

:black_square_button: Add dev menu options for this scene.

:black_square_button: Any planet/ship/station/encounter can have an opportunity to gain crew.

:black_square_button: Reputation with that species and/or culture will affect whether this comes up as an option.

:black_square_button: One panel shows current crew roster. Allows you to cycle through to see name, species, origin, skillset, and morale.

:black_square_button: Another panel shows over stats affected by your total crew.

:black_square_button: A final panel shows the current crew member trying to enlist. Like the crew roster panel, this person is not in your crew.

:black_square_button: The enlisting crew member panel should have a CTA that when hovered over, it shows the crew member's affect on the stats panel.

:black_square_button: Option only eligible if first contact scene already successfully completed with that species.

:black_square_button: First officer has to first succeed in a charisma check before crew are interested. Failed attempts could lower reputation with that species.

### Trade World/Ship/Station Scene

:black_square_button: Create tutorial for this scene.

:black_square_button: Add launch section in dev menu for this scene.

:black_square_button: Add dev menu options for this scene.

:black_square_button: Two dialogue boxes: one for your side, and the other for the leader of those being traded with.

:black_square_button: Use a profile image for trade leader.

:black_square_button: Use a profile image of your assigned first officer (communications officer if first officer not assigned) in left box.

:black_square_button: No communications officer assigned precludes the possibility of this scene taking place.

:black_square_button: Add character noise in trader's dialogue to demonstrate ship's ability to translate the language.

:black_square_button: Depending on the experience with the species, the translation is better. Having crew of that species will help, but even different dialects can confuse meaning.

:black_square_button: Add another panel to show what you have available to trade.

:black_square_button: Some of the items you have to trade might have special meaning to the trader. More crew of that species and experiences with that species might reveal those meanings.

:black_square_button: Add another panel to show what the aliens are "willing" to trade.

:black_square_button: Every trade involves round involves putting what you are willing to trade. The trader will put up what they want to trade for it, or vice versa. The person who went first can "encourage" the other party that they expect more.

:black_square_button: Add meters around trader profile to signal mood reflectors (some hidden with lack of experience of that species and culture). Frustration meter, deception, disappointment, offence, etc.

:black_square_button: Multi-system species or federations of species that span multiple systems will have currencies. Some will be material like gold, and some will be electronic. Player can choose to stockpile these currencies if the trader lacks goods the player wants, and still needs to offload some surplus. The electronic currencies take up no inventory, and can be used with traders of that species/federation in other systems.

:black_square_button: It's possible to improve or worsen reputation when trading. Usually undercutting a desperate trader or being overly generous.

### Travel In-progress Scene

:black_square_button: Create tutorial for this scene.

:black_square_button: Add launch section in dev menu for this scene.

:black_square_button: Add dev menu options for this scene. Among them should be random encounter possibilities: wormholes, asteroid/rogue-planets for mining or ancient ruins to explore, black holes, pirate battles, ship in distress (could be pirates, or two parties duking it out), military engagement against player.

:black_square_button: Add 3D model of ship from engines in forefront, looking over the ship's top with head pointing toward background.

:black_square_button: Add stars in motion closer ones as lines, and farther ones as pin points.

:black_square_button: Add star textured background to account for 80% or more of the stars.

:black_square_button: Every vertex between major nodes has unseen "smaller" nodes that can only be "noticed" as the player passes through them. These are random encounters, and are decided after player confirms jump between those two larger nodes.

:black_square_button: Add question mark graphic thing blinking in the corner of HUD that shows something is in range. Clicking it brings up a lit of options. Sensor tech might give more details. Options include: Stopping to investigate, mark it on the node-vertex map, ignoring it, or expending resources to boost the sensors for more info.

:black_square_button: Add alert to user if they stop to investigate, they will not regain the fuel they spent to make the jump.

:black_square_button: Regardless of user choice, the smaller node will appear on the node-vertex map. If they chose to ignore it, it will just be a question mark without details.

:black_square_button: No steering, only watching and waiting. The engine's exhaust should be swirling color, almost hypnotic. The head of the ship should have a light energy half-sphere that randomly flickers (as debris hits it).

:black_square_button: A few random encounters force user to stop without a choice. Some advanced species have the equivalent of a net that interferes with this almost FTL travel. This is most likely used by either a warlike race's military encounter, or that of a species the player has royally pissed off somehow. Also, blackholes can pull player from their course.

### Wormhole Scene

:black_square_button: Create tutorial for this scene.

:black_square_button: Add launch section in dev menu for this scene.

:black_square_button: Add dev menu options for this scene.

:black_square_button: Show wormhole swirling large in the center of the screen through the bridge's main viewscreen.

:black_square_button: Add sounds of beeps, click, and murmur from the crew. From outside there is a loud whooshing sound from the wormhole (made possible by speakers on the bridge to amplify whatever sensor picks up as their is no sound in space).

:black_square_button: In one corner their needs to be a readout of remaining fuel, and another to show the cost in fuel for each action.

:black_square_button: Add an area that shows a signal coming from the wormhole in some cases (also relevant to sensor tech level and science officer skill). Faded if not available.

:black_square_button: Add an area where there might be a "glimpse" of what's on the other side (very high sensor level tech and science officer skills only). Faded if not available.

:black_square_button: Add text description area to display explanations of these areas and readouts when player hovers over them.

:black_square_button: At best, the player can glean from these sensors and skills one of the following about the wormhole: closer to home, farther from home, and same distance but different location.

:black_square_button: The mysteries uncovered in some ancient ruins will reveal the above about a specific wormhole. If that wormhole is not yet discovered, the "connection" will be made when they do discover it. "We'll know it when we see it" the anthrolopolgist with reassure you when discovering such a mystery in an ancient ruin.