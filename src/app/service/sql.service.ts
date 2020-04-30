import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SqlService {

  private sqlUrl = '/fanzha/sql.php';
  constructor(private http: HttpClient) { }

  exec(phpFunc,data){
    return this.http.post<any>(this.sqlUrl, { 'func': phpFunc, 'data': data })
  }

  // insertArray(data) {
  //   return this.http.post(this.sqlUrl, { 'func': 'insertArray', 'data': data })
  // }

  // insertData(data) {
  //   return this.http.post(this.sqlUrl, { 'func': 'inser', 'data': data })
  // }

  update(tableName, tableData, id) {
    let sql = `update ${tableName} set `;
    for (const key in tableData) {
      sql += `${key}='${tableData[key]}',`
    }
    sql = sql.substr(0, sql.length - 1);
    sql += ` where id = ${id}`;
    console.log(sql)
    return this.http.post<any>(this.sqlUrl, { 'sql': sql, 'action': 'edit' });
  }

  // selectCaseAccount(){
  //   return this.http.post<Array<any>>(this.sqlUrl, { 'func': 'selectCaseAccount'})
  // }

  // selectAccountOut(data){
  //   return this.http.post<Array<any>>(this.sqlUrl, { 'func': 'selectAccoutOut','data':data})
  // }

  // del(tableName, id) {
  //   let sql = `delete from ${tableName} where id = ${id}`;
  //   return this.http.post<any>(this.sqlUrl, { 'sql': sql, 'action': 'edit' });
  // }

  // delAccount(tableName,account,caseID){
  //   let sql = `delete from ${tableName} where otherAccount = '${account}' and caseID = '${caseID}'`;
  //   console.log(sql)
  //   return this.http.post<any>(this.sqlUrl, { 'sql': sql, 'action': 'edit' });
  // }
}
