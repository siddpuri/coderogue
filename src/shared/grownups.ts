const grownups: number[] = [
    // 1,   // Sidd        shy-yellow-turtle
    // 100, // Michael     zany-pink-bird
    // 155, // Joshua      cute-black-hamster
    // 160, // Philip      silly-pink-rabbit
    239,    // csp
    241,    // aholliday
    242,    // s-qc.hstu
    244,    // s-qc.mstu
    245,    // Neophyte
    246,    // s-agustafso
    247,    // mrpuri
    248,    // s-atian
    249,    // joformantes
];

export default class Grownups {
    static includes(id: number | null): boolean {
        return !!id && (id < 199 || grownups.includes(id));
    }
}
