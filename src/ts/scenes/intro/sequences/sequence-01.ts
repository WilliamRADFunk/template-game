export const SEQUENCE01 = {
    actorEvents: [
        {
            actorIndex: 16, // Ship lifts off from Earth
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
            actorIndex: 16, // Ship warbles
            duration: 240,
            endPoint: [ 0, 0 ],
            moveSpeed: 0.1,
            startingFrame: 181,
            startPoint: [ 0, 0 ],
            type: "Warble"
        },
        {
            actorIndex: 0, // Earth warbles
            duration: 100,
            endPoint: [ 0, 0 ],
            moveSpeed: 0.1,
            startingFrame: 191,
            startPoint: [ 0, 0 ],
            type: "Warble"
        },
        {
            actorIndex: 0, // Earth exits stage left
            endPoint: [ -15, 0 ],
            moveSpeed: 0.2,
            startingFrame: 241,
            startPoint: [ 0, 0 ],
            type: "Moving"
        },
        {
            actorIndex: 1, // Mars enter stage right
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
            actorIndex: 16, // Ship lands on Mars
            duration: 180,
            endPoint: [ 0, 0 ],
            moveSpeed: 0,
            startingFrame: 400,
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