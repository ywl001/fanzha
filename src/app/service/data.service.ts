import { Injectable } from '@angular/core';
import { SqlService } from './sql.service';
import * as moment from 'moment'
import { AccountNode } from '../models/accountNode';
import { MessageService } from './message.service';
import { PhpFunctionName } from '../models/phpFunctionName';
import * as toastr from 'toastr';
import { Common } from '../models/common';
import { AddLowerAccountEvent, QueryDurationEvent } from '../models/editNodeEvent';
import { LocalStorgeService } from './local-storge.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private caseID: string;

  nodes: Array<AccountNode> = [];
  waitQueryAccounts: Array<AccountNode> = [];
  private currentAccount: AccountNode;

  constructor(private sqlService: SqlService, private message: MessageService,private localService:LocalStorgeService) {
    message.queryDuration$.subscribe(e => { this.durationChange(e) });
    message.lowerAccount$.subscribe(e => this.addLowerAccount(e));
    message.delNode$.subscribe(e => { this.delNode(e) });
    message.saveData$.subscribe(e => {this.saveData() });
  }

  private durationChange(e: QueryDurationEvent) {
    if (e && e.node) {
      console.log(this.nodes)
      let node = e.node;
      node.queryDuration = e.duration;
      this.reQueryNode(node);
    }
  }

  private saveData(){
    const firstNode = this.nodes[0];
    const key = firstNode.caseID +'-'+ firstNode.oppositeAccount+'-'+firstNode.tradeTimes[0];
    this.localService.setObject(key,this.nodes);
  }

  private addLowerAccount(e: AddLowerAccountEvent) {
    console.log(e.account)
    if (e && e.node) {
      let node = e.node;
      if (node.children.length > 0) {
        if (e.account.trim() == '') {
          node.children = [];
          node.lowerAccount = null;
          this.message.sendAccountNode(this.nodes)
        } else {
          node.lowerAccount = e.account;
          this.reQueryNode(node);
        }
      } else {
        node.lowerAccount = e.account;
        this.reQueryNode(node);
        // const lowerNode = this.createLowerNode(node, e.account)
        // this.waitQueryAccounts.push(lowerNode);
        // this.queryNode(lowerNode);
      }
    }
  }

  private delNode(e: AccountNode) {
    if (e) {
      this.clearChildNode(e);
      this.message.sendAccountNode(this.nodes);
    }
  }

  /**内存中重新查询节点 */
  private reQueryNode(node: AccountNode) {
    //1、清除该节点及其子节点
    this.clearChildNode(node);
    //2、把该节点加入到待查数组中
    this.waitQueryAccounts.push(node)
    //3、把该节点的下级节点加入待查数组
    if (node.lowerAccount && node.lowerAccount.trim() != '') {
      const lowerAccounts: string[] = node.lowerAccount.split('|');
      lowerAccounts.forEach(account => {
        const lowerNode = this.createLowerNode(node, account)
        this.waitQueryAccounts.push(lowerNode)
      })
    }
    //4、查询
    this.queryNode(node);
  }

  private clearChildNode(node: AccountNode) {
    console.log('clear child node')
    if (node) {
      let children = AccountNode.getAllChild(node);
      children.push(node);
      for (let i = 0; i < children.length; i++) {
        const node = children[i];
        for (let j = 0; j < this.nodes.length; j++) {
          const n = this.nodes[j];
          if (n.id == node.id) {
            this.nodes.splice(j, 1)
          }
        }
      }
    }
  }

  set data(value: AccountNode) {
    console.log(value)
    this.nodes = [];
    this.caseID = value.caseID;
    this.waitQueryAccounts.push(value);
    this.queryNode(value)
  }

  private queryNode(node: AccountNode) {
    this.currentAccount = node;
    //查询时间
    let time = this.getQueryTime(node)
    //查询账号,对于第三方，如果对端银行卡存在，说明钱进入银行卡了，直接查询银行卡，否则查账号
    let account = this.getQueryAccount(node)

    if (!account || account == 'null' || node.queryDuration == 0) {
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
  getQueryTime(node: AccountNode) {
    // console.log(node)
    let startMoment = this.getMinTime(node.tradeTimes)
    let startTime = startMoment.format('YYYY-MM-DD HH:mm:ss');
    //设置查询时长的结束时间
    let endTime_select = startMoment.clone().add(node.queryDuration, 'h').format('YYYY-MM-DD HH:mm:ss');
    //正常的公共查询时间
    let endTime_normal = startMoment.clone().add(Common.AFTER_TIME, 'h').format('YYYY-MM-DD HH:mm:ss');
    let endTime = (node.queryDuration) ? endTime_select : endTime_normal;
    // console.log(startTime,endTime)
    return { start: startTime, end: endTime }
  }

  //获取多个交易时间中的最小值
  private getMinTime(datetimes: any[]) {
    return datetimes.reduce((pre, cur) => {
      if (pre.isSameOrBefore(cur)) cur = pre;
      // console.log(cur)
      return cur;
    })
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
            this.waitQueryAccounts.push(node)
          }
        } else {
          //空账号
          if (item.payeeName == '手续费')
            continue;
          else {
            node = this.createNode(null, item);
            this.nodes.push(node)
          }
        }

        //模拟下级账号
        if (item.lowerAccount) {
          const lowerAccounts: string[] = item.lowerAccount.split('|');
          lowerAccounts.forEach(account => {
            const lowerNode = this.createLowerNode(node, account)
            this.waitQueryAccounts.push(lowerNode)
          })
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
    node.ids.push(item.id)
    node.moneys.push(parseFloat(item['money']));
    node.tradeTimes.push(moment(item['tradeTime']))
    node.leftMoneys.push(parseFloat(item['leftMoney']))
    node.tradeNumbers.push(item['tradeNumber'])
    return node;
  }

  private nextAccount() {
    toastr.info(`查询了账号:${this.currentAccount.oppositeAccount}`)
    toastr.clear();
    this.nodes.push(this.waitQueryAccounts.shift())
    if (this.waitQueryAccounts.length > 0) {
      this.queryNode(this.waitQueryAccounts[0])
    } else {
      this.saveData();
      console.log(this.nodes)
      this.message.sendAccountNode(this.nodes);
      console.log('complete', this.nodes)
    }
  }

  private createLowerNode(node: AccountNode, account: string): AccountNode {
    let lowerNode = new AccountNode();
    lowerNode.isFalseNode = true;
    lowerNode.account = node.account;
    lowerNode.oppositeAccount = account;
    lowerNode.moneys = node.moneys;
    lowerNode.tradeTimes = node.tradeTimes;
    lowerNode.level = node.level + 1;
    lowerNode.parentAccount = node;
    lowerNode.id = node.id;
    lowerNode.queryDuration = node.queryDuration;
    lowerNode.isLowerAccount = true;
    lowerNode.lowerAccount = node.lowerAccount;
    node.children.push(lowerNode);
    return lowerNode;
  }
}
