import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment'
import * as toastr from 'toastr';
import { SqlService } from '../service/sql.service';
import { MessageService } from '../service/message.service';
import { PhpFunctionName } from '../models/phpFunctionName';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-add-account',
  templateUrl: './add-account.component.html',
  styleUrls: ['./add-account.component.css']
})
export class AddAccountComponent implements OnInit {

  constructor(private sqlService: SqlService, private message: MessageService) { }

  caseID: string;
  account: string;
  accountName:string;
  private _tradeTime: any;

  datetimeControl = new FormControl()

  ngOnInit() {
  }

  get tradeTime(){
    return this._tradeTime;
  }

  set tradeTime(value){
    console.log(value)
    console.log(typeof value)
    this._tradeTime = value;
  }

  onSubmit() {
    let data={
      tableName:'start_account',
      tableData:this.sqlData
    }
    this.sqlService.exec(PhpFunctionName.INSERT, data).subscribe(
      res => {
        if (res > 0) {
          toastr.info('插入起始账号成功');
          this.message.sendRefresh()
        }
      }
    )
  }

  get sqlData() {
    if (this.account == '' || !this.tradeTime) {
      toastr.warning('账号或时间必须填写')
      return;
    }
    return {
      account: this.account,
      accountName:this.accountName,
      caseID: this.caseID,
      tradeTime: moment(this.tradeTime).format('YYYYMMDDHHmmss')
    }
  }

  onChange(e){
    let value:string = e.target.value;
    if(value.length == 14){
       this.tradeTime = moment(value,'YYYYMMDDHHmmss').toDate();
    }
  }
}
