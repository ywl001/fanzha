import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { SqlService } from '../service/sql.service';
import { MessageService } from '../service/message.service';
import { MatDialog } from '@angular/material';
import { AddCaseComponent } from '../add-case/add-case.component';
import { AddAccountComponent } from '../add-account/add-account.component';
import * as toastr from 'toastr';
import { ExcelService } from '../service/excel.service';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../service/data.service';
import { PhpFunctionName } from '../models/phpFunctionName';
declare var alertify;


@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.css']
})
export class RecordsComponent {

  // private allRecords: Array<any>;

  /**
   * 案件列表
   */
  caseList;

  /**起始账号列表 */
  itemList: Array<any>;

  /**excel和数据库的对照字段 */
  private field: any;

  /**当前案件的id，excel导入数据库时添加上 */
  private caseID: any;

  /**当前显示的流程图的账号，当流程数据修改时，刷新视图使用 */
  private currentItem: any;

  /**html中input的引用 */
  @ViewChild('inputFile', { static: false }) inputFile: ElementRef;

  constructor(
    private sqlService: SqlService,
    private http: HttpClient,
    private excelService: ExcelService,
    public dialog: MatDialog,
    private message: MessageService,
    private dataService: DataService) {
  }

  ngOnInit() {
    //获取excel和数据库的映射关系
    this.http.get('assets/field.json').subscribe(res => { this.field = res })
    //获取案件及查询账号信息
    this.message.refreshChart$.subscribe(
      res => {
        if (this.currentItem) {
          this.dataService.data = this.currentItem;
        }
      }
    )
  }

  private _data;
  @Input() 
  set data(res){
    if(this._data != res){
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

 get data(){
    return this._data;
  }


  onOpenPanel(lawCase) {
    this.caseID = lawCase.caseID;
    this.message.sendCaseName(lawCase.caseName)
    this.itemList = this.data.filter(item => item.caseID == lawCase.caseID && item.accountID)
  }

  onAddAccount(lawCase) {
    let dialogRef = this.dialog.open(AddAccountComponent, { disableClose: true });
    dialogRef.componentInstance.caseID = lawCase.caseID;
  }

  onEditCase(lawCase) {
    let dialogRef = this.dialog.open(AddCaseComponent, { disableClose: true });
    dialogRef.componentInstance.data = lawCase;
  }

  onItemClick(item) {
    this.currentItem = item;
    this.dataService.data = item;
  }

  /**删除记录 */
  onDelete(item) {
    alertify.set({
      labels: { ok: "确定", cancel: "取消" }
    });
    alertify.confirm("确定要删除吗？", e => {
      if (e) {
        let data = {
          tableName: 'start_account',
          id: item.accountID
        }
        this.sqlService.exec(PhpFunctionName.DEL, data).subscribe(res=>this.message.sendRefresh())
      }
    });
  }

  onAddFile($event) {
    this.inputFile.nativeElement.click()
  }

  private fileIndex = 0;
  private files;
  onFileChange(event) {
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
        let isThird = this.isThird(res[0])
        console.log('is third')
        for (let i = 0; i < res.length; i++) {
          let o: any;
          isThird ? o = this.convertDataKey_third(res[i]) : o = this.convertDataKey(res[i])
          datas.push(o);
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
        toastr.clear()
        toastr.info(`成功导入${records.length}条数据`)
        this.insertExcel()
      }
    )
  }

  private convertDataKey(data) {
    let o = {};
    for (const key in data) {
      let newkey = this.field[key];
      if (newkey) {
        let value = data[key];
        if (value === '-')
          value = null;
        o[newkey] = value;
      }
    }
    o['caseID'] = this.caseID
    return o;
  }

  private convertDataKey_third(data) {
    let o = {};
    for (const key in data) {
      let newkey = this.field[key];
      if (newkey) {
        let value = data[key];
        if (value === "-")
          value = null;
        o[newkey] = value;
      }
      // 交换值
    }
    if (o['inOrOut'] == '入') {
      this.swipValue(o,'account','oppositeAccount');
      this.swipValue(o,'accountBankName','oppositeBankName');
      this.swipValue(o,'accountBankNumber', 'oppositeBankNumber');
    }
    o['inOrOut'] == '出' ? o['inOrOut'] = '借' : o['inOrOut'] = '贷'
    o['caseID'] = this.caseID
    o['isThird'] = 1
    return o;
  }

  private swipValue(o,p1,p2) {
    let temp = o[p1];
    o[p1] = o[p2];
    o[p2] = temp;
  }

  private isThird(record) {
    if (record.hasOwnProperty('付款支付帐号'))
      return true;
    return false;
  }
}
