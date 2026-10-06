import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AppHttpClient } from './app-http-client.service';

@Injectable({
  providedIn: 'root'
})
export class ReportServiceService {
  public base_url = environment.apiUrl+"/api/";
  public cocktail_Url = environment.cockatilUrl + '/api/'

  constructor(private httpClient: AppHttpClient) { }

  login(username:string, password:string){
    let url = this.base_url + "login/";

    return this.httpClient.post(url, {username: username, password: password});
  }

  getUserByToken()
  {
    let url = this.base_url + "utente/";

    return this.httpClient.get(url);
  }

  getDocs(search: any, page=1){
    let url = this.base_url + "documents/search/?page="+page

    return this.httpClient.post(url, search)
  }

  postDocs(category:string, comune:string){
    let url = this.base_url + "documents/";

    return this.httpClient.post(url, {category:category, comune:comune})
  }

  getObject(data: { tipo: any; id: any;}) {
    let url = this.base_url+"object/";

    return this.httpClient.post(url, data)
  }

  updateMetas(id: number, data:any){
    let url = this.base_url+'document/'+id+'/metadata/'

    return this.httpClient.post(url, {'metadatas': data})
  }

  getStatistics(){
    let url = this.base_url+'statistics/'

    return this.httpClient.get(url)
  }

  getScatoleStato(){
    let url = this.base_url+"scatole/stato/"

    return this.httpClient.get(url)
  }

  getControlLock(id:number){
    let url = this.base_url+`lock/${id}/`

    return this.httpClient.get(url)
  }

  getControlLockUrl(id:number){
    let url = this.base_url + `lock/${id}/`
  }

  postControlLock(id:number, lock:boolean){
    let url = this.base_url+`lock/${id}/`

    return this.httpClient.post(url, {lock:lock})
  }

  getNextUnmetadated(){
    let url = this.base_url + "nextUnmetadated/"

    return this.httpClient.get(url)
  }

  postUnDowloadedDocs(scatola:any){
    let url = this.base_url + 'unDownloaded/'

    return this.httpClient.post(url, {scatola:scatola})
  }

  postValidateDoc(id:number, validate:boolean){
    let url = this.base_url + `validate/${id}/`

    return this.httpClient.post(url, {validate: validate});
  }

  getClosingDocs(){
    let url = this.base_url + 'closingDocs/'

    return this.httpClient.get(url);
  }

  getDocValidate(){
    let url = this.base_url + 'validate/next/'

    return this.httpClient.get(url);
  }

  postUsersStats(search:any, page=1){
    let url = this.base_url + "users/stats/"

    return this.httpClient.post(url, search)
  }

  postReportUser(search: any, page=1){
    let url = this.base_url + 'user/single/?page='+page

    return this.httpClient.post(url, search)
  }

  getReportNumber(){
    let url = this.base_url + 'user/single/number/'

    return this.httpClient.get(url)
  }

  deleteDoc(pk:number){
    let url = this.base_url + `deleteDoc/${pk}/`

    return this.httpClient.get(url)
  }

  StartTask(){
    let url = this.base_url + 'start_task/start_csv/'

    return this.httpClient.get(url)
  }

  getStatusTask(task_id:string){
    let url = this.base_url + `task-status-dj/${task_id}/`

    return this.httpClient.get(url)
  }

  getComuni(){
    let url = 'https://axqvoqvbfjpaamphztgd.functions.supabase.co/comuni'

    return this.httpClient.get(url)
  }

  postChangeComune(comune:string){
    let url = this.base_url + 'change/comune/'

    return this.httpClient.post(url, {comune:comune})
  }
}
