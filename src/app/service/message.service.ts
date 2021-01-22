import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { AccountNode } from '../models/accountNode';
import { AddLowerAccountEvent, QueryDurationEvent } from '../models/editNodeEvent';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private _caseListChange = new ReplaySubject();
  private _showChart = new ReplaySubject(null);
  private _closeLeft = new ReplaySubject();
  private caseName = new ReplaySubject<string>()
  private _refreshChart = new ReplaySubject();
  private _saveImage = new ReplaySubject();
  private _layoutChange = new ReplaySubject<boolean>();
  private _queryDurationChange = new ReplaySubject<QueryDurationEvent>(null);
  private lowerAccount = new ReplaySubject<AddLowerAccountEvent>();
  private _delNode = new ReplaySubject(null)
  private _saveData = new ReplaySubject();
  private _startAccountChange = new ReplaySubject();

  CaseListChange$ = this._caseListChange.asObservable();
  showChart$ = this._showChart.asObservable();
  closeLeft$ = this._closeLeft.asObservable();
  /**传递caseName */
  caseName$ = this.caseName.asObservable();
  refreshChart$ = this._refreshChart.asObservable();
  /**保存图片 */
  saveImage$ = this._saveImage.asObservable();
  /**改变布局 横竖 */
  layoutChange$ = this._layoutChange.asObservable();
  queryDurationChange$ = this._queryDurationChange.asObservable();
  lowerAccount$ = this.lowerAccount.asObservable();
  delNode$ = this._delNode.asObservable();
  saveData$ = this._saveData.asObservable();
  startAccountChange$ = this._startAccountChange.asObservable();

  constructor() { }

  caseListChange(){
    this._caseListChange.next('')
  }

  refreshChart(){
    this._refreshChart.next('')
  }

  sendCloseLeft(){
    this._closeLeft.next('')
  }

  showChart(value){
    this._showChart.next(value)
  }

  sendCaseName(value){
    this.caseName.next(value)
  }

  sendSaveImage(){
    this._saveImage.next('')
  }

  layoutChange(value){
    this._layoutChange.next(value)
  }

  queryDurationChange(value:QueryDurationEvent){
    this._queryDurationChange.next(value)
  }

  addLowerAccount(value){
    this.lowerAccount.next(value)
  }

  delNode(node:AccountNode){
    this._delNode.next(node);
  }

  saveData(){
    this._saveData.next();
  }

  startAccountChange(value){
    this._startAccountChange.next(value)
  }

}
