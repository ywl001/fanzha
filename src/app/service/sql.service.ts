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
}
