export const SEQUENCE03 = {
    actorEvents: [
        {
            actorIndex: 2, // Ship lifts off from Asteroid
            duration: 180,
            endPoint: [ 0, 0 ],
            moveSpeed: 0,
            startingFrame: 1,
            startPoint: [ 0, 0 ],
            type: "Grow"
        },
        {
            actorIndex: -1, // Stars in motion
            endPoint: [ 0, 0 ],
            moveSpeed: 0,
            startingFrame: 181,
            startPoint: [ 0, 0 ],
            type: "Stars Moving"
        },
        {
            actorIndex: 4, // Asteroid exits stage left
            endPoint: [ -15, 0 ],
            moveSpeed: 0.05,
            startingFrame: 181,
            startPoint: [ 0, 0 ],
            type: "Moving"
        },
        {
            actorIndex: 5, // Enceladus enter stage right
            endPoint: [ 0, 0 ],
            moveSpeed: 0.05,
            startingFrame: 181,
            startPoint: [ 20, 0 ],
            type: "Moving"
        },
        {
            actorIndex: -1, // Stars stop moving
            endPoint: [ 0, 0 ],
            moveSpeed: 0,
            startingFrame: 579,
            startPoint: [ 0, 0 ],
            type: "Stars Stopping"
        },
        {
            actorIndex: 2, // Ship lands on Enceladus
            duration: 180,
            endPoint: [ 0, 0 ],
            moveSpeed: 0,
            startingFrame: 600,
            startPoint: [ 0, 0 ],
            type: "Shrink"
        }
    ],
    endingFrame: 780,
    startingFrame: 1,
    textEvents: [
        {
            sentence: '2091: Submerged colony formed on Enceladus',
            holdCount: 420,
            startingFrame: 1,
        }
    ]
};