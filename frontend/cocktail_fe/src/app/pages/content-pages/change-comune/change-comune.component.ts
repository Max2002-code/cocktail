import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserModel } from 'src/app/models/user.model';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { ReportServiceService } from 'src/app/shared/service/report.service.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-change-comune',
  templateUrl: './change-comune.component.html',
  styleUrls: ['./change-comune.component.css']
})
export class ChangeComuneComponent implements OnInit {
  currentUser: UserModel | undefined
  new_comune: string =''
  old_comune:string =''
  comune:string | undefined
  errorMessage_old: string=''
  errorMessage_new: string=''
  comuni_italiani: any[]=[]
  change:boolean = false

  constructor(private authService: AuthService, private http:ReportServiceService, private router:Router) { }

  changeComune(){

    this.old_comune = this.old_comune.toLowerCase()
    this.comune = this.comune?.toLowerCase()
    let valid = this.comuni_italiani.some(c => c.nome.toLowerCase() === this.new_comune.toLowerCase())

    //CONTROLLO ERRORI SULL'INPUT VECCHIO COMUNE
    if (this.old_comune === ''){
      this.errorMessage_old = 'Inserisci il comune lavorato precedentemente'
      return
    } else if (this.old_comune !== this.comune){
      this.errorMessage_old = 'Inserisci il comune lavorato correttamente'
      return
    }
    //CONTROLLO ERRORI SULL'INPUT NUOVO COMUNE
    if (this.new_comune === ''){
      this.errorMessage_new = 'Inserisci il nuovo comune'
      return
    } else if (!valid){
      this.errorMessage_new = 'Inserisci un comune valido!'
      return
    }

    //SE TUTTO PASSA, CONFERMA E CHIAMATA API
    this.change = true
  }

  confirmChange(comune:string){
    this.http.postChangeComune(comune).subscribe(()=>{
      this.authService.logout()
    })
  }

  onChange(){
    this.errorMessage_old = ''
    this.errorMessage_new = ''
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getUserFromLocalStorage()

    this.comune = this.currentUser?.company.comune

    this.http.getComuni().subscribe(data=>{
      this.comuni_italiani = data
    })
  }

}
