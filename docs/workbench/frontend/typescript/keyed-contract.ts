// keyed-contract.ts
export function getField<T, K extends keyof T>(value: T, key: K): T[K] {
  return value[key];
}
const profile: { name: string; attempts: number; nickname?: string } = { name: 'Ada', attempts: 0 };
const attempts: number = getField(profile, 'attempts');
const nickname: string | undefined = getField(profile, 'nickname');
// @ts-expect-error The selected number property is not a string.
const wrong: string = getField(profile, 'attempts');
// @ts-expect-error Arbitrary external strings are not known profile keys.
getField(profile, 'password');
const key: 'name' | 'attempts' = Math.random() > 0.5 ? 'name' : 'attempts';
const uncertain: string | number = getField(profile, key);
// @ts-expect-error A union key produces a union value, not always a number.
const alwaysNumber: number = getField(profile, key);
