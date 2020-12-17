import { Component, OnInit, ComponentFactoryResolver, ViewChild, ViewContainerRef, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MessageService } from '../service/message.service';
import { AccountComponent } from '../account/account.component';
import { AccountNode } from '../models/accountNode';

import * as domtoimage from 'dom-to-image';
import * as download from 'downloadjs'

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {

  private gap_w_v: number = 30;
  private gap_h_v: number = 50;

  private gap_w_h: number = 50;
  private gap_h_h: number = 20;
  //是否布局
  private isLayout: boolean;
  //是否绘制连接线
  private isDraw: boolean;
  //绘图区域的宽高
  private width: number;
  private height: number;

  private itemMap: Map<number, Array<AccountComponent>>;
  private items: Array<AccountComponent>;

  private currentCase: string;
  private isLandscape: boolean = false;

  @ViewChild('chartDiv', { static: false, read: ViewContainerRef }) chartDiv: ViewContainerRef;
  @ViewChild('bgCanvas', { static: false }) bgCanvas: ElementRef;

  constructor(
    private messageService: MessageService,
    private resolver: ComponentFactoryResolver,
    private cdf: ChangeDetectorRef) { }

  ngOnInit() {
    this.messageService.accountNode$.subscribe(
      nodes => { this.showNodes(nodes) }
    )
    this.messageService.saveImage$.subscribe(
      res => { this.saveImage() }
    )
    this.messageService.caseName$.subscribe(
      res => { this.currentCase = res }
    )
    this.messageService.layout$.subscribe(
      res => {
        this.isLandscape = res;
        this.isLayout = true;
        this.isDraw = true;
      }
    )
  }

  private showNodes(oldNodes) {
    if (!oldNodes)
      return;
    let nodes = this.sortNodes(oldNodes)
    // this.isLeftOpen = false;
    this.clear()
    this.isLayout = true;
    this.isDraw = true;
    this.itemMap = new Map();
    this.items = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      //根据数据创建视图
      let factory = this.resolver.resolveComponentFactory(AccountComponent)
      let componentRef = this.chartDiv.createComponent(factory);
      let item = <AccountComponent>componentRef.instance;
      item.data = node;
      // 加入数组
      this.items.push(item);
      this.items.forEach(acc => {
        if (acc.data.children.includes(node)) {
          acc.children.push(item)
          item.parent = acc;
        }
      })
      // 加入map
      let j = item.level;
      this.itemMap.has(j) ? this.itemMap.get(j).push(item) : this.itemMap.set(j, [item])
    }
  }

  private sortNodes(nodes: Array<AccountNode>) {
    let newNodes = [];
    for (let i = 0; i < nodes.length; i++) {
      const element = nodes[i];
      if (element.level == 0) {
        newNodes.push(element)
        break;
      }
    }
    for (let i = 0; i < newNodes.length; i++) {
      let parent = newNodes[i];
      for (let j = 0; j < nodes.length; j++) {
        const child = nodes[j];
        if (parent.children.includes(child)) {
          newNodes.push(child)
        }
      }
    }
    return newNodes;
  }

  private clear() {
    this.chartDiv.clear();
    this.isDraw = false;
    const context = this.bgCanvas.nativeElement.getContext('2d');
    context.clearRect(0, 0, this.width, this.height);
    this.bgCanvas.nativeElement.width = this.bgCanvas.nativeElement.height = 0
  }

  ngAfterViewChecked() {
    console.log('app view checked')
    if (!this.itemMap)
      return;

    if (this.isLayout) {
      if (this.isLandscape) {
        this.firstLayoutH();
        for (let i = 0; i < 10; i++) {
          this.layoutH(this.items)
        }
      } else {
        this.firstLayout();
        for (let i = 0; i < 10; i++) {
          this.layout(this.items)
        }
      }

      this.isLayout = false;
    }

    // 绘制连接线
    if (this.isDraw) {
      // console.log('redraw')
      this.isLandscape ? this.drawLineH() : this.drawLine()
    }
    this.cdf.detectChanges()
  }


  //第一次排列
  private firstLayout() {
    let preWidth = 0;
    this.itemMap.forEach((arr, level) => {
      preWidth = 0
      arr.forEach((item) => {
        let x = preWidth;
        let y = this.getYByLevel(level);
        // item.position = { x: x, y: y }
        item.x = x;
        item.y = y;
        preWidth += (item.w + this.gap_w_v);
      })
    })
  }

  //第一次排列
  private firstLayoutH() {
    let preHeight = 0;
    this.itemMap.forEach((arr, level) => {
      preHeight = 0
      arr.forEach((item) => {
        let x = this.getXByLevel(level);
        let y = preHeight;
        // item.position = { x: x, y: y }
        item.x = x;
        item.y = y;
        preHeight += (item.h + this.gap_h_h);
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
          this.moveX(element, dx)
        } else {
          this.moveX(element.children[0], -dx)
        }
      }
    }
  }

  private layoutH(items) {
    for (let i = 0; i < items.length; i++) {
      const parent = items[i];
      if (parent.children && parent.children.length > 0) {
        let childCenterY = this.getChildrenCenterY(parent);
        let parentCenterY = parent.y + parent.h / 2;
        let dy = childCenterY - parentCenterY;
        if (dy > 0) {
          this.moveY(parent, dy)
        } else {
          this.moveY(parent.children[0], -dy)
        }
      }
    }
  }

  // 移动元素x，dx移动的距离,基本原则是向右侧移动，右侧的元素也要移动
  private moveX(item, dx) {
    let items_level = this.itemMap.get(item.data.level);
    // item设置位置
    // item.position = { x: item.x + dx, y: item.y };
    item.x = item.x + dx;
    //item后面的元素跟随移动
    let acc_index = items_level.indexOf(item);
    let prevItem = item;
    for (let i = acc_index + 1; i < items_level.length; i++) {
      const element = items_level[i];
      element.x = (element.x > prevItem.x + prevItem.w + this.gap_w_v) ? element.x : prevItem.x + prevItem.w + this.gap_w_v;
      prevItem = element;
      console.log('跟随移动了' + dx)
    }
  }

  private moveY(item, dy) {
    let items_level = this.itemMap.get(item.data.level);
    // item设置位置
    // item.position = { x: item.x + dx, y: item.y };
    item.y = item.y + dy;
    //item后面的元素跟随移动
    let index = items_level.indexOf(item);
    let prevItem = item;
    for (let i = index + 1; i < items_level.length; i++) {
      const item_after = items_level[i];
      item_after.y = (item_after.y > prevItem.y + prevItem.h + this.gap_h_h) ? item_after.y : prevItem.y + prevItem.h + this.gap_h_h;
      prevItem = item_after;
      console.log('跟随移动了' + dy)
    }
  }

  //获取级别的y
  private getYByLevel(level) {
    let y = 0;
    for (let i = 0; i < level; i++) {
      y += this.levelMaxHeightMap.get(i) + this.gap_h_v
    }
    return y;
  }

  private getXByLevel(level) {
    let x = 0;
    for (let i = 0; i < level; i++) {
      x += this.levelMaxWidthMap.get(i) + this.gap_w_h
    }
    return x;
  }

  //获取下级对象的中点位置
  private getChildrenCenterX(parent) {
    let children: Array<AccountComponent> = parent.children;
    // children.sort((a, b) => a.x - b.x);
    let lastChild = children[children.length - 1];
    let firstChild = children[0];

    return firstChild.x + (lastChild.x + lastChild.w - firstChild.x) / 2
  }

  private getChildrenCenterY(parent) {
    let children: Array<AccountComponent> = parent.children;
    // children.sort((a, b) => a.x - b.x);
    let lastChild = children[children.length - 1];
    let firstChild = children[0];

    return firstChild.y + (lastChild.y + lastChild.h - firstChild.y) / 2
  }

  private get levelMaxHeightMap() {
    let map = new Map();
    this.itemMap.forEach((arr, level) => {
      map.set(level, 0)
      arr.forEach(item => {
        if (item.h > map.get(level))
          map.set(level, item.h)
      })
    })
    return map;
  }

  private get levelMaxWidthMap() {
    let map = new Map();
    this.itemMap.forEach((arr, level) => {
      map.set(level, 0)
      arr.forEach(item => {
        if (item.w > map.get(level))
          map.set(level, item.w)
      })
    })
    return map
  }

  private drawLine() {
    let canvasSize = this.getCanvasSize()
    // console.log(canvasSize)
    this.bgCanvas.nativeElement.width = canvasSize.w;
    this.bgCanvas.nativeElement.height = canvasSize.h;

    let cxt = this.bgCanvas.nativeElement.getContext("2d");

    for (let i = 0; i < this.items.length; i++) {
      let parent = this.items[i]
      for (let j = 0; j < this.items.length; j++) {
        let child = this.items[j]
        if (parent.children.includes(child)) {
          cxt.beginPath();
          cxt.moveTo(parent.x + parent.w / 2, parent.y + parent.h);//移动到父元素下边缘中点
          let maxHeight_level = this.levelMaxHeightMap.get(parent.level)
          cxt.lineTo(parent.x + parent.w / 2, parent.y + maxHeight_level + this.gap_h_v / 2);//画父元素中点向下gap/2
          cxt.lineTo(child.x + child.w / 2, parent.y + maxHeight_level + this.gap_h_v / 2);
          cxt.lineTo(child.x + child.w / 2, child.y)
          cxt.lineTo(child.x + child.w / 2 + 5, child.y - 5)
          cxt.moveTo(child.x + child.w / 2, child.y)
          cxt.lineTo(child.x + child.w / 2 - 5, child.y - 5)
          cxt.stroke()
        }
      }
    }
  }

  private drawLineH() {
    let canvasSize = this.getCanvasSizeH()
    // console.log(canvasSize)
    this.bgCanvas.nativeElement.width = canvasSize.w;
    this.bgCanvas.nativeElement.height = canvasSize.h;

    let cxt = this.bgCanvas.nativeElement.getContext("2d");

    for (let i = 0; i < this.items.length; i++) {
      let parent = this.items[i]
      for (let j = 0; j < this.items.length; j++) {
        let child = this.items[j]
        if (parent.children.includes(child)) {
          cxt.beginPath();
          cxt.moveTo(parent.x + parent.w, parent.y + parent.h / 2);//移动到父元素下边缘中点
          cxt.lineTo(parent.x + parent.w + this.gap_w_h / 2, parent.y + parent.h / 2);//画父元素中点向下gap/2
          let maxWidth_level = this.levelMaxWidthMap.get(parent.level);
          cxt.lineTo(parent.x + maxWidth_level + this.gap_w_h / 2, parent.y + parent.h / 2);//画父元素中点向下gap/2

          cxt.lineTo(parent.x + maxWidth_level + this.gap_w_h / 2, child.y + child.h / 2);
          cxt.lineTo(child.x, child.y + child.h / 2)
          cxt.lineTo(child.x - 5, child.y + child.h / 2 - 5)
          cxt.moveTo(child.x, child.y + child.h / 2)
          cxt.lineTo(child.x - 5, child.y + child.h / 2 + 5)
          cxt.stroke()
        }
      }
    }
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
    total_h = this.getYByLevel(maxLevel) + this.levelMaxHeightMap.get(maxLevel);
    return { w: total_w, h: total_h };
  }

  private getCanvasSizeH() {
    let total_w = 0;
    let total_h = 0;
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (item.y + item.h > total_h)
        total_h = item.y + item.h
    }
    let maxLevel = this.itemMap.size - 1;
    total_w = this.getXByLevel(maxLevel) + this.levelMaxWidthMap.get(maxLevel);
    return { w: total_w, h: total_h };
  }

  private saveImage() {
    if (!this.currentCase) return;
    domtoimage.toPng(document.getElementById('root'), { bgcolor: 'white' })
      .then(dataUrl => {
        download(dataUrl, `${this.currentCase}.jpg`);
      });
  }
}
