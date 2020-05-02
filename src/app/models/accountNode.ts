export class AccountNode {
    caseID:number = 0;
    level:number = 0;
    account:string = '';
    accountName:string = '';
    parentAccount:AccountNode = null;
    children:Array<AccountNode> = [];
    moneys:Array<number> = [];
    tradeTimes:Array<any> = []
    leftMoneys = []
    tradeNumbers = []
    tradeDescs = []

    accountBankName = ''
    accountBankNumber = ''
    oppositeAccount = ''
    oppositeName = ''
    oppositeBankNumber = ''
    oppositeBankName = ''
    inOrOut = ''
    tradeType = ''
    tradeResult = ''
    isThird = 0
    payeeName = ''
    payeeNumber = ''
}
