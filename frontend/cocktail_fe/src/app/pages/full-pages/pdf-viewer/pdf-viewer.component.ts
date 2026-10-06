import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { elementAt, filter } from 'rxjs';
import { UserModel } from 'src/app/models/user.model';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { ReportServiceService } from 'src/app/shared/service/report.service.service';
import { __param } from 'tslib';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.css']
})
export class PdfViewerComponent implements OnInit {
  @ViewChildren('btnAdd') btnAdd!: QueryList<ElementRef>

  document: any;
  metadatas: any;
  currentUser:UserModel | undefined
  tipo:any
  id: any;
  pdfUrl:any;
  isLoading:any;
  upload=false;
  original_metadatas:any
  lock:any
  url: any
  stato: boolean = false;
  next_met=false;
  next_val=false;
  metadated: boolean = false;
  validate: boolean = false;
  doc_multi: any[][]=[];
  doc_single: any[]=[];
  index:number = 0;
  splits:any []=[]

  constructor (
    private authService:AuthService,
    private activatedRoute:ActivatedRoute,
    private http:ReportServiceService,
    private router:Router,
  ) {}

  deleteMeta(meta:any, index:number){
    this.metadatas.splice(index, 1)

    let filtered = this.metadatas.filter((m:any)=>m.metadato.code === meta.metadato.code)

    filtered.sort((a:any,b:any)=> a.multiple_counter- b.multiple_counter)

    let counter=1
    filtered.forEach((element:any) => {
      element.mutitple_counter = counter
      element.max_multiple = filtered.lenght
      counter++
    });
  }

  addMeta(meta: any, index: number): void {
  
    let count = 1;

    this.document.documentmetadato_set.forEach((element:any) => {
      if(meta.metadato.code == element.metadato.code){
        count++;
      }
    });

    let newone = {...meta};

    newone.id = null;
    newone.multiple_counter = count;
    newone.max_multiple = count;
    newone.max_counter = count;
    newone.value = null;
    newone.new_value = null;

    this.document.documentmetadato_set.forEach((element:any) => {
      if(meta.metadato.code == element.metadato.code){
        element.max_counter= count;
      }
    });
    this.document.documentmetadato_set.splice(index+1, 0, newone);
  }

  addMetaGroup(groupIndex: number): void {
    const group = this.doc_multi[groupIndex];
    if (!group) return;

    // Funzione helper per contare quante volte appare un codice in TUTTI i gruppi
    const countCodeInAllGroups = (code: string): number => {
      let count = 0;
      this.doc_multi.forEach(g => {
        g.forEach(meta => {
          if (meta.metadato.code === code) count++;
        });
      });
      return count;
    };

    // Creo il nuovo gruppo clonando e aggiornando ogni meta
    const newGroup = group.map(meta => {
      const count = countCodeInAllGroups(meta.metadato.code) + 1;
      return {
        ...meta,
        id: null,
        multiple_counter: count,
        max_multiple: count,
        max_counter: count,
        value: null,
        new_value: null
      };
    });

    // Aggiorno max_counter in tutti i gruppi per ogni codice
    newGroup.forEach(newMeta => {
      this.doc_multi.forEach(g => {
        g.forEach(meta => {
          if (meta.metadato.code === newMeta.metadato.code) {
            meta.max_counter = newMeta.max_counter;
          }
        });
      });
    });

    // Aggiungo il nuovo gruppo
    this.doc_multi.push(newGroup);
  }

  removeMetaGroup(groupIndex: number): void {
    const group = this.doc_multi[groupIndex];
    if (!group) return;

    // Se il gruppo appare solo una volta, non si può rimuovere l'ultimo originale
    const countGroupsOfType = this.doc_multi.filter(g => 
      g.length === group.length &&
      g.every((meta, i) => meta.metadato.code === group[i].metadato.code)
    ).length;

    if (countGroupsOfType <= 1) return;

    // Rimuovo l'ultimo gruppo che ha la stessa struttura del gruppo originale
    for (let i = this.doc_multi.length - 1; i >= 0; i--) {
      const g = this.doc_multi[i];
      if (
        g.length === group.length &&
        g.every((meta, idx) => meta.metadato.code === group[idx].metadato.code)
      ) {
        this.doc_multi.splice(i, 1);
        break;
      }
    }

    // Dopo aver rimosso, aggiorno max_counter per tutti gli altri gruppi di quel tipo
    group.forEach((metaTemplate, idx) => {
      const code = metaTemplate.metadato.code;
      const newMax = this.doc_multi.reduce((acc, g) => {
        return g.some(meta => meta.metadato.code === code) ? acc + 1 : acc;
      }, 0);

      this.doc_multi.forEach(g => {
        g.forEach(meta => {
          if (meta.metadato.code === code) {
            meta.max_counter = newMax;
          }
        });
      });
    });
  }

  saveMetas(){
    let meta: any = [];
    this.metadatas.forEach((element:any) => {
      if (element.value){
        if(element.multiple && !element.multiple_counter){
          element.multiple_counter = (element.max_counter+1)
        }
        meta.push({cat_meta: element.metadato.id, multiple_counter:element.multiple_counter, value:element.value, id:element.metadato.id})
      }
    });
    // doc_multi è array di gruppi, ogni gruppo è un array di metadati
    this.doc_multi.forEach((group: any[]) => {
      group.forEach((element: any) => {
        if (element.id) {
          meta.push({
            doc_meta: element.id,
            multiple_counter: element.multiple_counter,
            value: element.new_value,
            id: element.metadato.id,
          });
        } else {
          meta.push({
            cat_meta: null,
            multiple_counter: element.multiple_counter,
            value: element.new_value,
            id: element.metadato.id,
          });
        }
      });
    });
    this.doc_single.forEach((element:any)=>{
      if(element.id)
        meta.push({doc_meta: element.id, multiple_counter:element.multiple_counter, value:element.new_value, id:element.metadato.id})
      else
        meta.push({cat_meta: null, multiple_counter:element.multiple_counter, value:element.new_value, id:element.metadato.id})
    })
    
    this.http.updateMetas(this.document.id, meta).subscribe(data =>{
        this.http.getObject({tipo:this.tipo, id:this.id}).subscribe(data =>{
        this.document=data.document
        this.original_metadatas = data.document.documentmetadato_set
        this.document.documentmetadato_set.forEach((element:any) => {
          element.new_value = element.value
        });
        const groups: { [key: string]: any[] } = {};

        this.document.documentmetadato_set.forEach((element: any) => {
          if (element.multiple_counter) {
            if (!groups[element.multiple_counter]) {
              groups[element.multiple_counter] = [];
            }
            groups[element.multiple_counter].push(element);
          } else {
            this.doc_single.push([element]);
          }
        });
        this.doc_single = this.document.documentmetadato_set.filter((element:any)=>!element.multiple_counter)
        this.doc_single.sort((a:any, b:any) => a.metadato.id - b.metadato.id)
        
        this.metadatas=data.metadatas
        this.stato = this.document.downloaded
        this.metadated = this.document.metadated
        this.validate = this.document.validate
        this.next_met=true
      })
    })
    alert('Metadati salvati con successo')
  }

  isPresent(meta:any){
    let found = false
    this.document.documentmetadato_set.forEach((element:any) => {
      if(element.metadato.code==meta.metadato.code)
        found=true
    });

    return found
  }

  ValidateDoc(){
    this.http.postValidateDoc(this.document.id, true).subscribe(data=>{
      if(data.validate){
        this.next_met = false
        this.next_val = true
        this.validate = data.validate
        alert('Documento validato con successo')
      } else{
        alert('Errore nella validazione del documento')
      }
    }, err=>{
      console.log(err)
      alert('Errore nella validazione del documento')
    })
  }

  NextUnMetadated(){
    this.unlockDocument()
    this.http.getNextUnmetadated().subscribe(data=>{
      if(data.documentId){
        this.next_met = false
        this.router.navigate(['viewer/allegati', data.documentId])
      } else{
        this.router.navigate(['/documenti'])
        alert('Non ci sono documenti senza metadati')
      }
    }, err=>{
      this.router.navigate(['/documenti'])
      alert('Tutti i documenti sono metadatati oppure occupati da altri utenti')
    })
  }

  nextUnvalidated(){
    this.unlockDocument()
    this.http.getDocValidate().subscribe(data=>{
      if (data.documentId){
        this.next_val = false
        this.router.navigate(['/viewer/allegati', data.documentId])
      } else{
        this.router.navigate(['/documenti'])
        alert('Non ci sono documenti da validare.')
      }
    }, err=>{
      this.router.navigate(['/documenti'])
      alert('Tutti i documenti sono validati o sono occupati da altri utenti')
    }), (unlockError:any)=>{
      console.error('Errore durante lo sblocco del documento: ', unlockError)
      alert('Impossibile sbloccare il documento corrente')
    }
  }

  setSplit(split:string, pk:number){
    this.isLoading =true
    this.http.getSplitUrl(split, pk).subscribe(blob=>{
      const pdfUrl = URL.createObjectURL(blob) + '#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&view=Fit'
      this.pdfUrl = pdfUrl
      this.isLoading=false
    })
  }

  getPdfUrl(id:number){
    this.isLoading = true
    this.http.getPdfUrl(id).subscribe(blob =>{
      const pdfUrl = URL.createObjectURL(blob) + '#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&view=Fit'
      this.pdfUrl = pdfUrl
      this.isLoading=false
    }, err=>{
      console.log('Errore nel caricamento del pdf', err)
      this.isLoading=false
    })
  }

  deleteDoc(id:number){
    if(window.confirm('Sicuro di voler ELIMINARE definitivamente il documento?\nOperazione IRREVERSIBILE')){
      this.http.deleteDoc(id).subscribe({
        next: ()=>{
          alert('Eliminazione avvenuta con susccesso')
          this.router.navigate(['/documenti'])
        },
        error: (err)=>{
          console.log('Errore durante l\'eliminazione:', err)
          alert("Errore durante l'eliminazione del documento")
        }
      })
    } else {
      alert('Eliminazione annullata')
    }
  }

  ngOnInit(): void {
      this.currentUser = this.authService.getUserFromLocalStorage()

      this.next_met=false;
      this.next_val=false;
      this.isLoading=true;

      this.activatedRoute.params.subscribe(params => {
        this.tipo=params["tipo"]
        this.id=params["id"]
        console.log(this.tipo, this.id)
        this.doc_single = []
        this.doc_multi = []
        const auth = this.authService.getAuthFromLocalStorage()
        this.http.getObject({tipo:this.tipo, id:this.id}).subscribe(data =>{
          this.document=data.document
          this.stato = this.document.downloaded
          this.metadated = this.document.metadated
          this.validate = this.document.validate
          this.splits = this.document.splits

          this.metadatas=data.metadatas
          this.metadatas.sort((a:any, b:any) => a.metadato.id - b.metadato.id)
          this.metadatas.forEach((element:any) => {
            element.value = ''

            if( element.multiple){
              if(element.max_counter<1){
                this.addMeta(element, this.metadatas.indexOf(element))
              }
            }
          });
          this.original_metadatas = data.document.documentmetadato_set
          const groups: { [key: string]: any[] } = {};

          this.document.documentmetadato_set.forEach((element: any) => {
            if (element.multiple_counter) {
              if (!groups[element.multiple_counter]) {
                groups[element.multiple_counter] = [];
              }
              groups[element.multiple_counter].push(element);
            } else {
              this.doc_single.push([element]);
            }
          });
          Object.keys(groups)
            .sort((a, b) => +a - +b)
            .forEach(key => {
              this.doc_multi.push(groups[key]);
            });
          this.doc_single = this.document.documentmetadato_set.filter((element:any)=>!element.multiple_counter)
          this.doc_single.sort((a:any, b:any) => a.metadato.id - b.metadato.id)
          this.document.documentmetadato_set.forEach((element:any) => {
            element.new_value = element.value
          });
          
          this.http.getPdfUrl(this.id).subscribe(blob =>{
            const pdfUrl = URL.createObjectURL(blob) + '#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&view=Fit'
            this.pdfUrl = pdfUrl
            this.isLoading=false
          }, err=>{
            console.log('Errore nel caricamento del pdf', err)
            this.isLoading=false
          })

          this.http.getControlLock(this.document.id).subscribe(serverData =>{
            const sessioKey = `lock_${this.document.id}`
            if(serverData.lock){
              console.log('Lock attivo: ', serverData.lock)
            } else{
              if(!sessionStorage.getItem(sessioKey)){
                this.http.postControlLock(this.document.id, true).subscribe(data=>{
                  this.lock = data.lock
                  console.log('Lock attivo: ', this.lock)
                 sessionStorage.setItem(sessioKey, 'true')
                }, err=>{
                  console.log("Lock on attivo nel db")
                })
              }
            }
          })

          window.addEventListener("beforeunload", (event)=>{
            const sessioKey=`lock_${this.document.id}`
            if(this.lock){
              this.url = this.http.getControlLockUrl(this.document.id)
              const blob = new Blob([JSON.stringify({lock: false})], {type:'application/json'})
              navigator.sendBeacon(this.url, blob)
              sessionStorage.removeItem(sessioKey)

              window.location.reload()
            }
          })

          this.router.events.subscribe((event:any)=>{
            if(event instanceof NavigationStart && this.lock){
              this.unlockDocument()
            }
          })
        }, (err: any)=>{
          console.log('erroe oggetto', err)
        })
      })
  }

  unlockDocument(): void {
    const sessionKey = `lock_${this.document.id}`
    this.http.postControlLock(this.document.id, false).subscribe(data =>{
      this.lock=data.lock
      console.log('Lock disattivato: ',this.lock)
      sessionStorage.removeItem(sessionKey)
    }, err=>{
      console.log("Errore nello sblocco del lock")
    })
  }
}
