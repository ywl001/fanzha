import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatFormFieldModule,
  MatButtonModule,
  MatInputModule,
  MatRadioModule,
  MatDialogModule,
  MatExpansionModule,
  MatDatepickerModule,
  MatCheckboxModule,
  MatTooltipModule
} from '@angular/material';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule,
} from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter'

import { AppComponent } from './app.component';
import { AccountComponent } from './account/account.component';
import { AddCaseComponent } from './add-case/add-case.component'
import { RecordsComponent } from './records/records.component';
import { AddAccountComponent } from './add-account/add-account.component';
import { AccountDetailComponent } from './account-detail/account-detail.component';
import { ChartComponent } from './chart/chart.component';
import { AddValueComponent } from './add-value/add-value.component';
import { TimePickerComponent } from './time-picker/time-picker.component';
import { NumberPickerComponent } from './time-picker/number-picker/number-picker.component';
import { ChangeDurationComponent } from './change-duration/change-duration.component';
import { AddLowerNodeComponent } from './add-lower-node/add-lower-node.component';
import { AddRemarkComponent } from './add-remark/add-remark.component';

@NgModule({
  declarations: [
    AppComponent,
    AccountComponent,
    AddCaseComponent,
    RecordsComponent,
    AddAccountComponent,
    AccountDetailComponent,
    ChartComponent,
    AddValueComponent,
    TimePickerComponent,
    NumberPickerComponent,
    ChangeDurationComponent,
    AddLowerNodeComponent,
    AddRemarkComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatRadioModule,
    MatDialogModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatTooltipModule,
    DragDropModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    NgxMatMomentModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [
    AccountComponent,
    AddCaseComponent,
    AddAccountComponent,
    AddValueComponent,
    ChangeDurationComponent,
    AddLowerNodeComponent,
    AddRemarkComponent,
    AccountDetailComponent]
})
export class AppModule { }
