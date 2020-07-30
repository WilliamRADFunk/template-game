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

### Settings Panel

- [ ] Populate the "Settings" Panel with settings related options.

### Ancient Ruins Scene

- [ ] Ancient Ruins: Add tiles with animated graphics (fish jump in and out of water, tentacles in water, flying bird-like critters).

- [ ] Ancient Ruins: Make cemetery ruins.

- [ ] Ancient Ruins: Make city ruins.

- [ ] Ancient Ruins: Make library ruins.

- [ ] Ancient Ruins: Make military base ruins.

- [ ] Ancient Ruins: Make monastery ruins.

- [ ] Ancient Ruins: Make town ruins.

- [ ] Ancient Ruins: Make village ruins.

- [ ] Ancient Ruins: Add mystery tiles (20 earth-like things that have disappeared over the years. Collect them to gain bonuses with wormholes).

- [ ] Ancient Ruins: Add dev menu options for the mystery tile options.

- [ ] Ancient Ruins: Create return type for when scene is complete.

- [ ] Ancient Ruins: Animation of ship landing, and leaving.

- [ ] Ancient Ruins: Add action buttons for each team member type.

- [ ] Ancient Ruins: Path finding algo to verify every interactable tile can be reached.

- [ ] Ancient Ruins: Path finding algo for team member to follow.
