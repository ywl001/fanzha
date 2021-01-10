import { Injectable } from '@angular/core';
import { SqlService } from './sql.service';
import * as moment from 'moment'
import { AccountNode } from '../models/accountNode';
import { MessageService } from './message.service';
import { PhpFunctionName } from '../models/phpFunctionName';
import * as toastr from 'toastr';
import { Common } from '../models/common';
import { QueryDurationEvent } from '../models/queryDurationEvent';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private caseID: string;

  nodes: Array<AccountNode> = [];
  waitCheckAccounts: Array<AccountNode> = [];
  private currentAccount: AccountNode;

  constructor(private sqlService: SqlService, private message: MessageService) {
    message.queryDuration$.subscribe(e=>{this.durationChange(e)})
  }

  private durationChange(e:QueryDurationEvent){
    console.log(e)
    if(e && e.node){
      let node = e.node;
      console.log('before')
      console.log(this.nodes)
      this.clearChildNode(node);
      console.log('after:')
      console.log(this.nodes)
      node.queryDuration = e.duration;
      this.waitCheckAccounts.push(node);
      this.queryNodeByAccount(node);
    }
  }

  private clearChildNode(node:AccountNode){
    let children = AccountNode.getAllChild(node);
    console.log('children:',children)
    children.push(node);
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      for (let j = 0; j < this.nodes.length; j++) {
        const n = this.nodes[j];
        if(n.id == node.id){
          this.nodes.splice(j,1)
        }
      }
    }
  }

  set data(value: AccountNode) {
    console.log(value)
    this.nodes = [];
    this.caseID = value.caseID;
    this.waitCheckAccounts.push(value);
    this.queryNodeByAccount(value)
  }

  private queryNodeByAccount(node: AccountNode) {
    this.currentAccount = node;
    //查询时间
    let time = this.getQueryTime(node)
    //查询账号,对于第三方，如果对端银行卡存在，说明钱进入银行卡了，直接查询银行卡，否则查账号
    let account = this.getQueryAccount(node)

    if (!account || account == 'null') {
      //对于账号不存在的清空下，直接查下一个
      this.nextAccount()
    } else {
      let data = {
        startTime: time.start,
        endTime: time.end,
        caseID: this.caseID,
        account: account
      }
      this.sqlService.exec(PhpFunctionName.SELECT_ACCOUNT_OUT_RECROD, data).subscribe(
        res => { this.processData(res) }
      )
    }
  }

  /**获得查询时间 */
  getQueryTime(node) {
    // console.log(node)
    let startMoment = this.getMinTime(node.tradeTimes)
    let startTime = startMoment.format('YYYY-MM-DD HH:mm:ss');
    //设置查询时长的结束时间
    let endTime_select = startMoment.clone().add(node.queryDuration, 'h').format('YYYY-MM-DD HH:mm:ss');
    //正常的公共查询时间
    let endTime_normal = startMoment.clone().add(Common.AFTER_TIME, 'h').format('YYYY-MM-DD HH:mm:ss');
    let endTime = (node.queryDuration && node.queryDuration > 0) ? endTime_select : endTime_normal;
    // console.log(startTime,endTime)
    return { start: startTime, end: endTime }
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

  /**获得查询的账号 */
  private getQueryAccount(node: AccountNode) {
    let account;
    if (node.isThird && node.isThird == '1') {
      if (node.oppositeAccount || node.oppositeBankNumber)
        account = node.oppositeBankNumber ? node.oppositeBankNumber : node.oppositeAccount
    } else {
      account = node.oppositeAccount
    }
    return account;
  }

  /**解析查询数据 */
  private processData(res) {
    // console.timeEnd('query')
    if (res && res.length > 0) {
      let nodeMap = new Map()
      for (let i = 0; i < res.length; i++) {
        const item = res[i];
        let node: AccountNode;
        let key = item['isThird'] == '1' ? item['oppositeAccount'] + item['oppositeBankNumber'] : item['oppositeAccount'] + item['tradeType'];
        if (key) {
          if (nodeMap.has(key)) {
            node = nodeMap.get(key)
            this.createNode(node, item)
          } else {
            node = this.createNode(null, item);
            nodeMap.set(key, node);
            this.waitCheckAccounts.push(node)
          }
        } else {
          //空账号
          if (item.payeeName == '手续费' || Math.abs(parseFloat(item.money)) < 100)
            continue;
          else {
            node = this.createNode(null, item);
            this.nodes.push(node)
          }
        }

        //模拟下级账号
        if (item.lowerAccount) {
          let lowerNode = new AccountNode();
          lowerNode.isFalseNode = true;
          lowerNode.account = item.account;
          lowerNode.oppositeAccount = item.lowerAccount;
          lowerNode.moneys.push(parseFloat(item.money));
          lowerNode.tradeTimes.push(moment(item.tradeTime));
          lowerNode.level = node.level + 1;
          lowerNode.parentAccount = node;
          lowerNode.id = item.id;
          lowerNode.queryDuration = item.queryDuration;
          lowerNode.isLowerAccount = true;
          lowerNode.lowerAccount = item.lowerAccount;
          node.children.push(lowerNode);
          this.waitCheckAccounts.push(lowerNode)
        }
      }
    }
    this.nextAccount()
  }

  private createNode(node: AccountNode, item: any) {
    if (!node) {
      node = new AccountNode()
      for (const key in item) {
        if (node.hasOwnProperty(key)) {
          if (key == 'queryDuration') {
            node[key] = parseFloat(item[key])
          }
          node[key] = item[key];
        }
      }
      node.level = this.currentAccount.level + 1;
      this.currentAccount.children.push(node);
      node.parentAccount = this.currentAccount;
    }
    node.moneys.push(parseFloat(item['money']));
    node.tradeTimes.push(moment(item['tradeTime']))
    node.leftMoneys.push(parseFloat(item['leftMoney']))
    node.tradeNumbers.push(item['tradeNumber'])
    return node;
  }

  private nextAccount() {
    toastr.info(`查询了账号:${this.currentAccount.oppositeAccount}`)
    toastr.clear();
    this.nodes.push(this.waitCheckAccounts.shift())
    if (this.waitCheckAccounts.length > 0) {
      this.queryNodeByAccount(this.waitCheckAccounts[0])
    } else {
      this.message.sendAccountNode(this.nodes);
      console.log('complete',this.nodes)
    }
  }
}
