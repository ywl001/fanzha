import { Component, OnInit } from '@angular/core';
import { Field } from '../models/field';
import { AccountNode } from '../models/accountNode';
import { SqlService } from '../service/sql.service';
import { PhpFunctionName } from '../models/phpFunctionName';
import { MessageService } from '../service/message.service';

@Component({
  selector: 'app-add-lower',
  templateUrl: './add-lower.component.html',
  styleUrls: ['./add-lower.component.css']
})
export class AddLowerComponent implements OnInit {

  data: any;
  lowerAccount: string;
  isThird: boolean;

  constructor(private sqlservice:SqlService,private message:MessageService) { }

  ngOnInit() {
  }

  onSubmit() {
    let data = {
      tableName:'trade_record',
      tableData:{
        lowerAccount:this.lowerAccount
      },
      id:this.data.id
    }
    this.sqlservice.exec(PhpFunctionName.UPDATE,data).subscribe(res=>{
      this.message.sendRefreshChart()
    })
  }

}
