import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { QueryDurationEvent } from '../models/queryDurationEvent';

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
  private queryDuration = new BehaviorSubject<QueryDurationEvent>(null);
  private lowerAccount = new BehaviorSubject(null);
  private delNode = new BehaviorSubject(null)

  refreshCaseList$ = this.refreshCaseList.asObservable();
  accountNode$ = this.accountNode.asObservable();
  closeLeft$ = this.closeLeft.asObservable();
  caseName$ = this.caseName.asObservable();
  refreshChart$ = this.refreshChart.asObservable();
  saveImage$ = this.saveImage.asObservable();
  layout$ = this.layout.asObservable();
  queryDuration$ = this.queryDuration.asObservable();
  lowerAccount$ = this.lowerAccount.asObservable();
  delNode$ = this.delNode.asObservable();

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

  queryDurationChange(value:QueryDurationEvent){
    this.queryDuration.next(value)
  }

  addLowerAccount(value){
    this.lowerAccount.next(value)
  }

  delNodeComplete(node){
    this.delNode.next(node);
  }

}
