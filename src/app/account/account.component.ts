import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AccountNode } from '../models/accountNode';
import { SqlService } from '../service/sql.service';
import { MessageService } from '../service/message.service';
import { PhpFunctionName } from '../models/phpFunctionName';

declare var alertify;

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  @ViewChild('root', { static: false }) rootDiv: ElementRef;

  constructor(private sqlService: SqlService,private message:MessageService) { }

  w: number;
  h: number;

  x: number;
  y: number;

  accountName: string;
  accountNumber: string;
  level: number;
  moneys: Array<number>;
  tradeTimes: Array<any>
  bankID: number;
  caseID:number;
  private _position;

  children: Array<AccountComponent> = [];
  parent:AccountComponent;


  private _data: AccountNode;

  set data(value: AccountNode) {
    this._data = value;
    this.level = value.level;
    this.caseID = value.caseID;
    this.accountName = value.accountName;
    this.accountNumber = value.account;
    this.moneys = value.moneys;
    this.tradeTimes = value.tradeTimes;
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
    this.moneys.forEach(item => { t += item });
    return t;
  }

  get count() {
    if (this.moneys && this.moneys.length > 1)
      return this.moneys.length + '次'
    return '';
  }

  get tradeTime() {
    if (this.tradeTimes && this.tradeTimes.length > 0)
      return this.tradeTimes[0].format('HH:mm');
    return ''
  }

  get data() {
    return this._data;
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
    console.log('x: ' + (boundingClientRect.x - parentPosition.left), 'y: ' + (boundingClientRect.y - parentPosition.top));
    this.x = boundingClientRect.x - parentPosition.left
    this.y = boundingClientRect.y - parentPosition.top
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
        let data={
          account:this.accountNumber,
          caseID:this.caseID
        }
        this.sqlService.exec(PhpFunctionName.DEL_RECORD_BY_ACCOUNT,data).subscribe(res => {
            this.message.sendRefreshChart()
        })
      }
    });
  }
}
