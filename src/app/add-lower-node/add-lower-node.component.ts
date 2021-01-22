import { Component, OnInit } from '@angular/core';
import { AccountNode } from '../models/accountNode';
import { AddLowerAccountEvent } from '../models/editNodeEvent';

@Component({
  selector: 'app-add-lower-node',
  templateUrl: './add-lower-node.component.html',
  styleUrls: ['./add-lower-node.component.scss']
})
export class AddLowerNodeComponent implements OnInit {

  private node: AccountNode;
  private id:string;

  lowerAccounts:string[]

  constructor() { }

  ngOnInit() {
  }

  set data(value:AddLowerAccountEvent) {
    this.node = value.node;
    this.id = this.node.id;
    this.lowerAccounts = this.node.lowerAccount.split('|')
  }

}
