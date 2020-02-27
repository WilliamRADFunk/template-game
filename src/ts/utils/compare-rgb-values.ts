export function compareRGBValues(rgb1: string, rgb2: [number, number, number]): boolean {
    const justTheNumbers = rgb1.substring(4, rgb1.length - 1);
    const nums = justTheNumbers.split(',');
    return Number(nums[0].trim()) === rgb2[0]
        && Number(nums[1].trim()) === rgb2[1]
        && Number(nums[2].trim()) === rgb2[2];
}