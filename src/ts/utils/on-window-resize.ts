import { Renderer } from "three";

export function adjustWindowDimensions(): { WIDTH: number; HEIGHT: number; } {
    const ldBar = document.getElementsByClassName('ldBar')[0];
    ldBar.classList.remove('ldBar-fat');
    ldBar.classList.remove('ldBar-skinny');

    let WIDTH = window.innerWidth * 0.99;
    let HEIGHT = window.innerHeight * 0.99;
    if(WIDTH < HEIGHT) {
        HEIGHT = WIDTH;
        ldBar.classList.add('ldBar-skinny');
    } else {
        WIDTH = HEIGHT;
        ldBar.classList.add('ldBar-fat');
    }

    WIDTH = window.innerWidth * 0.99;
    HEIGHT = window.innerHeight * 0.99;
    if(WIDTH < HEIGHT) HEIGHT = WIDTH;
    else WIDTH = HEIGHT;
    
    const loading = document.getElementById('loading');
    loading.style.left = (((window.innerWidth * 0.99) - WIDTH) / 2) + 'px';
    loading.style.width = WIDTH + 'px';
    loading.style.height = HEIGHT + 'px';
    const mainview = document.getElementById('mainview');
    mainview.style.left = (((window.innerWidth * 0.99) - WIDTH) / 2) + 'px';
    mainview.style.width = WIDTH + 'px';
    mainview.style.height = HEIGHT + 'px';

    return { WIDTH, HEIGHT };
}

/**
 * Gracefully handles a change in window size, by recalculating shape and updating threejs renderer.
 * @param renderer ThreeJs renderer reference.
 */
export function onWindowResize(renderer: Renderer): void {
    const { WIDTH, HEIGHT } = adjustWindowDimensions();
    renderer.setSize( WIDTH, HEIGHT );
}