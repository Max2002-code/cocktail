import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { UserModel } from 'src/app/models/user.model';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Component({
  selector: 'app-full-layaout',
  templateUrl: './full-layaout.component.html',
  styleUrls: ['./full-layaout.component.css']
})
export class FullLayaoutComponent implements OnInit {
  @ViewChild('dropdownContainer') dropdownContainer!: ElementRef

  currentUser: UserModel | undefined
  action:boolean = false

  constructor(private authService:AuthService){}

  @HostListener('document:click',['$event'])
  onClickOutside(event:MouseEvent){
    if (this.dropdownContainer && !this.dropdownContainer.nativeElement.contains(event.target)){
      this.action = false
    }
  }

  ngOnInit():void {
    this.currentUser = this.authService.getUserFromLocalStorage()
  }

}
