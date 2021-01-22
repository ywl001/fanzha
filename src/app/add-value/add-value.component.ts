import { Component, OnInit } from '@angular/core';
import { SqlService } from '../service/sql.service';
import { MessageService } from '../service/message.service';
import { PhpFunctionName } from '../models/phpFunctionName';
import { AccountNode } from '../models/accountNode';

@Component({
  selector: 'app-add-value',
  templateUrl: './add-value.component.html',
  styleUrls: ['./add-value.component.css']
})
export class AddValueComponent {

  /**界面标题 */
  title: string;
  lable: string;

  /**input的值 */
  value:string;

  /**input 的类型*/
  type: string = 'text'

  // private tableData: any;
  private id;
  field: string;
  private tableName: string;
  private isFirstNode: boolean;
  private node: AccountNode;

  placeholder:string;

  constructor(private sqlservice: SqlService, private message: MessageService) { }

  set data(value) {
    console.log(value)
    this.node = value.node;
    this.id = this.node.id;
    this.field = value.field;
    this.isFirstNode = this.node.isFirstNode;
    this.tableName = this.node.isFirstNode ? 'start_account' : 'trade_record'

    //设定组件界面的值
    if (this.field == 'lowerAccount') {
      this.title = '手动增加下级节点';
      this.lable = '下级节点';
      this.placeholder = '如果多个下级节点，请使用|分割'
      this.value = this.node.lowerAccount;
    } else if (this.field == 'remark') {
      this.title = '添加节点备注';
      this.lable = '备注';
      this.value = this.node.remark
    }
  }

  onSubmit() {
    let tableData = {}
    tableData[this.field] = this.value
    let data = {
      tableName: this.tableName,
      tableData: tableData,
      id: this.id
    }

    this.sqlservice.exec(PhpFunctionName.UPDATE, data).subscribe(res => {
      // if(this.isFirstNode){
      //   this.message.queryDurationChange(this.value)
      // }else{
      //   this.message.sendRefreshChart()
      // }
      if (this.field == 'lowerAccount') {
        let data = {
          node: this.node,
          account: this.value
        }
        this.message.addLowerAccount(data)
      } else if (this.field == 'remark') {
        this.node.remark = this.value
      }
    })
  }

}
