import { Component, OnInit } from '@angular/core';
import { SqlService } from '../service/sql.service';
import { MessageService } from '../service/message.service';
import { PhpFunctionName } from '../models/phpFunctionName';

@Component({
  selector: 'app-add-value',
  templateUrl: './add-value.component.html',
  styleUrls: ['./add-value.component.css']
})
export class AddValueComponent {


  title: string;
  lable: string;
  value: string;
  type: string = 'text'

  private tableData: any;
  private id;
  private field: string;

  constructor(private sqlservice: SqlService, private message: MessageService) { }

  set data(value) {

    this.id = value.data.id;
    this.field = value.field;
    if (this.field == 'lowerAccount') {
      this.title = '手动增加下级节点';
      this.lable = '下级节点';
      this.value = value.data.lowerAccount;
    } else if (this.field == 'queryDuration') {
      this.title = '改变查询时长';
      this.lable = '查询时长';
      this.type = 'number';
      this.value = value.data.queryDuration;
    } else if (this.field == 'remark') {
      this.title = '添加节点备注';
      this.lable = '备注';
      this.value = value.data.remark
    }
  }

  onSubmit() {
    this.tableData = {}
    this.tableData[this.field] = this.value
    console.log(this.tableData)
    let data = {
      tableName: 'trade_record',
      tableData: this.tableData,
      id: this.id
    }
    this.sqlservice.exec(PhpFunctionName.UPDATE, data).subscribe(res => {
      this.message.sendRefreshChart()
    })
  }

}
