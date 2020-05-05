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
  private caseID: number;

  private times: number;

  nodes: Array<any> = [];
  waitCheckAccounts: Array<any> = [];

  node$: Observable<Array<AccountNode>>;

  constructor(private sqlService: SqlService, private message: MessageService) { }

  set data(value) {
    this.times = 0;

    this.nodes = [];
    this.startTime = moment(value.tradeTime).format('YYYYMMDDHHmmss')
    console.log(this.startTime)
    this.endTime = moment(value.tradeTime).add(Common.AFTER_TIME, 'h').format('YYYYMMDDHHmmss');
    console.log(this.endTime)
    this.startAccount = new AccountNode()
    this.caseID = parseInt(value.caseID);
    this.startAccount.accountName = value.accountName;
    this.startAccount.oppositeAccount = value.account;
    this.startAccount.tradeTimes.push(moment(value.tradeTime));
    this.startAccount.moneys.push(parseFloat(value.money))

    this.waitCheckAccounts.push(this.startAccount);
    this.queryNodeByAccount(this.startAccount)
    this.times = 0;
  }

  private getMinTime(datetimes){
    let a = datetimes[0];
    for (let i = 0; i < datetimes.length; i++) {
      const time = datetimes[i];
      if(time.isSameOrBefore(a))
        a = time;
    }
    return a;
  }

  private currentAccount: AccountNode;

  private queryNodeByAccount(node: AccountNode) {
    this.currentAccount = node;
    let startMoment = this.getMinTime(node.tradeTimes)
    let startTime = startMoment.format('YYYY-MM-DD HH:mm:ss');
    let endTime;
    if(node.queryDuration && node.queryDuration > 0){
      endTime = startMoment.clone().add(node.queryDuration,'h').format('YYYY-MM-DD HH:mm:ss');
    }else{
      endTime = startMoment.clone().add(Common.AFTER_TIME,'h').format('YYYY-MM-DD HH:mm:ss');
    }
    let data = {
      startTime: startTime,
      endTime: endTime,
      caseID: this.caseID
    }
    console.log(data.startTime,data.endTime)
    if (node.isThird && node.isThird == '1') {
      if (node.oppositeAccount || node.oppositeBankNumber)
        data['account'] = node.oppositeBankNumber ? node.oppositeBankNumber : node.oppositeAccount
    } else {
      data['account'] = node.oppositeAccount
    }

    if (!data['account']) {
      this.nextAccount()
    } else {
      console.time('query')
      this.sqlService.exec(PhpFunctionName.SELECT_ACCOUNT_OUT_RECROD, data).subscribe(
        res => { this.processData(res) }
      )
    }
  }

  private processData(res) {
    console.timeEnd('query')
    if (res && res.length > 0) {
      let nodeMap = new Map()
      for (let i = 0; i < res.length; i++) {
        const item = res[i];
        let node: AccountNode;
        let key = item[Field.isThird] == '1' ? item[Field.oppositeAccount] + item[Field.oppositeBankNumber] : item[Field.oppositeAccount];
        if (key) {
          if (nodeMap.has(key)) {
            this.createNode(nodeMap.get(key), item)
          } else {
            node = this.createNode(null, item);
            nodeMap.set(key, node);
            this.waitCheckAccounts.push(node)
          }
        } else {
          //空账号
          if(item.payeeName == '手续费' || Math.abs(parseFloat(item.money)) < 100)
            continue;
          else{
            node = this.createNode(null, item);
            this.nodes.push(node)
          }
        }

        //模拟下级账号
        if (item.lowerAccount) {
          let lowerNode = new AccountNode();
          lowerNode.account = item.account;
          lowerNode.oppositeAccount = item.lowerAccount;
          lowerNode.moneys.push(parseFloat(item.money));
          lowerNode.tradeTimes.push(moment(item.tradeTime));
          lowerNode.level = node.level + 1;
          lowerNode.parentAccount = node;
          lowerNode.id = item.id;
          lowerNode.queryDuration = item.queryDuration;
          node.children.push(lowerNode);
          this.waitCheckAccounts.push(lowerNode)
        }
      }
    }
    this.nextAccount()
  }

  private createNode(node: AccountNode, item) {
    if (!node) {
      node = new AccountNode()
      for (const key in item) {
        if (node.hasOwnProperty(key)) {
          if(key == Field.queryDuration){
            node[key] = parseFloat(item[key])
          }
          node[key] = item[key];
        }
      }
      node.level = this.currentAccount.level + 1;
      this.currentAccount.children.push(node);
      node.parentAccount = this.currentAccount;
    }
    node.moneys.push(parseFloat(item[Field.money]));
    node.tradeTimes.push(moment(item[Field.tradeTime]))
    node.leftMoneys.push(parseFloat(item[Field.leftMoney]))
    node.tradeNumbers.push(item[Field.tradeNumber])
    return node;
  }

  private nextAccount() {
    toastr.clear();
    toastr.info(`查询了账号:${this.currentAccount.oppositeAccount}`)
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
