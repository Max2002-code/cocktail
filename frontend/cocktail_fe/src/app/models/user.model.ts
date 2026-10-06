import { AuthModel } from "./auth.model";

export class Group {
    name!:string;
}

export class Tenant{
    name!:string;
}

export class Category {
    id!: number;
  name!: string;
  code!: string;
  parent!: number;
  user_add!: number;
  date_add!: string;
  date_upd!: string;
}

export class Company{
    id!: number;
    name!: string;
    email!: string;
    phone!: string;
    date_add!: string;
    date_upd!: string;
    categories!: Category;
    comune!: string;
}

export class UserModel extends AuthModel{

    id=0;
    username='' ;
    password='';

    constructor(init?: Partial<UserModel>) {
        super();
    
        Object.assign(this, init);
        
    }

    setUser(_user:unknown){
        const user = _user as UserModel
        this.id = user.id;
        this.username=user.username || '';
        this.password=user.password || '';
    }
}