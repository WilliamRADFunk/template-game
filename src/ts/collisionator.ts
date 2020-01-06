
import { Scene } from 'three';

import { Collidable } from './collidable';
/**
 * @class
 * The collision detection system.
 */
class Collisionator {
    /**
     * Registered list of things that can are collidable.
     */
    private collisionItems: Collidable[] = [];
    /**
     * Constructor for the Collisionator class
     * @hidden
     */
    constructor() {}
    /**
     * Adds a collidable object to the list.
     * @param collidable the object with collidable characteristics to add to the collidables list.
     */
    add(collidable: Collidable): void {
        this.collisionItems.push(collidable);
    }
    /**
     * Check for collisions between two or more object, and signal them to impact.
     * @param scene  graphic rendering scene object. Used each iteration to redraw things contained in scene.
     */
    checkForCollisions(scene: Scene): void {
        for (let i = 0; i < this.collisionItems.length; i++) {
            // If first collidable isn't active, don't collide
            if (!this.collisionItems[i].getActive()) continue;
            for (let j = i+1; j < this.collisionItems.length; j++) {
                const entityI = this.collisionItems[i];
                const entityJ = this.collisionItems[j];
                // If second collidable isn't active, don't collide
                if (!entityJ.getActive()) continue;
                const isEnemyMissile = (entityI.getName().indexOf('enemy') > -1 || entityJ.getName().indexOf('enemy') > -1);
                // Two unexploded enemy missiles should not collide.
                if (entityI.getName().indexOf('enemy') > -1 && entityJ.getName().indexOf('enemy') > -1) continue;
                // If both collidables are passive (ie. planet && shield) then they should not collide
                if (entityI.isPassive() && entityJ.isPassive()) continue;
                // No need to register two explosions colliding; they're already blowing up.
                if (!entityI.getName().indexOf('explosion') &&
                    !entityJ.getName().indexOf('explosion')) continue;
                // Two unexploding asteroids shouldn't collide.
                if (!entityI.getName().indexOf('Asteroid') &&
                    !entityJ.getName().indexOf('Asteroid')) continue;
                // Two unexploding saucers shouldn't collide.
                if (!entityI.getName().indexOf('Saucer') &&
                    !entityJ.getName().indexOf('Saucer')) continue;
                // Two unexploding drones shouldn't collide.
                if (!entityI.getName().indexOf('Drone') &&
                    !entityJ.getName().indexOf('Drone')) continue;
                // Unexploded enemy missiles and asteroids should not collide.
                if ((!entityI.getName().indexOf('Asteroid') ||
                    !entityJ.getName().indexOf('Asteroid')) && isEnemyMissile) continue;
                // Unexploded enemy missiles and drones should not collide.
                if ((!entityI.getName().indexOf('Drone') ||
                    !entityJ.getName().indexOf('Drone')) && isEnemyMissile) continue;
                // Unexploded enemy missiles and saucers should not collide.
                if ((!entityI.getName().indexOf('Saucer') ||
                    !entityJ.getName().indexOf('Saucer')) && isEnemyMissile) continue;
                // Asteroids and saucers should not collide.
                if ((!entityI.getName().indexOf('Saucer') && !entityJ.getName().indexOf('Asteroid')) || 
                    (!entityI.getName().indexOf('Asteroid') && !entityJ.getName().indexOf('Saucer'))) continue;
                // Drones and saucers should not collide.
                if ((!entityI.getName().indexOf('Saucer') && !entityJ.getName().indexOf('Drone')) || 
                    (!entityI.getName().indexOf('Drone') && !entityJ.getName().indexOf('Saucer'))) continue;
                // Drones and asteroids should not collide.
                if ((!entityI.getName().indexOf('Asteroid') && !entityJ.getName().indexOf('Drone')) || 
                    (!entityI.getName().indexOf('Drone') && !entityJ.getName().indexOf('Asteroid'))) continue;

                const posI = entityI.getCurrentPosition();
                const posJ = entityJ.getCurrentPosition();
                const radI = entityI.getCollisionRadius();
                const radJ = entityJ.getCollisionRadius();
                const dist = Math.sqrt(
                    (posJ[0] - posI[0]) * (posJ[0] - posI[0]) +
                    (posJ[1] - posI[1]) * (posJ[1] - posI[1])
                );
                if (radI + radJ > dist) {
                    if (entityI.impact(entityI, entityJ.getName()) &&
                    typeof entityI.removeFromScene === 'function') {
                        entityI.removeFromScene(scene);
                    }
                    if (entityJ.impact(entityJ, entityI.getName()) &&
                    typeof entityJ.removeFromScene === 'function') {
                        entityJ.removeFromScene(scene);
                    }
                }
            }
        }
    }
    /**
     * Removes a collidable object to the list.
     * @param collidable the object with collidable characteristics to remove to the collidables list.
     */
    remove(collidable: Collidable): void {
        const index = this.collisionItems.indexOf(collidable);
        if (index > -1) {
            this.collisionItems.splice(index, 1);
        }
    }
}
export const CollisionatorSingleton = new Collisionator();