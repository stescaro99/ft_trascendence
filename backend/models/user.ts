interface User {
    readonly id?: number;
    name: string;
    surname: string;
    nickname: string;
    email: string;
    password: string;
    image_url?: string;
    // aggiungere statistiche (modello nuovo)
}