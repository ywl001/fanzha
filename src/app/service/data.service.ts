import { Injectable } from '@angular/core';
import { SqlService } from './sql.service';
import * as moment from 'moment'
import { BankAccount } from '../models/bankAccount';
import { Observable } from 'rxjs';
import { MessageService } from './message.service';
import { PhpFunctionName } from '../models/phpFunctionName';
import * as toastr from 'toastr';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private startAccount: BankAccount;
  private accountType;
  private startTime: string;
  private endTime: string;
  private duration;
  private caseID:number;

  private times:number;

  nodes: Array<any> = [];
  waitCheckAccounts: Array<any> = [];

  node$: Observable<Array<BankAccount>>;

  constructor(private sqlService: SqlService, private message: MessageService) { }

  set data(value) {
    this.times = 0;
    this.message.sendIsBusy(true)
    this.nodes = [];
<<<<<<< HEAD
    this.startTime = value.tradeTime
    console.log(this.startTime)
    this.endTime = moment(value.tradeTime).add(6, 'hours').format('YYYY-MM-DD HH:mm:ss');
    console.log(this.endTime)
=======
    this.startTime = value.tradeTime;
    this.endTime = moment(this.startTime).add(8, 'hours').format('YYYYMMDDHHmmss');

>>>>>>> a20ecfee8e8d0271521bb55d5542e4aef98730e3
    this.startAccount = new BankAccount()
    this.caseID = parseInt(value.caseID);
    this.startAccount.accountName = value.accountName;
    this.startAccount.accountNumber = value.account;
    this.startAccount.tradeTimes.push(moment(this.startTime))
    this.waitCheckAccounts.push(this.startAccount);

    this.times =0;
    this.queryNodeByAccount(this.startAccount)
  }

  private currentAccount: BankAccount;

  private queryNodeByAccount(account: BankAccount) {
    this.currentAccount = account;
    let data = {
      account:account.accountNumber,
      startTime:this.startTime,
      endTime:this.endTime,
      caseID:this.caseID
    }

    console.time('query')
    this.sqlService.exec(PhpFunctionName.SELECT_ACCOUNT_OUT_RECROD,data).subscribe(
      res => { this.processData(res) }
    )
  }

  private processData(res) {
<<<<<<< HEAD
    console.timeEnd('query')
=======
    this.times++;
    toastr.info(`查询了${this.times}个账号`)
>>>>>>> a20ecfee8e8d0271521bb55d5542e4aef98730e3
    let nodeMap = new Map()
    if (res && res.length > 0) {
      for (let i = 0; i < res.length; i++) {
        const item = res[i];
        if (item.otherAccount) {
          let key = item.otherAccount.trim()+'-'+item.level;
          let acc:BankAccount;
          if(nodeMap.has(key)){
            acc = nodeMap.get(key);
            acc.moneys.push(parseFloat(item.money));
            acc.tradeTimes.push(moment(item.tradeTime))
          }else{
            acc = new BankAccount();
            acc.bankID = parseInt(item.id);
            acc.caseID = parseInt(item.caseID);
            acc.accountNumber = item.otherAccount;
            acc.accountName = item.otherName;
            acc.level = this.currentAccount.level + 1;
            acc.moneys.push(parseFloat(item.money));
            acc.tradeTimes.push(moment(item.tradeTime))
            this.currentAccount.children.push(acc);
            acc.parentAccount = this.currentAccount;
            nodeMap.set(key,acc)
            this.waitCheckAccounts.push(acc);
          }
        }
      }
    }
    this.nextAccount()
  }

  private times = 0
  private nextAccount() {
    toastr.info(`查询了${this.times}个账号`)
    this.nodes.push(this.waitCheckAccounts.shift())
    if (this.waitCheckAccounts.length > 0) {
      this.times++;
      this.queryNodeByAccount(this.waitCheckAccounts[0])
    } else {
      this.message.sendAccountNode(this.nodes)
      // this.message.sendIsBusy(false)
    }
  }
}
