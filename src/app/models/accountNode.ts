export class AccountNode {
    id:string = '';
    caseID:string = '';
    level:number = 0;
    account:string = '';
    accountName:string = '';
    parentAccount:AccountNode = null;
    children:Array<AccountNode> = [];
    moneys:Array<number> = [];
    tradeTimes:Array<any> = []
    leftMoneys = []
    tradeNumbers = []
    
    tradeDesc=''
    accountBankName = ''
    accountBankNumber = ''
    oppositeAccount = ''
    oppositeName = ''
    oppositeBankNumber = ''
    oppositeBankName = ''
    inOrOut = ''
    tradeType = ''
    tradeResult = ''
    isThird = ''
    payeeName = ''
    payeeNumber = ''
}
