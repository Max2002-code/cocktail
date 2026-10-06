import { Component, OnInit, ViewChild } from '@angular/core';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { count } from 'rxjs';
import { UserModel } from 'src/app/models/user.model';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { ReportServiceService } from 'src/app/shared/service/report.service.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  @ViewChild(DatatableComponent) user!: DatatableComponent

  currentUser:UserModel | undefined
  groupedDocuments: { [date: string]: any[] } = {};
  groupedDates: string[] = [];
  todayStr:string = ''
  search:any={}
  public rows = {page:1, per_page:20, results:[],total:0}
  page=1
  selected: any[] = []
  public ColumnMode = ColumnMode
  SelectionType = SelectionType
  dates:any=[]
  total:number=0
  totals:number=0
  counts: { [key: string]: number } = {};

  constructor( private authService:AuthService, private http:ReportServiceService) {}

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

    this.http.postReportUser(data, this.page).subscribe(data=>{
      this.rows=data
      
    })
    this.http.getReportNumber().subscribe(data => {
  this.totals = data['total'];
  this.counts = data;

  this.dates = [];

  Object.keys(data).forEach(key => {
    if (key !== 'total') {
      if (!this.dates.includes(key)) {
        this.dates.push(key);
      }
    }
  });

  this.dates.sort((a:any, b:any) => new Date(b).getTime() - new Date(a).getTime());

  this.total = Object.values(this.counts).reduce((acc, cur) => acc + cur, 0);
});
  }

  getSearch(){
    this.rows.results = []

    let data = {...this.search}

    this.http.postReportUser(data, this.page).subscribe(data=>{
      this.rows=data
      
    })
  }

  ngOnInit(): void {
  this.currentUser = this.authService.getAuthFromLocalStorage();
  this.todayStr = new Date().toISOString().split('T')[0];

  this.getModelli()
}

}
