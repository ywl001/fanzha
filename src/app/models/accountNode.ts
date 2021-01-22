export class AccountNode {
    id:string = '';
    caseID:string = '';
    level:number = 0;
    account:string = '';
    accountName:string = '';
    parentAccount:AccountNode = null;
    ids:Array<string> = [];
    children:Array<AccountNode> = [];
    moneys:Array<number> = [];
    tradeTimes:Array<any> = []
    leftMoneys = []
    tradeNumbers = [];
    isFirstNode:boolean = false;
    isFalseNode:boolean = false;
    commonQueryDuration:number = 0;
    
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

    /**获取节点下的所有子节点 */
    static getAllChild(node:AccountNode,children:Array<AccountNode>=[]){
        const childs = node.children;
        childs.forEach(node=>{
            this.getAllChild(node,children);
            children.push(node)
        })
        return children;
    }

}
