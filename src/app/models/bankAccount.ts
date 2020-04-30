export class BankAccount {
    bankID:number = 0;
    caseID:number = 0;
    level:number = 0;
    accountNumber:string = '';
    accountName:string = '';
    parentAccount:BankAccount = null;
    children:Array<BankAccount> = [];
    moneys:Array<number> = [];
    tradeTimes:Array<any> = []
}
