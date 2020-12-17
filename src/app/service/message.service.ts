import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private refreshCaseList = new BehaviorSubject('');
  private accountNode = new BehaviorSubject(null);
  private closeLeft = new BehaviorSubject('');
  private caseName = new BehaviorSubject('')
  private refreshChart = new BehaviorSubject('');
  private saveImage = new BehaviorSubject('');
  private layout = new BehaviorSubject(false);
  
  refreshCaseList$ = this.refreshCaseList.asObservable();
  accountNode$ = this.accountNode.asObservable();
  closeLeft$ = this.closeLeft.asObservable();
  caseName$ = this.caseName.asObservable();
  refreshChart$ = this.refreshChart.asObservable();
  saveImage$ = this.saveImage.asObservable();
  layout$ = this.layout.asObservable();
  
  constructor() { }

  sendRefresh(){
    this.refreshCaseList.next('')
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

  sendSaveImage(){
    this.saveImage.next('')
  }

  sendLayout(value){
    this.layout.next(value)
  }

 
}
