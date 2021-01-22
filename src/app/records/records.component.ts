import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { SqlService } from '../service/sql.service';
import { MessageService } from '../service/message.service';
import { MatDialog } from '@angular/material';
import { AddCaseComponent } from '../add-case/add-case.component';
import { AddAccountComponent } from '../add-account/add-account.component';
import * as toastr from 'toastr';
import * as moment from 'moment';
import { ExcelService } from '../service/excel.service';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../service/data.service';
import { PhpFunctionName } from '../models/phpFunctionName';
import { AccountNode } from '../models/accountNode';
import { TradeRecord } from '../models/tradeRecord';
import { LocalStorgeService } from '../service/local-storge.service';
declare var alertify;


@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.scss']
})
export class RecordsComponent {

  // private allRecords: Array<any>;

  /**
   * 案件列表
   */
  caseList;

  /**起始账号列表 */
  itemList: Array<AccountNode>;

  /**excel和数据库的对照字段 */
  private field: any;

  /**当前案件的id，excel导入数据库时添加上 */
  private caseID: any;

  /**当前显示的流程图的账号，当流程数据修改时，刷新视图使用 */
  currentItem: AccountNode;

  /**html中input的引用 */
  @ViewChild('inputFile', { static: false }) inputFile: ElementRef;

  constructor(
    private sqlService: SqlService,
    private http: HttpClient,
    private excelService: ExcelService,
    public dialog: MatDialog,
    private message: MessageService,
    private dataService: DataService,
    private localService:LocalStorgeService) {
  }

  ngOnInit() {
    //获取excel和数据库的映射关系
    this.http.get('assets/field.json').subscribe(res => { this.field = res })
    //获取案件及查询账号信息
    this.message.refreshChart$.subscribe(
      res => {
        if (this.currentItem) this.dataService.data = this.currentItem;
      }
    )

    this.message.queryDurationChange$.subscribe(
      res => {
        if (res.isFirstNode && this.currentItem) {
            this.currentItem.queryDuration = res.duration;
        }
      }
    )

    this.message.startAccountChange$.subscribe(res=>this.onStartAccountChange(res))
  }

  private _data;

  @Input()
  set data(res) {
    if (this._data != res) {
      this._data = res;
      let c = new Map();
      this.caseList = [];
      for (let i = 0; i < res.length; i++) {
        let o = res[i];
        c.set(o.caseID, o)
      }
      c.forEach((value) => {
        this.caseList.push(value)
      })
    }
  }

  get data() {
    return this._data;
  }

  onOpenPanel(lawCase) {
    this.caseID = lawCase.caseID;
    this.message.sendCaseName(lawCase.caseName)
    let itemList = this.data.filter(item => item.caseID == lawCase.caseID && item.accountID)
    console.log(itemList)
    this.itemList = itemList.map(item => {
      let startAccount = new AccountNode();
      startAccount.isFirstNode = true;
      startAccount.id = item.accountID;
      startAccount.queryDuration = parseInt(item.queryDuration);
      this.caseID = parseInt(item.caseID);
      startAccount.accountName = item.accountName;
      startAccount.oppositeAccount = item.account;
      startAccount.caseID = item.caseID;
      startAccount.tradeTimes.push(moment(item.tradeTime));
      startAccount.moneys.push(parseFloat(item.money));
      startAccount.commonQueryDuration = item.commonQueryDuration;
      // console.log(startAccount.oppositeAccount+':'+startAccount.queryDuration)
      return startAccount;
    })
    console.log(this.itemList)
  }

  /**增加起始账号 */
  onAddAccount(lawCase) {
    let dialogRef = this.dialog.open(AddAccountComponent, { disableClose: true });
    dialogRef.componentInstance.state = 'add';
    dialogRef.componentInstance.caseID = lawCase.caseID;
  }

  /**修改案件信息，双击案件时 */
  onEditCase(lawCase) {
    let dialogRef = this.dialog.open(AddCaseComponent, { disableClose: true });
    dialogRef.componentInstance.data = lawCase;
  }

  onItemClick(item) {
    this.currentItem = item;
    console.log(item)
    const key = item.caseID +'-'+ item.oppositeAccount+'-'+item.tradeTimes[0];
    const nodes = this.localService.getObject(key);
    if(nodes){
      // console.log(nodes);
      //此处维护dataService的nodes，
      this.dataService.nodes = nodes;
      this.message.showChart(nodes)
    }else{
      this.dataService.data = item;
    }
    
  }

  /**删除记录 */
  onDelete(item: AccountNode) {
    alertify.set({
      labels: { ok: "确定", cancel: "取消" }
    });
    alertify.confirm("确定要删除吗？", e => {
      if (e) {
        let data = {
          tableName: 'start_account',
          id: item.id
        }
        this.sqlService.exec(PhpFunctionName.DEL, data).subscribe(res => this.message.caseListChange())
      }
    });
  }

  onEdit(item:AccountNode){
    let dialogRef = this.dialog.open(AddAccountComponent, { disableClose: true});
    dialogRef.componentInstance.state = 'edit'
    dialogRef.componentInstance.data = item;
  }

  private onStartAccountChange(data){
    console.log('start account change')
    this.currentItem = data;
    const key = data.caseID +'-'+ data.oppositeAccount+'-'+data.tradeTimes[0];
    this.localService.remove(key);
    this.dataService.data = data;
  }

  /////////////////////////////////////////////下面是导入excel数据/////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  onAddFile($event) {
    this.inputFile.nativeElement.click()
  }

  private fileIndex = 0;
  private files;
  onFileChange(event) {
    //清除对同一文件不触发change
    this.files = event.target.files;
    this.insertExcel()
  }

  private insertExcel() {
    if (this.fileIndex < this.files.length) {
      let file = this.files[this.fileIndex]
      this.getExcelData(file)
    } else {
      this.fileIndex = 0;
    }
  }

  private getExcelData(file) {
    this.excelService.importExcel(file).subscribe(
      res => {
        let datas = [];
        // if(!this.validateTime(res[0])){
        //   toastr.warning('交易时间格式不对，请修改交易时间')
        //   return ;
        // }
        let isSwap = this.isAlipay(res);
        const isThird = res[0].hasOwnProperty('付款支付帐号')
        console.log('is third:' + isSwap)
        for (let i = 0; i < res.length; i++) {
          let o: TradeRecord;
          o = this.convertDataKey(res[i], isSwap,isThird);
          if (o.account) {
            datas.push(o);
          }
        }
        this.insertData(datas)
      }
    )
  }
  private insertData(records) {
    this.sqlService.exec(PhpFunctionName.INSERT_ARRAY, records).subscribe(
      res => {
        console.log(res)
        this.fileIndex++;
        if (this.fileIndex < this.files.length) {
          toastr.clear()
          toastr.info(`成功导入${records.length}条数据`)
          this.insertExcel()
        } else {
          toastr.info(`数据上传完毕`);
          const key = this.currentItem.caseID +'-'+ this.currentItem.oppositeAccount+'-'+this.currentItem.tradeTimes[0];
          this.localService.remove(key);
          this.message.refreshChart();
        }
      }
    )
  }

  private convertDataKey(data:any, isSwap:boolean,isThird:boolean) {
    let o:any={};
    for (const key in data) {
      let newkey = this.field[key];
      if (newkey) {
        let value = data[key];
        if (value === '-')
          value = null;
        o[newkey] = value;
      }
    }
    if (isSwap) {
      if (o.inOrOut == '入') {
        this.swipValue(o, 'account', 'oppositeAccount');
        this.swipValue(o, 'accountBankName', 'oppositeBankName');
        this.swipValue(o, 'accountBankNumber', 'oppositeBankNumber');
      }
    }
    //加上案件id
    if (o.inOrOut == '出') o.inOrOut = '借';
    if (o.inOrOut == '入') o.inOrOut = '贷';
    o.caseID = this.caseID;
    if(isThird) o.isThird = '1'
    return o;
  }

  private swipValue(o:TradeRecord, p1:string, p2:string) {
    if (o.hasOwnProperty(p1) && o.hasOwnProperty(p2)) {
      let temp = o[p1];
      o[p1] = o[p2];
      o[p2] = temp;
    }
  }

  /**是否是支付宝账号，支付宝账号需要交换账号的值 */
  private isAlipay(records: any[]): boolean {
    let len = records.length > 100 ? 100 : records.length;
    for (let i = 0; i < len; i++) {
      const item = records[i];
      //银行卡
      if (item.hasOwnProperty('查询账号'))
        return false;
      //财付通账户
      if (item.hasOwnProperty('付款支付帐号')) {
        if (item['付款支付帐号'].indexOf('wx.tenpay.com') != -1)
          return false
      }
    }
    return true;
  }

  private validateTime(record) {
    if (record.tradeTime && record.tradeTime.length != 14)
      return false;
    return true;
  }
}
