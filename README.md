# Template Game
(Complete) The basic framework for my engineless small-scale game projects.</br></br>

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

2. Run `git clone https://github.com/WilliamRADFunk/template-game.git`.</br></br>

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