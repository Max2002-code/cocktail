import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { UserModel } from 'src/app/models/user.model';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { ReportServiceService } from 'src/app/shared/service/report.service.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class UsersComponent implements OnInit{
  @ViewChild('table') table!: DatatableComponent

  currentUser: UserModel | undefined
  search:any={};
  page = 1
  public rows = {page:1, per_page:20, results:[],total:0}
  selected: any[] = []
  public ColumnMode = ColumnMode
  SelectionType = SelectionType
  dataLoaded:boolean = false
  

  constructor(private authService: AuthService, private report:ReportServiceService, private cdr:ChangeDetectorRef){}

  getUsers(){
    let data = this.search;

    this.report.postUsersStats(data, this.page).subscribe(data=>{
      this.rows=data
      setTimeout(()=>{
        if(this.table){
          this.table.recalculate()
          this.table.rowDetail.toggleExpandRow
        }
      },50)
    })
  }

  datatablePage(pageInfo: {count?: number, pageSize?:number, limit?:number, offset?:number}){
    this.page = (pageInfo.offset ?? 0) + 1;
    this.rows = {page:this.page, per_page:20, results:[], total:this.rows.total}

    this.getUsers();
  }

  onSelect({ selected }: { selected: any[] }){
    console.log('select event', selected, this.selected)

    this.selected.splice(0, this.selected.length)
    this.selected.push(...selected);
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {

    this.currentUser = this.authService.getUserFromLocalStorage()

    this.getUsers();
  }

}
