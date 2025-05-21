import { Stats } from './stats.model';

export class User {
    id!:null;
    name!: '';
    email!: '';
    password!: '';
    surname!: '';
    language!: '';
    image_url!: '';
    stats!: Stats[];
}