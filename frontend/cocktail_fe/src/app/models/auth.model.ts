export class AuthModel{
    key!: string 

    setAuth(auth: AuthModel){
        this.key = auth.key;
    }
}