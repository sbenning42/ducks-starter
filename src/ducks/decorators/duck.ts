export interface IDuck {
    decored: boolean;
}

export function Duck() {
    return (constructor: new (...params: any[]) => any) => class extends constructor implements IDuck {
        decored = true;
    }
}

@Duck()
export class Decored {}

export function test() {
    const d = new Decored();
    console.log('d: ', d);
}
