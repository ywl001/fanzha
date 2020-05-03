import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatFormFieldModule,
  MatButtonModule,
  MatInputModule,
  MatRadioModule,
  MatDialogModule,
  MatExpansionModule,
  MatDatepickerModule,
  MatCheckboxModule

} from '@angular/material';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule
} from '@angular-material-components/datetime-picker';

import { AppComponent } from './app.component';
import { AccountComponent } from './account/account.component';
import { AddCaseComponent } from './add-case/add-case.component'
import { RecordsComponent } from './records/records.component';
import { AddAccountComponent } from './add-account/add-account.component';
import { AddLowerComponent } from './add-lower/add-lower.component';
import { AccountDetailComponent } from './account-detail/account-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    AccountComponent,
    AddCaseComponent,
    RecordsComponent,
    AddAccountComponent,
    AddLowerComponent,
    AccountDetailComponent,
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
    DragDropModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [AccountComponent, AddCaseComponent, AddAccountComponent,AddLowerComponent,AccountDetailComponent]
})
export class AppModule { }
