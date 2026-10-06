import { HttpBackend } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { UserModel } from 'src/app/models/user.model';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { ReportServiceService } from 'src/app/shared/service/report.service.service';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css'],
  encapsulation:ViewEncapsulation.None
})
export class DocumentComponent implements OnInit{
  @ViewChild(DatatableComponent) table!: DatatableComponent
  
  currentUser: UserModel | undefined
  search:any={};
  page = 1
  public rows = {page:1, per_page:20, results:[],total:0}
  public ColumnMode = ColumnMode
  SelectionType = SelectionType
  public columns = [
    { name: "ID", prop: "ID" },
    { name: "Username", prop: "Username" },
    { name: "Name", prop: "Name" },
    { name: "Last Activity", prop: "Last Activity" },
    { name: "Verified", prop: "Verified" },
    { name: "Role", prop: "Role" },
    { name: "Status", prop: "Status" },
    { name: "Actions", prop: "Actions" },
  ];
  selected: any[] = []
  loading=false
  showMessage:boolean = false
  isSuccess:boolean = false
  message:string = ''
  result:any;
  category:any
  comune:any
  
  constructor(private authService: AuthService, private report:ReportServiceService, private router:Router, private cdr:ChangeDetectorRef) {}

  onSelect({ selected }: { selected: any[] }){
    console.log('select event', selected, this.selected)

    this.selected.splice(0, this.selected.length)
    this.selected.push(...selected);
  }

  datatablePage(pageInfo: {count?: number, pageSize?:number, limit?:number, offset?:number}){
    this.page = (pageInfo.offset ?? 0) + 1;
    this.rows = {page:this.page, per_page:20, results:[], total:this.rows.total}

    this.getModelli();
  }

  getModelli(){
    let data = this.search;

    this.report.getDocs(data, this.page).subscribe(data=>{
      this.rows=data
      setTimeout(()=>{
        if(this.table){
          this.table.recalculate()
          this.table.rowDetail.toggleExpandRow
        }
      },50)
    })
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  searchDocs(){
    this.loading = true
    this.rows.results = []

    let data = {...this.search}

    this.report.getDocs(data, this.page).subscribe(data=>{
      this.rows=data
      this.loading=false
      setTimeout(()=>{
        if(this.table){
          this.table.recalculate()
          this.table.rowDetail.toggleExpandRow
        }
      },50)
    })
  }

  nextUnmetadated(){
    this.report.getNextUnmetadated().subscribe(data=>{
      if (data.documentId){
        this.router.navigate(['/viewer/allegati', data.documentId])
      } else{
        alert('Non ci sono documenti senza metadati.')
      }
    }, err=>{
      console.log('Errore durante il recupero dei documenti: ', err)
      alert('Tutti i documenti sono metadatati o sono occupati da altri utenti')
    }), (unlockError:any)=>{
      console.error('Errore durante lo sblocco del documento: ', unlockError)
      alert('Impossibile sbloccare il documento corrente')
    }
  }

  nextUnvalidated(){
    this.report.getDocValidate().subscribe(data=>{
      if (data.documentId){
        this.router.navigate(['/viewer/allegati', data.documentId])
      } else{
        alert('Non ci sono documenti da validare.')
      }
    }, err=>{
      console.log('Errore durante il recupero dei documenti: ', err)
      alert('Tutti i documenti sono validati o sono occupati da altri utenti')
    }), (unlockError:any)=>{
      console.error('Errore durante lo sblocco del documento: ', unlockError)
      alert('Impossibile sbloccare il documento corrente')
    }
  }

  addDocs(category:any, comune:any){
    this.loading = true
    this.report.postDocs(category, comune).subscribe(data=>{
      this.result = data
      if(this.result.length > 0){
        this.showToast(`✅ ${this.result.length} Documenti aggiunti con successo`, true)
      } else {
        this.showToast('❌ Nessun documento trovato da caricare', false);
      }
      this.showMessage = true
      this.getModelli()
    }, err=>{
      this.showToast(`❌ Errore durante il caricamento dei documenti: ${err.error.error}`, false);
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
    }, 2000);
  }

  ngOnInit(): void {

    this.currentUser = this.authService.getUserFromLocalStorage()
    this.category = this.currentUser?.company.categories.name
    this.comune = this.currentUser?.company.comune

    this.getModelli();
  }
}
