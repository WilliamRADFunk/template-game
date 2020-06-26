export function formatString(str: string, ...val: string[]): string {
    val.forEach((v: string, index: number) => str = str.replace(`{${index}}`, v));
    return str;
}