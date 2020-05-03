import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AccountNode } from '../models/accountNode';
import { SqlService } from '../service/sql.service';
import { MessageService } from '../service/message.service';
import { PhpFunctionName } from '../models/phpFunctionName';
import { MatDialog } from '@angular/material';
import { AddLowerComponent } from '../add-lower/add-lower.component';
import { AccountDetailComponent } from '../account-detail/account-detail.component';

declare var alertify;

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  @ViewChild('root', { static: false }) rootDiv: ElementRef;

  constructor(private sqlService: SqlService,
    public dialog: MatDialog,
    private message:MessageService) { }

  w: number;
  h: number;

  x: number;
  y: number;

  private _position;

  level:number;

  children: Array<AccountComponent> = [];
  parent:AccountComponent;


  private _data: AccountNode;

  set data(value: AccountNode) {
    this._data = value;
    this.level = value.level;
  }

  get data() {
    return this._data;
  }

  set position(value) {
    this._position = value;
    this.x = value.x;
    this.y = value.y;
  }

  get position() {
    return this._position;
  }

  get totalMoney() {
    let t = 0;
    this.data.moneys.forEach(item => { t += item });
    return t;
  }

  get count() {
    if (this.data.moneys && this.data.moneys.length > 1)
      return this.data.moneys.length + '次'
    return '';
  }

  get tradeTime() {
    if (this.data.tradeTimes && this.data.tradeTimes.length > 0)
      return this.data.tradeTimes[0].format('HH:mm');
    return ''
  }

  ngOnInit() {
    console.log('item ng init')
  }

  ngAfterViewInit() {
    console.log('item view checked')
    this.h = this.rootDiv.nativeElement.clientHeight;
    this.w = this.rootDiv.nativeElement.clientWidth;
  }

  onMoving(e) {
    let element = e.source.getRootElement();
    let boundingClientRect = element.getBoundingClientRect();
    console.log(boundingClientRect.x)
    let parentPosition = this.getPosition(element);
    this.x = boundingClientRect.x - parentPosition.left
    this.y = boundingClientRect.y - parentPosition.top;
    console.log(this.x,this.y)
  }

  getPosition(el) {
    let x = 0;
    let y = 0;
    // offsetLeft:获取当前对象到其上级层左边的距离.
    // scrollLeft:设置或获取位于对象左边界和窗口中目前可见内容的最左端之间的距离
    // HTMLElement.offsetParent 是一个只读属性，返回一个指向最近的（指包含层级上的最近）包含该元素的定位元素或者最近的 table,td,th,body元素
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      x += el.offsetLeft - el.scrollLeft;
      console.log('el.offsetleft' + el.offsetLeft + 'el.scrollerLeft' + el.scrollerLeft)
      y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
    }
    return { top: y, left: x };
  }

  onDelete() {
    alertify.set({
      labels: { ok: "确定", cancel: "取消" }
    });
    alertify.confirm("确定要删除该记录吗？", e => {
      if (e) {
        if(this.data.oppositeAccount){
          let data={
            account:this.data.oppositeAccount,
            caseID:this.data.caseID
          }
          this.sqlService.exec(PhpFunctionName.DEL_RECORD_BY_ACCOUNT,data).subscribe(res => {
              this.message.sendRefreshChart()
          })
        }else{
          let data = {
            tableName:'trade_record',
            id:this.data.id
          }
          this.sqlService.exec(PhpFunctionName.DEL,data).subscribe(res=>{
            this.message.sendRefreshChart()
          })
        }
      }
    });
  }

  onConnect(){
    let dialogRef = this.dialog.open(AddLowerComponent, { disableClose: true });
    dialogRef.componentInstance.data = this.data;
  }
  onClick(){
    let dialogRef = this.dialog.open(AccountDetailComponent);
    dialogRef.componentInstance.data = this.data;
  }
}
