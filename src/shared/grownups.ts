const grownups = [
    1,   // Sidd        shy-yellow-turtle
    100, // Michael     zany-pink-bird
    155, // Joshua      cute-black-hamster
    160, // Philip      silly-pink-rabbit
    196, // KHallman    shy-black-dog
    201, // Ethan's dad zany-black-fish
];

export default class Grownups {
    static includes(id: number | null): boolean {
        return !!id && grownups.includes(id);
    }
}
