export const rectangleBoxes: { height: number; width: number; x: number; z: number; radius: number; rot: number; name: string; }[] = [
    { height: 0.49, width: 1.64, x: -0.9, z: 2.98, radius: 0.09, rot: 0, name: 'Galley & Mess Hall' },
    { height: 0.49, width: 1.64, x: -0.9, z: 2.28, radius: 0.07, rot: 0, name: 'Crew Quarters A' },
    { height: 0.49, width: 1.64, x: -0.9, z: 3.71, radius: 0.09, rot: 0, name: 'Engineering' },
    { height: 1.01, width: 0.49, x: 0.36, z: 2.35, radius: 0.05, rot: 0, name: 'Weapons Room' },
    { height: 1.01, width: 0.49, x: 0.36, z: 3.59, radius: 0.05, rot: 0, name: 'Extended Reality Deck' },
    { height: 0.95, width: 0.94, x: -2.39, z: 2.45, radius: 0.06, rot: 0, name: 'Climate-Controlled Cargo Space' },
    { height: 0.95, width: 0.94, x: -2.39, z: 3.62, radius: 0.06, rot: 0, name: 'Standard Cargo Space' },
    { height: 2.10, width: 0.48, x: -3.38, z: 3.04, radius: 0.05, rot: 0, name: 'Engine Room' },
    { height: 0.77, width: 0.48, x: 0.99, z: 2.98, radius: 0.04, rot: 0, name: 'Bridge' },
    { height: 0.47, width: 0.48, x: 0.99, z: 2.22, radius: 0.05, rot: 0, name: 'Officers Quarters' },
    { height: 0.47, width: 0.48, x: 0.99, z: 3.75, radius: 0.03, rot: 0, name: 'Training Deck' },
    { height: 0.24, width: 0.38, x: -5.69, z: 1.99, radius: 0.02, rot: 0, name: 'Port Thrusters' },
    { height: 0.24, width: 0.38, x: -5.69, z: 3.02, radius: 0.02, rot: 0, name: 'Main Thruster' },
    { height: 0.24, width: 0.38, x: -5.69, z: 3.98, radius: 0.02, rot: 0, name: 'Starboard Thrusters' },
    { height: 0.24, width: 0.37, x: 5.50, z: 3.00, radius: 0.02, rot: 0, name: 'Sensors' },
    { height: 3.02, width: 0.20, x: -4.04, z: 2.98, radius: 0.099, rot: 0, name: 'Artificial Gravity Rings' },
    { height: 1.28, width: 0.16, x: 1.53, z: 2.98, radius: 0.07, rot: -0.02, name: 'Shield Emitters' }
];

let techPelletStartX = -4.73;

export const techPellets: { height: number; width: number; x: number; z: number; radius: number; name: string; }[] = [
    { height: 0.9, width: 0.3, x: techPelletStartX, z: -3.83, radius: 0.07, name: 'Tech Point-1' },
    { height: 0.9, width: 0.3, x: techPelletStartX += 0.35, z: -3.83, radius: 0.07, name: 'Tech Point-2' },
    { height: 0.9, width: 0.3, x: techPelletStartX += 0.35, z: -3.83, radius: 0.07, name: 'Tech Point-3' },
    { height: 0.9, width: 0.3, x: techPelletStartX += 0.35, z: -3.83, radius: 0.07, name: 'Tech Point-4' },
    { height: 0.9, width: 0.3, x: techPelletStartX += 0.35, z: -3.83, radius: 0.07, name: 'Tech Point-5' },
    { height: 0.9, width: 0.3, x: techPelletStartX += 0.35, z: -3.83, radius: 0.07, name: 'Tech Point-6' },
    { height: 0.9, width: 0.3, x: techPelletStartX += 0.35, z: -3.83, radius: 0.07, name: 'Tech Point-7' },
    { height: 0.9, width: 0.3, x: techPelletStartX += 0.35, z: -3.83, radius: 0.07, name: 'Tech Point-8' },
    { height: 0.9, width: 0.3, x: techPelletStartX += 0.35, z: -3.83, radius: 0.07, name: 'Tech Point-9' },
    { height: 0.9, width: 0.3, x: techPelletStartX += 0.35, z: -3.83, radius: 0.07, name: 'Tech Point-10' }
];

export const textBoxes = [
    { widthIn: 6, widthOut: 6.2, x: 2.9, z: -4.45, name: 'Profile Dialogue' },
    { widthIn: 5.5, widthOut: 5.7, x: -3.15, z: -4.45, name: 'Selection' },
];

export const textElements = [
    'dialogue-text',
    'left-panel-subtitle-text',
    'left-panel-title-text',
    'ship-layout-screen-hover'
]