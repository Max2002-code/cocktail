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

    is_superuser=false;
    id=0;
    username='' ;
    password='';
    email='';
    group: Group[]=[]
    user_type = '';
    first_name = '';
    last_name = ''
    full_name = ''
    company: Company = new Company()

    constructor(init?: Partial<UserModel>) {
        super();
    
        Object.assign(this, init);
        
    }

    setUser(_user:unknown){
        const user = _user as UserModel
        this.id = user.id;
        this.username=user.username || '';
        this.password=user.password || '';
        this.email=user.email || '';
        this.group=user.group || []
        this.user_type=user.user_type || '';
        this.first_name=user.first_name || '';
        this.last_name=user.last_name || '';
        this.full_name=user.full_name || '';

        if(user.company){
            this.company = Object.assign(new Company(), user.company)

            if (user.company.categories){
                this.company.categories = Object.assign(new Category(), user.company.categories)
            }
        }
    }
}