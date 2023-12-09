const grownups: number[] = [
    // 1,   // Sidd        shy-yellow-turtle
    // 100, // Michael     zany-pink-bird
    // 155, // Joshua      cute-black-hamster
    // 160, // Philip      silly-pink-rabbit
];

export default class Grownups {
    static includes(id: number | null): boolean {
        return !!id && (id < 199 || grownups.includes(id));
    }
}
