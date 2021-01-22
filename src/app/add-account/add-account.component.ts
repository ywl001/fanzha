import { Component, OnInit, Input, Inject } from '@angular/core';
import * as moment from 'moment'
import * as toastr from 'toastr';
import { SqlService } from '../service/sql.service';
import { MessageService } from '../service/message.service';
import { PhpFunctionName } from '../models/phpFunctionName';
import { FormControl } from '@angular/forms';
import { AccountNode } from '../models/accountNode';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-add-account',
  templateUrl: './add-account.component.html',
  styleUrls: ['./add-account.component.css']
})
export class AddAccountComponent implements OnInit {

  private id: string;
  state: string;

  caseID: string;

  /////////////////////////////////////////////////////////和html绑定的变量//////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //账号
  account: string;
  // 姓名
  accountName: string;
  //转账金额
  money: number;
  //公共查询时间
  day: number;
  hour: number;
  minute: number;

  //交易时间
  private _tradeTime: any;
  private tableName = 'start_account'
  get tradeTime() {
    return this._tradeTime;
  }
  set tradeTime(value) {
    this._tradeTime = value;
  }

  public get commonQueryTime() {
    return this.day * 60 * 24 + this.hour * 60 + this.minute;
  }
  public set commonQueryTime(value) {
    this.day = Math.floor(value / (24 * 60));
    console.log(this.day)
    this.hour = Math.floor((value - this.day * 24 * 60) / 60);
    this.minute = value - this.day * 24 * 60 - this.hour * 60;
  }

  datetimeControl = new FormControl()

  constructor(private sqlService: SqlService,
    private message: MessageService) { }

  private _data: AccountNode;
  get data() {
    return this._data;
  }

  set data(data: AccountNode) {
    if (data) {
      this._data = data;
      this.account = data.oppositeAccount;
      this.accountName = data.accountName;
      this.tradeTime = data.tradeTimes[0];
      this.money = data.moneys[0];
      this.commonQueryTime = data.commonQueryDuration;
      this.id = data.id;
    }
  }

  ngOnInit() {
  }

  onSubmit() {
    if (this.state == 'add') {
      let data = {
        tableName: this.tableName,
        tableData: this.insertData
      }
      this.sqlService.exec(PhpFunctionName.INSERT, data).subscribe(
        res => {
          if (res > 0) {
            toastr.info('插入起始账号成功');
            this.message.caseListChange()
          }
        }
      )
    } else {
      let tableData = this.updateData;
      if (!tableData) return;
      console.log('edit account',tableData,this.id)
      const data = {
        id: this.id,
        tableData: tableData,
        tableName: this.tableName
      }
      this.sqlService.exec(PhpFunctionName.UPDATE, data).subscribe(
        res => {
          console.log(res)
          if (res > 0) {
            toastr.info('修改起始账号成功');
            // this.dataService.data = item;
            this.message.startAccountChange(this.data)
          }
        }
      )
    }
  }

  get insertData() {
    if (this.account == '' || !this.tradeTime) {
      toastr.warning('账号或时间必须填写')
      return;
    }
    return {
      account: this.account,
      accountName: this.accountName,
      money: this.money,
      caseID: this.caseID,
      tradeTime: moment(this.tradeTime).format('YYYYMMDDHHmmss'),
      commonQueryDuration: this.commonQueryTime
    }
  }

  get updateData() {
    let o: any = {}
    if (this.accountName != this.data.accountName) {
      o.accountName = this.accountName;
      this.data.accountName = this.accountName;
    }
    if (this.account != this.data.oppositeAccount) {
      o.account = this.account;
      this.data.oppositeAccount = this.account;
    }
    if (this.money != this.data.moneys[0]) {
      o.money = this.money;
      this.data.moneys[0] = this.money;
    }
    if (this.tradeTime != this.data.tradeTimes[0]) {
      o.tradeTime = this.tradeTime.format('YYYYMMDDHHmmss');
      this.data.tradeTimes[0] = this.tradeTime;
    }
    if (this.commonQueryTime != this.data.commonQueryDuration) {
      o.commonQueryDuration = this.commonQueryTime;
      this.data.commonQueryDuration = this.commonQueryTime;
    }

    if (JSON.stringify(o) != '{}')
      return o;
    return null;
  }

  onChange(e) {
    let value: string = e.target.value;
    if (value.length == 14) {
      this.tradeTime = moment(value, 'YYYYMMDDHHmmss')
    }
  }
}
