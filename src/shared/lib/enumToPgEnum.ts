export function enumToPgEnum<T extends Record<string, unknown>>(enumObj: T): [T[keyof T], ...T[keyof T][]] {
    return Object.values(enumObj).map((value: any) => `${value}`) as any;
}
