import { Component, OnInit } from '@angular/core';
import { AccountNode } from '../models/accountNode';
import { PhpFunctionName } from '../models/phpFunctionName';
import { MessageService } from '../service/message.service';
import { SqlService } from '../service/sql.service';

@Component({
  selector: 'app-change-duration',
  templateUrl: './change-duration.component.html',
  styleUrls: ['./change-duration.component.scss']
})
export class ChangeDurationComponent implements OnInit {

  private node: AccountNode;
  private isFirstNode: boolean;

  day: number;
  hour: number;
  minute: number;

  constructor(private sqlService: SqlService,private message: MessageService) { }

  set data(data: AccountNode) {
    this.node = data;
    this.queryDuration = data.queryDuration;
    this.isFirstNode = data.isFirstNode;
  }

  private get queryDuration() {
    return this.day * 60 * 24 + this.hour * 60 + this.minute;
  }
  private set queryDuration(value) {
    this.day = Math.floor(value / (24 * 60));
    console.log(this.day)
    this.hour = Math.floor((value - this.day * 24 * 60) / 60);
    this.minute = value - this.day * 24 * 60 - this.hour * 60;
  }

  ngOnInit() {
  }

  onSubmit() {
    if(!this.isChange()) return;
    let tableData = {}
    const tableName = this.isFirstNode ? 'start_account' : 'trade_record'
    tableData = this.queryDuration == 0 ? {'queryDuration': null} :{ 'queryDuration': this.queryDuration }
    let data = {
      tableName: tableName,
      tableData: tableData,
      id: this.node.id
    }

    this.sqlService.exec(PhpFunctionName.UPDATE, data).subscribe(res => {
      console.log('res',res)
      let data = {
        isFirstNode: this.isFirstNode,
        node: this.node,
        duration: this.queryDuration
      }
      this.message.queryDurationChange(data)
    })
  }

  private isChange(){
    return this.queryDuration != this.node.queryDuration;
  }
}
