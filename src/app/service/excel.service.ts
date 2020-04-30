import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as  XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

  importExcel(file): Observable<any> {
    let workbook;
    let excelInJSON;

    const fileReader = new FileReader();

    fileReader.readAsBinaryString(file);

    return Observable.create(observer => {
      // if success
      fileReader.onload = (event: any) => {
        const binary: string = event.target.result;
        workbook = XLSX.read(binary, { type: 'binary' });
        const wsname: string = workbook.SheetNames[0];
        const ws: XLSX.WorkSheet = workbook.Sheets[wsname];
        // only first sheet
        excelInJSON = XLSX.utils.sheet_to_json(ws, { raw: false, defval: null, blankrows: false });

        observer.next(excelInJSON);
      };

      // if failed
      fileReader.onerror = error => observer.error(error);
    });
  }

  importExcels(files): Observable<any> {
    let excelDatas: Array<any> = [];
    return Observable.create(
      observer => {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          let workbook;
          let excelData;
          let fileReader = new FileReader();
          fileReader.readAsBinaryString(file);
          fileReader.onload = (event:any) => {
            const binary = event.target.result;
            workbook = XLSX.read(binary, { type: 'binary' });
            const wsname: string = workbook.SheetNames[0];
            const ws: XLSX.WorkSheet = workbook.Sheets[wsname];
            // only first sheet
            excelData = XLSX.utils.sheet_to_json(ws, { raw: false, defval: null, blankrows: false });
            excelDatas.push(excelData);
          }
        }
        observer.next(excelDatas)
      }
    )
  }
}
