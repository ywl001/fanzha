import { Component, OnInit } from '@angular/core';
import { AccountNode } from '../models/accountNode';

@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.css']
})
export class AccountDetailComponent implements OnInit {

  constructor() { }

  data:AccountNode;
  ngOnInit() {
  }

}
