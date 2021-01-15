import { Component, ViewChild, ElementRef, ViewContainerRef } from '@angular/core';

import { MessageService } from './service/message.service';
import { MatDialog } from '@angular/material';
import { AddCaseComponent } from './add-case/add-case.component';

import { Common } from './models/common';
import { SqlService } from './service/sql.service';
import { PhpFunctionName } from './models/phpFunctionName';
import { Observable, of } from 'rxjs';
import { FormControl } from '@angular/forms';
import { startWith } from 'rxjs/operators';
import { map } from 'rxjs/operators';

import anime from 'animejs/lib/anime.es.js';
import pinyin from 'chinese-to-pinyin'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent {
  title = 'fazha';


  filterCase: string = ''
  filterCase$: Observable<any>;
  caseControl = new FormControl();
  private _lawcases;

  constructor(public dialog: MatDialog,
    private messageService: MessageService,
    private sqlService: SqlService) {
  }

  ngOnInit() {
    console.log('app init');
    const arr = [9,8,5,10,3];
    console.log(arr.reduce((pre,cur)=>{
      if(pre>cur) cur = pre;
      return cur
    }))
    this.getData();
    this.messageService.refreshCaseList$.subscribe(
      res => { this.getData() }
    )
  }

  private getData() {
    this.sqlService.exec(PhpFunctionName.SELECT_CASE_ACCOUNT, null).subscribe(
      res => {
        this.lawCase = res;
      })
  }

  set lawCase(value) {
    this._lawcases = value;
    this.filterCase$ = this.caseControl.valueChanges.pipe(
      startWith(''),
      map(val => this.filter(val))
    )
  }

  private filter(val: string): string[] {
    if (val == '') return this._lawcases;
    return this._lawcases.filter(item => {
      let caseName = item['caseName'];
      let caseName_py = pinyin(caseName, { keepRest: true, firstCharacter: true, removeSpace: true })
      // console.log(caseName_py)
      return caseName.indexOf(val) >= 0 || caseName_py.indexOf(val) > 0
    })
  }

  get lawCase() {
    return this._lawcases;
  }

  onAddCase() {
    this.dialog.open(AddCaseComponent, { disableClose: true });
  }

  private _after: number = 0.2;
  get after() {
    return this._after;
  }
  set after(value) {
    this._after = value
    Common.AFTER_TIME = value;
  }

  //面板开关
  private _isLeftOpen = true;
  onToggleLeft() {
    this.isLeftOpen = !this._isLeftOpen
  }
  get isLeftOpen() {
    return this._isLeftOpen;
  }
  set isLeftOpen(value) {
    if (value) {
      anime({
        targets: '.leftContainer',
        width: 400,
        duration: 500,
        easing: 'linear'
      });
      anime({
        targets: '#toggleLeft',
        left: 405,
        duration: 500,
        rotate: 0,
        easing: 'linear'
      })
      // gsap.to(".leftContainer", 0.5, { width: "400px" });
      // gsap.to("#toggleLeft", 0.5, { transform: "rotate(0deg)", left: '405px' });

    } else {
      anime({
        targets: '.leftContainer',
        width: 0,
        duration: 500
      });
      anime({
        targets: '#toggleLeft',
        left: 5,
        rotate: 180,
        duration: 500
      });
      // gsap.to(".leftContainer", 0.5, { width: "0px" });
      // gsap.to("#toggleLeft", 0.5, { transform: "rotate(180deg)", left: '5px' });
    }
    this._isLeftOpen = !this._isLeftOpen;
  }

  //保存图像
  onSaveImage() {
    this.messageService.sendSaveImage()
  }

  onLayout(e) {
    let value = e.target.innerText == '横向排列';
    e.target.innerText = value ? '纵向排列' : '横向排列';
    this.messageService.sendLayout(value)
  }
}
