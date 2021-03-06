import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { AccountNode } from '../models/accountNode';
import { SqlService } from '../service/sql.service';
import { MessageService } from '../service/message.service';
import { PhpFunctionName } from '../models/phpFunctionName';
import { MatDialog } from '@angular/material';
import { AccountDetailComponent } from '../account-detail/account-detail.component';
import { AddValueComponent } from '../add-value/add-value.component';
import * as moment from 'moment';
import { ChangeDurationComponent } from '../change-duration/change-duration.component';

declare var alertify;

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

  @ViewChild('root', { static: false }) rootDiv: ElementRef;

  constructor(private sqlService: SqlService,
    public dialog: MatDialog,
    private message: MessageService) { }

  w: number;
  h: number;

  x: number;
  y: number;


  level: number;
  //是否是第一个节点
  isFirstNode: boolean;
  //是否是手动添加的假节点
  isFalseNode: boolean;

  children: Array<AccountComponent> = [];
  parent: AccountComponent;

  private _data: AccountNode;

  @Input()
  set data(value: AccountNode) {
    this._data = value;
    this.level = value.level;
    this.isFirstNode = value.isFirstNode;
    this.isFalseNode = value.isFalseNode;

  }

  get data(): AccountNode {
    return this._data;
  }

  // private _position;
  // set position(value) {
  //   this._position = value;
  //   this.x = value.x;
  //   this.y = value.y;
  // }

  // get position() {
  //   return this._position;
  // }

  // isShowBtn():boolean{

  // }

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
      return this.getMinTime(this.data.tradeTimes).format('HH:mm');
    return ''
  }

  private getMinTime(datetimes) {
    let a = datetimes[0];
    for (let i = 0; i < datetimes.length; i++) {
      const time = datetimes[i];
      if (time.isSameOrBefore(a))
        a = time;
    }
    return a;
  }

  get bgColor() {
    if (this.data.isLowerAccount)
      return 'lightBlue'
    if (this.data.remark)
      return 'lightPink'
    return 'lightseagreen'
  }

  get secondLineContent() {
    let str = '';
    if (this.data.tradeDesc && this.data.tradeDesc.indexOf('ATM') != -1)
      str = this.data.tradeDesc + '---' + this.data.tradeBankStationName;
    else if (this.data.tradeType && this.data.tradeType.indexOf('ATM') != -1)
      str = this.data.tradeType + '---' + this.data.tradeBankStationName;
    else if (this.data.oppositeName)
      str = this.data.oppositeName;
    else if (this.data.oppositeBankNumber)
      str = this.data.oppositeBankNumber
    else if (this.data.oppositeAccount)
      str = this.data.oppositeAccount;
    else if (this.data.payeeName)
      str = this.data.payeeName;
    else if (this.data.tradeBankStationName)
      str = this.data.tradeBankStationName;
    else if (this.data.tradeType)
      str = this.data.tradeType;
    return str;
  }

  ngOnInit() {
    // console.log('item ng init')
  }

  ngAfterViewInit() {
    // console.log('item view checked')
    this.h = this.rootDiv.nativeElement.clientHeight;
    this.w = this.rootDiv.nativeElement.clientWidth;
  }

  // onMoving(e) {
  //   let element = e.source.getRootElement();
  //   let boundingClientRect = element.getBoundingClientRect();
  //   console.log(boundingClientRect.x)
  //   let parentPosition = this.getPosition(element);
  //   this.x = boundingClientRect.x - parentPosition.left
  //   this.y = boundingClientRect.y - parentPosition.top;
  //   console.log(this.x,this.y)
  // }

  // getPosition(el) {
  //   let x = 0;
  //   let y = 0;
  //   // offsetLeft:获取当前对象到其上级层左边的距离.
  //   // scrollLeft:设置或获取位于对象左边界和窗口中目前可见内容的最左端之间的距离
  //   // HTMLElement.offsetParent 是一个只读属性，返回一个指向最近的（指包含层级上的最近）包含该元素的定位元素或者最近的 table,td,th,body元素
  //   while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
  //     x += el.offsetLeft - el.scrollLeft;
  //     console.log('el.offsetleft' + el.offsetLeft + 'el.scrollerLeft' + el.scrollerLeft)
  //     y += el.offsetTop - el.scrollTop;
  //     el = el.offsetParent;
  //   }
  //   return { top: y, left: x };
  // }

  onDelete() {
    alertify.set({
      labels: { ok: "确定", cancel: "取消" }
    });
    alertify.confirm("确定要删除该记录吗？", e => {
      if (e) {
        let data = {
          tableName: 'trade_record',
          ids: this.data.ids.join(',')
        }
        this.sqlService.exec(PhpFunctionName.DEL_BY_IDS, data).subscribe(res => {
          console.log('del ok')
          this.message.delNode(this.data)
        })
      }
    });
  }


  onClick() {
    let dialogRef = this.dialog.open(AccountDetailComponent);
    dialogRef.componentInstance.data = this.data;
    console.log(this.data)
  }

  onSetValue(e) {
    console.log(e);
    let dialogRef = this.dialog.open(AddValueComponent, { disableClose: true });
    let data = {
      node: this.data,
      field: e,
    }
    dialogRef.componentInstance.data = data;
  }

  onChangDuration() {
    let dialogRef = this.dialog.open(ChangeDurationComponent, { disableClose: true});
    dialogRef.componentInstance.data = this.data;
  }
}
