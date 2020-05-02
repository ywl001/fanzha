import { Injectable } from '@angular/core';
import { SqlService } from './sql.service';
import * as moment from 'moment'
import { AccountNode } from '../models/accountNode';
import { Observable } from 'rxjs';
import { MessageService } from './message.service';
import { PhpFunctionName } from '../models/phpFunctionName';
import * as toastr from 'toastr';
import { Common } from '../models/common';
import { Field } from '../models/field';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private startAccount: AccountNode;
  private startTime: string;
  private endTime: string;
  private caseID:number;

  private times:number;

  nodes: Array<any> = [];
  waitCheckAccounts: Array<any> = [];

  node$: Observable<Array<AccountNode>>;

  constructor(private sqlService: SqlService, private message: MessageService) { }

  set data(value) {
    this.times = 0;
    
    this.nodes = [];
    this.startTime = moment(value.tradeTime).subtract(Common.BEFORE_TIME,'h').format('YYYYMMDDHHmmss')
    console.log(this.startTime)
    this.endTime = moment(value.tradeTime).add(Common.AFTER_TIME, 'h').format('YYYYMMDDHHmmss');
    console.log(this.endTime)
    this.startAccount = new AccountNode()
    this.caseID = parseInt(value.caseID);
    this.startAccount.accountName = value.accountName;
    this.startAccount.account = value.account;
    this.startAccount.tradeTimes.push(moment(value.tradeTime))

    this.waitCheckAccounts.push(this.startAccount);
    this.queryNodeByAccount(this.startAccount)
    this.times =0;
  }

  private currentAccount: AccountNode;

  private queryNodeByAccount(account: AccountNode) {
    this.currentAccount = account;
    let data = {
      account:account.account,
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
    console.timeEnd('query')
    let nodeMap = new Map()
    if (res && res.length > 0) {
      for (let i = 0; i < res.length; i++) {
        const item = res[i];
        let acc:AccountNode;
        if(item[Field.lowerAccount]){
          acc = new AccountNode();
          acc.caseID = parseInt(item[Field.caseID]);
          acc.account = item[Field.lowerAccount];
          acc.level = this.currentAccount.level + 1;
          acc.moneys.push(parseFloat(item.money));
          acc.tradeTimes.push(moment(item.tradeTime));
          this.currentAccount.children.push(acc);
          acc.parentAccount = this.currentAccount;
          this.waitCheckAccounts.push(acc);
        }
        if (item[Field.oppositeAccount]) {
          let key = item[Field.oppositeAccount].trim();
          if(nodeMap.has(key)){
            acc = nodeMap.get(key);
            acc.moneys.push(parseFloat(item.money));
            acc.tradeTimes.push(moment(item.tradeTime))
          }else{
            acc = new AccountNode();
            acc.caseID = parseInt(item[Field.caseID]);
            acc.account = item[Field.oppositeAccount];
            acc.accountName = item[Field.oppositeName];
            acc.level = this.currentAccount.level + 1;
            acc.moneys.push(parseFloat(item.money));
            acc.tradeTimes.push(moment(item.tradeTime))
            this.currentAccount.children.push(acc);
            acc.parentAccount = this.currentAccount;
            nodeMap.set(key,acc)
            this.waitCheckAccounts.push(acc);
          }
        }
        else if(item[Field.oppositeBankNumber]){
          acc = new AccountNode();
            acc.caseID = parseInt(item[Field.caseID]);
            acc.account = item[Field.oppositeBankNumber];
            acc.accountName = item[Field.oppositeName];
            acc.level = this.currentAccount.level + 1;
            acc.moneys.push(parseFloat(item.money));
            acc.tradeTimes.push(moment(item.tradeTime))
            this.currentAccount.children.push(acc);
            acc.parentAccount = this.currentAccount;
            // nodeMap.set(key,acc)
            this.waitCheckAccounts.push(acc);
        }
      }
    }
    this.nextAccount()
  }

  private createNode(item){

    let node = new AccountNode()
    for (const key in item) {
      if (node.hasOwnProperty(key)) {
        node[key] = item[key];
      }
    }

  }

  private nextAccount() {
    toastr.clear();
    toastr.info(`查询了账号:${this.currentAccount.accountName}`)
    this.nodes.push(this.waitCheckAccounts.shift())
    if (this.waitCheckAccounts.length > 0) {
      this.times++;
      this.queryNodeByAccount(this.waitCheckAccounts[0])
    } else {
      this.message.sendAccountNode(this.nodes);
      this.message.sendCloseLeft()
    }
  }
}
