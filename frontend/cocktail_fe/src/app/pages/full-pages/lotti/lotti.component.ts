import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { elementAt } from 'rxjs';
import { UserModel } from 'src/app/models/user.model';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { ReportServiceService } from 'src/app/shared/service/report.service.service';

@Component({
  selector: 'app-lotti',
  templateUrl: './lotti.component.html',
  styleUrls: ['./lotti.component.css']
})
export class LottiComponent implements OnInit {
  @ViewChild('logsContainer') logsContainer!: ElementRef<HTMLDivElement>

  currentUser:UserModel | undefined
  gruppiScatole :[{scatola:string, stato:string}] = [{ scatola: '', stato: ''}]
  result:any
  message:string = ''
  isSuccess:boolean = false
  showMessage:boolean = false
  loading:boolean = false
  blind:boolean = false
  start:boolean = false
  end:boolean = false
  logs: any
  percent: number = 0
  fase:string = ''
  shouldScroll:boolean = true

  constructor(
    private http:ReportServiceService,
    private authService:AuthService,
  ) {}

  getStatus(){

    this.http.getScatoleStato().subscribe(data=>{
      this.gruppiScatole=data
      
      const order: string[]=[
        'Incompleto',
        'Completo',
        'Scaricabile',
        'Scaricato'
      ]

      this.gruppiScatole.sort((a,b)=>{
        const IndexA = order.indexOf(a.stato)
        const IndexB = order.indexOf(b.stato)

        if(IndexA !== IndexB){
          return IndexA - IndexB
        }

        return a.scatola.localeCompare(b.scatola)
      })

      this.blind = this.gruppiScatole.some(element => element.stato === 'Scaricabile')
    })

  }

  UnDownloaded(scatola:any){

    this.http.postUnDowloadedDocs(scatola).subscribe(data=>{
      this.getStatus()
    })

  }

  closingDocs(){
    this.loading = true
    this.http.getClosingDocs().subscribe(data=>{
      this.result = data
      if (this.result){
        this.showToast('✅ CSV creati con successo', true);
      }
      this.showMessage = true
      this.getStatus()
    }, err=>{
      this.showToast('❌ Errore durante la creazione del CSV', false);
      console.error(err)
    })
  }

  showToast(message: string, success: boolean) {
    this.message = message;
    this.isSuccess = success;
    this.showMessage = true;

    setTimeout(() => {
      this.showMessage = false;
      this.loading = false
    }, 1500);
  }

  StartTaskTest(){
    this.start = true
    this.http.StartTask().subscribe(data=>{
      const task_id = data['task_id']
      this.pollTask(task_id)
    })
  }

  pollTask(task_id:string){
    const interval = setInterval(() =>{
      this.http.getStatusTask(task_id).subscribe(data =>{
        this.logs = data.logs
        this.percent = data.percent
        this.fase=data.fase

        if (data['error']) {
          this.end=true
          const errorText = data['error']
          this.logs = ['ERRORE: '+ errorText]
          clearInterval(interval)
        }

        if (data['done'] === true) {
          this.end = true
          this.logs = ['CSV CREATI CORRETTAMENTE']
          clearInterval(interval)
        }
      })
    }, 1000)
  }

  scrollToBottom(){
    const container = this.logsContainer?.nativeElement
    if(!container) return 
    container.scrollTop = container.scrollHeight
  }

  closeOverlay(){
    this.start = false;
    this.logs = [];
    this.percent = 0;

    this.getStatus()
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom()
    }
  }

  ngOnInit(): void {
      
    this.currentUser = this.authService.getUserFromLocalStorage()

    this.getStatus()

  }

}
