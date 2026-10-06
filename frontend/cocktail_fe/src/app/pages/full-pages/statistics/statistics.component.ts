import { Component, OnInit } from '@angular/core';
import { UserModel } from 'src/app/models/user.model';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { ReportServiceService } from 'src/app/shared/service/report.service.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

  currentUser: UserModel | undefined
  isLoading=false
  totalComplete:any
  totalOk:any
  totalMissing:any
  missingDocs: string[] = []
  docs_noOk:any

  constructor(private http:ReportServiceService, private authService:AuthService) {}

  refreshStats(){

    this.missingDocs = []
    this.getStats()
  }

  getStats(){
    this.http.getStatistics().subscribe(data=>{

      this.totalComplete = data['Completi']
      this.totalOk = data['Metadatati']

      this.docs_noOk = data['Non Metadatati']

      this.docs_noOk['names'].forEach((el:any)=>{

        this.missingDocs.push(el)
      })
      
      this.totalMissing = this.docs_noOk['count']      
    })
  }

  ngOnInit(): void {

    this.currentUser = this.authService.getUserFromLocalStorage()

    this.getStats()
      
  }

}
