import { Component, OnInit } from '@angular/core';
import { AccountNode } from '../models/accountNode';
import { SqlService } from '../service/sql.service';
import { PhpFunctionName } from '../models/phpFunctionName';
import { MessageService } from '../service/message.service';

@Component({
  selector: 'app-set-duration',
  templateUrl: './set-duration.component.html',
  styleUrls: ['./set-duration.component.css']
})
export class SetDurationComponent implements OnInit {

  constructor(private sqlService:SqlService,private message:MessageService) { }

  queryDuration:number;

  private _data:AccountNode
  set data(value){
    this._data = value;
    if(value.queryDuration && value.queryDuration > 0)
      this.queryDuration = value.queryDuration;
  }

  ngOnInit() {
  }

  onSubmit(){
    let data = {
      tableName:'trade_record',
      tableData:{
        queryDuration:this.queryDuration
      },
      id:this._data.id
    }

    this.sqlService.exec(PhpFunctionName.UPDATE,data).subscribe(res=>{
      this.message.sendRefreshChart()
    })

  }

}
