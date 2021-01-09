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
    tradeNumbers = [];
    isFirstNode:boolean = false;
    isFalseNode:boolean = false;
    
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
    queryDuration:number = 0;
    tradeBankStationName:string = '';
    tradeBandName:string = ''
    lowerAccount:string='';
    remark:string=''
    isLowerAccount:boolean = false;

}
