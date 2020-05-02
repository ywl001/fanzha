import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private refresh = new BehaviorSubject('');
  private accountNode = new BehaviorSubject(null);
  private closeLeft = new BehaviorSubject('');
  private caseName = new BehaviorSubject('')
  private refreshChart = new BehaviorSubject('')
  
  refresh$ = this.refresh.asObservable();
  accountNode$ = this.accountNode.asObservable();
  closeLeft$ = this.closeLeft.asObservable();
  caseName$ = this.caseName.asObservable();
  refreshChart$ = this.refreshChart.asObservable();
  
  constructor() { }

  sendRefresh(){
    this.refresh.next('')
  }

  sendRefreshChart(){
    this.refreshChart.next('')
  }

  sendCloseLeft(){
    this.closeLeft.next('')
  }

  sendAccountNode(value){
    this.accountNode.next(value)
  }

  sendCaseName(value){
    this.caseName.next(value)
  }
 
}
