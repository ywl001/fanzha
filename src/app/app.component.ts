import { Component, ViewChild, ElementRef, ComponentFactoryResolver, ViewContainerRef, ChangeDetectorRef, Renderer2 } from '@angular/core';

import * as toastr from 'toastr';
import { MessageService } from './service/message.service';
import { AccountComponent } from './account/account.component';
import { MatDialog } from '@angular/material';
import { AddCaseComponent } from './add-case/add-case.component';

import * as domtoimage from 'dom-to-image';
import * as download from 'downloadjs'

import gsap from 'gsap'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent {
  title = 'fazha';

  private field: any;

  private currentCase:string;

  private gap_w: number = 50
  private gap_h: number = 100
  //是否布局
  private isLayout: boolean;
  //是否绘制连接线
  private isDraw: boolean;
  //绘图区域的宽高
  private width: number;
  private height: number;
  private _levelMaxHeightMap: Map<number, number>;//存储每个级别最大高度
  private itemMap: Map<number, Array<AccountComponent>>;
  private items: Array<AccountComponent>

  isBusy: boolean;

  @ViewChild('contentDiv', { static: false, read: ViewContainerRef }) contentDiv: ViewContainerRef;
  @ViewChild('bgCanvas', { static: false }) bgCanvas: ElementRef;

  constructor(public dialog: MatDialog,
    private messageService: MessageService,
    private resolver: ComponentFactoryResolver,
    private cdf: ChangeDetectorRef) { }


  ngOnInit() {
    console.log('app init')
    this.messageService.accountNode$.subscribe(
      nodes => { this.showNodes(nodes) }
    )

    this.messageService.isBusy$.subscribe(
      res => { this.isBusy = res; console.log(res) }
    )

    this.messageService.caseName$.subscribe(
      res=>{this.currentCase = res}
    )
  }

  private showNodes(nodes) {
    if (!nodes)
      return;
    console.log(nodes)
    this.onClear()
    this.isLayout = true;
    this.isDraw = true;
    this.itemMap = new Map();
    this.items = [];
    this._levelMaxHeightMap = null;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      //根据数据创建视图
      let factory = this.resolver.resolveComponentFactory(AccountComponent)
      let componentRef = this.contentDiv.createComponent(factory);
      let item = <AccountComponent>componentRef.instance;
      item.data = node;
      // 加入数组
      this.items.push(item);
      this.items.forEach(acc => {
        if (acc.data.children.includes(node))
          acc.children.push(item)
      })
      // 加入map
      let j = item.level;
      this.itemMap.has(j) ? this.itemMap.get(j).push(item) : this.itemMap.set(j, [item])
    }
  }

  onAddCase() {
    this.dialog.open(AddCaseComponent, { disableClose: true });
  }

  ngAfterViewChecked() {
    console.log('app view checked')
    if (!this.itemMap)
      return;

    if (this.isLayout) {
      this.firstLayout();
      for (let i = 0; i < 3; i++) {
        this.layout(this.items)
      }
      this.isLayout = false;
    }

    //绘制连接线
    if (this.isDraw) {
      console.log('redraw')
      this.drawLine();
    }
    this.cdf.detectChanges()
  }

  private drawLine() {
    let canvasSize = this.getCanvasSize()
    console.log(canvasSize)
    this.bgCanvas.nativeElement.width = canvasSize.w;
    this.bgCanvas.nativeElement.height = canvasSize.h;

    let cxt = this.bgCanvas.nativeElement.getContext("2d");

    for (let i = 0; i < this.items.length; i++) {
      let parent = this.items[i]
      for (let j = 0; j < this.items.length; j++) {
        let child = this.items[j]
        if (parent.children.includes(child)) {
          console.log('start draw')
          cxt.beginPath();
          cxt.moveTo(parent.x + parent.w / 2, parent.y + parent.h);//移动到父元素下边缘中点
          cxt.lineTo(parent.x + parent.w / 2, parent.y + parent.h + this.gap_h / 2);//画父元素中点向下gap/2
          cxt.lineTo(child.x + child.w / 2, parent.y + parent.h + this.gap_h / 2);
          cxt.lineTo(child.x + child.w / 2, child.y)
          cxt.lineTo(child.x + child.w / 2 + 5, child.y - 5)
          cxt.moveTo(child.x + child.w / 2, child.y)
          cxt.lineTo(child.x + child.w / 2 - 5, child.y - 5)
          cxt.stroke()
        }
      }
    }
  }

  //第一次排列
  private firstLayout() {
    let preWidth = 0;
    this.itemMap.forEach((arr, level) => {
      preWidth = 0
      arr.forEach((item) => {
        let x = preWidth;
        let y = this.getYByLevel(level);
        item.position = { x: x, y: y }
        preWidth += (item.w + this.gap_w);
      })
    })
  }

  //排列
  //第一次先按级别排列，然后如果父元素中心小于到子元素的中心，移动父元素，反之移动子元素
  private layout(items) {
    for (let i = 0; i < items.length; i++) {
      const element = items[i];
      if (element.children && element.children.length > 0) {
        let childCenterX = this.getChildrenCenterX(element);
        let parentCenterX = element.x + element.w / 2;
        let dx = childCenterX - parentCenterX;
        if (dx > 0) {
          this.moveItem(element, dx)
        } else {
          let children = element.children;
          for (let i = 0; i < children.length; i++) {
            const child = children[i];
            this.moveItem(child, -dx)
          }
        }
      }
    }
  }

  //获取下级对象的中点位置
  private getChildrenCenterX(parent) {
    let children: Array<AccountComponent> = parent.children;
    children.sort((a, b) => a.x - b.x);
    let lastChild = children[children.length - 1];
    let firstChild = children[0];

    return firstChild.x + (lastChild.x + lastChild.w - firstChild.x) / 2
  }

  // 移动元素x，dx移动的距离,基本原则是向右侧移动，右侧的元素也要移动
  private moveItem(item, dx) {
    let items_level = this.itemMap.get(item.level);
    // item设置位置
    item.position = { x: item.x + dx, y: item.y };
    //item后面的元素跟随移动
    let acc_index = items_level.indexOf(item);
    for (let i = acc_index + 1; i < items_level.length; i++) {
      const element = items_level[i];
      element.position = { x: element.x + dx, y: element.y }
      console.log('跟随移动了' + dx)
    }
  }

  //获取级别的y
  private getYByLevel(level) {
    let y = 0;
    for (let i = 0; i < level; i++) {
      y += this.levelMaxHeightMap.get(i) + this.gap_h
    }
    return y;
  }

  private getMaxHeightByLevel(level) {
    return this.levelMaxHeightMap.get(level)
  }

  private get levelMaxHeightMap() {
    if (!this._levelMaxHeightMap) {
      this._levelMaxHeightMap = new Map();
      this.itemMap.forEach((arr, level) => {
        this._levelMaxHeightMap.set(level, 0)
        arr.forEach(item => {
          if (item.h > this._levelMaxHeightMap.get(level))
            this._levelMaxHeightMap.set(level, item.h)
        })
      })
    }
    return this._levelMaxHeightMap;
  }

  /**获取最大宽和高 */
  private getCanvasSize() {
    let total_w = 0;
    let total_h = 0;
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (item.x + item.w > total_w)
        total_w = item.x + item.w
    }
    let maxLevel = this.itemMap.size - 1;
    total_h = this.getYByLevel(maxLevel) + this.getMaxHeightByLevel(maxLevel);
    return { w: total_w, h: total_h };
  }

  onClear() {
    this.contentDiv.clear();
    this.isDraw = false;
    const context = this.bgCanvas.nativeElement.getContext('2d');
    context.clearRect(0, 0, this.width, this.height);
    this.bgCanvas.nativeElement.width = this.bgCanvas.nativeElement.height = 0
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
      gsap.to(".leftContainer", 0.5, { width: "400px" });
      gsap.to("#toggleLeft", 0.5, { transform: "rotate(0deg)", left: '405px' });

    } else {
      gsap.to(".leftContainer", 0.5, { width: "0px" });
      gsap.to("#toggleLeft", 0.5, { transform: "rotate(180deg)", left: '5px' });
    }
    this._isLeftOpen = !this._isLeftOpen;
  }

  //保存图像
  onSaveImage() {
    domtoimage.toPng(document.getElementById('chart'), { bgcolor: 'white' })
      .then(dataUrl => {
        download(dataUrl, `${this.currentCase}.jpg`);
      });
  }

}
