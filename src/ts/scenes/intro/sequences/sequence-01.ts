export const SEQUENCE01 = {
    actorEvents: [
        {
            actorIndex: 2, // Ship lifts off from Earth
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
            actorIndex: 0, // Earth exits stage left
            endPoint: [ -15, 0 ],
            moveSpeed: 0.05,
            startingFrame: 181,
            startPoint: [ 0, 0 ],
            type: "Moving"
        },
        {
            actorIndex: 3, // Mars enter stage right
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
            actorIndex: 2, // Ship lands on Mars
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
            sentence: '2032: Colonization of Mars',
            holdCount: 420,
            startingFrame: 1,
        }
    ]
};