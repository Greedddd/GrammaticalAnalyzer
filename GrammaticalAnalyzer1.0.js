

let productions = [];                                                   //产生式集合
let terminals = [];                                                     //终结符集合
let nonterminals = [];                                                  //非终结符集合
let Actions = [];                                                       //Action集的集合
let Gotos = [];                                                         //Goto集的集合
let projectsSets = [];                                                  //项目集规范族的集合
let FIRSTs = [];                                                        //非终结符FIRST集的集合
let FOLLOWs = [];                                                       //非终结符FOLLOW集的集合

function cmp(a,b){
    return a[0] - b[0];
}

function getFirst(production){
    let endflg = new Boolean(true);

    let FIRSTindex = nonterminals.indexOf(production[0]);
    if(terminals.includes(production[1][0])){
        if(!FIRSTs[FIRSTindex].includes(production[1][0])){
            FIRSTs[FIRSTindex].push(production[1][0]);
            endflg = false;
        }
    }
    else{
        let subFIRSTindex = nonterminals.indexOf(production[1][0]);
        // for(let subproduction of productions){
        //     if(subproduction[0] == production[1][0]){
        //         getFirst(subproduction);
        //     }
        // }
        for(var index = 0; index < FIRSTs[subFIRSTindex].length; index++){
            if(!FIRSTs[FIRSTindex].includes(FIRSTs[subFIRSTindex][index])){
                    FIRSTs[FIRSTindex].push(FIRSTs[subFIRSTindex][index]);
                    endflg = false;
                }
        }
    }
    return endflg;
}

function getFollow(production){
    let endflg = new Boolean(true);
    if(production[0] == "S\'"){
        if(!FOLLOWs[0].includes('#')){
            FOLLOWs[0].push('#');
            endflg = false;
        }
    }
    let prolen = production[1].length;
    if(prolen == 1){
        if(terminals.includes(production[1][0]))return endflg;
        else{
            let FOLLOWindex = nonterminals.indexOf(production[1][0]);
            let subFOLLOWindex = nonterminals.indexOf(production[0]);
            for(let index = 0; index < FOLLOWs[subFOLLOWindex].length; index++){
                if(!FOLLOWs[FOLLOWindex].includes(FOLLOWs[subFOLLOWindex][index])){
                    FOLLOWs[FOLLOWindex].push(FOLLOWs[subFOLLOWindex][index]);
                    endflg = false;
                }
            }
        }
    }
    else{
        for(let pos = 0,next =1; next < prolen; pos++,next++){
            if(terminals.includes(production[1][pos])){
                continue;
            }
            else{
                if(terminals.includes(production[1][next])){
                    let FOLLOWindex = nonterminals.indexOf(production[1][pos]);
                    if(!FOLLOWs[FOLLOWindex].includes(production[1][next])){
                        FOLLOWs[FOLLOWindex].push(production[1][next]);
                        endflg = false;
                    }
                }
                else{
                    let FOLLOWindex = nonterminals.indexOf(production[1][pos]);
                    let FIRSTindex = nonterminals.indexOf(production[1][next]);
                    for(var index = 0; index < FIRSTs[FIRSTindex].length; index++){
                        if(!FOLLOWs[FOLLOWindex].includes(FIRSTs[FIRSTindex][index])){
                            FOLLOWs[FOLLOWindex].push(FIRSTs[FIRSTindex][index]);
                            endflg = false;
                        }
                    }
                }
            }
        }
        if(nonterminals.includes(production[1][prolen-1])){
            let FOLLOWindex = nonterminals.indexOf(production[1][prolen - 1]);
            let subFOLLOWindex = nonterminals.indexOf(production[0]);
            for(let index = 0; index < FOLLOWs[subFOLLOWindex].length; index++){
                if(!FOLLOWs[FOLLOWindex].includes(FOLLOWs[subFOLLOWindex][index])){
                    FOLLOWs[FOLLOWindex].push(FOLLOWs[subFOLLOWindex][index]);
                    endflg = false;
                }
            }
        }
    }
    return endflg;
}

function getprojectsSet(projectsSet,Word,isTerminal,index){
    let tmpSet = [];														//临时变量tmpSet[]存储产生的项目集
    for(let project of projectsSet){
        let subtmpSet = new Array(3);
		//E->·S+A POS==0 project[0]==production("E","S+A")                  
        let pos = project[1];
        if(pos == project[0][1].length){                                    //若项目形式为A->a..b..c·
            continue;
        }
        else if(project[0][1][pos] == Word){                                //若项目形式为A->a·(Word)...c
            subtmpSet[0] = project[0];
            subtmpSet[1] = pos + 1;
            subtmpSet[2] = project[2];
            tmpSet.push(subtmpSet); 
        }
    }

    if(tmpSet.toString() == ""){                                            //项目集无Word出度边  这个函数是构造移进操作 
        if(isTerminal){
            let Aindex = terminals.indexOf(Word);
            let Action = [index," "];
            Actions[Aindex].push(Action);
        }
        else{
            let Gindex = nonterminals.indexOf(Word);
            let Goto = [index," "];
            Gotos[Gindex].push(Goto);
        }
        return;
    }

    for(let subtmpSet of tmpSet){                                               //CLOSURE过程
        let pos = subtmpSet[1];
        if(nonterminals.includes(subtmpSet[0][1][pos])){
            let proindex = 0;
            for(let production of productions){
                let subtmpSet1 = new Array(3);
                if(production[0].toString() == subtmpSet[0][1][pos].toString()){
                    subtmpSet1[0] = production;
                    subtmpSet1[1] = 0;
                    subtmpSet1[2] = proindex;
                    let isRepeat = false;
                    for(let subtmpSet2 of tmpSet){
                        if(subtmpSet2.toString() == subtmpSet1.toString()){
                            isRepeat = true;
                            break;
                        }
                    }
                    if(!isRepeat)tmpSet.push(subtmpSet1);
                }
                proindex++;
            }
        }
    }
    let isRepeat = false;
    let subindex = 0;
    for(let subprojectsSet of projectsSets){                                //查找tmpSet是否是已存在的项目集
        if(subprojectsSet.length == tmpSet.length){
            if(subprojectsSet.toString() == tmpSet.toString()){
                isRepeat =true;
                break;
            }
        }
        subindex++;
    }
    if(!isRepeat){                                                          //项目集不存在
        projectsSets.push(tmpSet);
        if(isTerminal){                                                     //若Word为terminal
            let Aindex = terminals.indexOf(Word);
            let act = `S${subindex}`;
            let Action = [index,act];
            Actions[Aindex].push(Action);
        }
        else{                                                               //若Word为nonterminal
            let Gindex = nonterminals.indexOf(Word);
            let Goto = [index,subindex];
            Gotos[Gindex].push(Goto);
        }
    }
    else{                                                                   //项目集已存在，下标为subindex
        if(isTerminal){                                                     //若Word为terminal
            let Aindex = terminals.indexOf(Word);
            let act = `S${subindex}`;
            let Action = [index,act];
            Actions[Aindex].push(Action);
        }
        else{                                                               //若Word为nonterminal
            let Gindex = nonterminals.indexOf(Word);
            let Goto = [index,subindex];
            Gotos[Gindex].push(Goto);
        }
    }
}

function LoadSLR(){
    var SLR = document.getElementById("AnalyticalStatement"); 
    SLR.innerHTML = "";
    var tbody = "";

    var rows = projectsSets.length;
    var cols = terminals.length + nonterminals.length;
    var terminalcols = terminals.length;
    var nonterminalcols = nonterminals.length;

    //构建SLR表表头
    tbody += `
        <tr>
            <td rowspan="2">状态</td>
            <td colspan="${terminalcols}">ACTION</td>
            <td colspan="${nonterminalcols}">GOTO</td>
        </tr>`;
    tbody += `<tr>`;
    for(var index = 0; index < terminalcols; index++){
        tbody += `<td>${terminals[index]}</td>`;
    }
    for(var index = 0; index < nonterminalcols; index++){
        tbody += `<td>${nonterminals[index]}</td>`;
    }
    tbody += `
        </tr>
    `;

    //构造SLR表主体内容
    for(var index = 0; index < rows; index++){
        tbody += `<tr>`;
        tbody += `<td>${index}</td>`;
        for(var terminalindex = 0; terminalindex < terminalcols; terminalindex++){
            tbody += `<td>${Actions[terminalindex][index][1]}</td>`;
        }
        for(var nonterminalindex = 0; nonterminalindex < nonterminalcols; nonterminalindex++){
            tbody += `<td>${Gotos[nonterminalindex][index][1]}</td>`;
        }
        tbody += `</tr>`;
    }

    SLR.innerHTML = tbody;
}

function getSLR(){
    let Productions = document.getElementById("productions").value;

    if(Productions.replace(/(^\s*)|(\s*$)/g, "").length == 0){
        alert("Productions can not be empty!");
		return;
    }

    //清空相关数组
    productions = [];
    terminals = [];
    nonterminals = [];
    Actions = [];
    Gotos = [];
    projectsSets = [];
    FIRSTs = [];
    FOLLOWs = [];

    let lines = Productions.split('\n');									//传值全部放进一个字符串传过来的,然后根据换行符分行
    let isStart = true;
    for(let line of lines){                                                 //构造产生式集
        let tmp = line.split("->");											//再然后根据→符号分左右部
        if(isStart){                                                        //拓广文法，S'->S
            let production = [];											//分割后分左右部装进production数组里
            production.push("S\'",tmp[0])
            productions.push(production);
            nonterminals.push("S\'");
            let FIRST = [];
            FIRSTs.push(FIRST);   											//我的写法是先扫描左部，得到非终结符集
            let FOLLOW = [];
            FOLLOWs.push(FOLLOW);											//再根据右部和非终结符集获得终结符集
            isStart = false;
        }
        productions.push(tmp);
        if(!nonterminals.includes(tmp[0])){                                 //根据产生式左部初始化FIRST集和FOLLOW集
            nonterminals.push(tmp[0]);
            let FIRST = [];
            FIRSTs.push(FIRST);
            let FOLLOW = [];
            FOLLOWs.push(FOLLOW);
        }
    }
    Gotos = new Array();                                                    //根据nonterminals的长度初始化GOTOs
    for(var Goindex = 0; Goindex < nonterminals.length; Goindex++){
        let Goto = new Array();
        Gotos.push(Goto);
    }

    for(let production of productions){                                     //逐条扫描产生式右部，构造terminals集
        for(let word of production[1]){
            if(!nonterminals.includes(word) && !terminals.includes(word)){  //不属于非终结符且在终结符集内不存在重复字符
                terminals.push(word);
            }
        }
    }
    terminals.push('#');                                                    //将分析串结束符'#'插入terminals集尾部
    Actions = new Array();                                                      //根据terminals的长度初始化Actions
    for(var Actindex = 0; Actindex < terminals.length; Actindex++){
        let Action = new Array();
        Actions.push(Action);
    }

    let isEnd = true;
    do{
        isEnd = true;
        let endflg;
        for(let production of productions){                                     //根据产生式构造FIRST集
            endflg = getFirst(production);
            if(!endflg)isEnd = false;
        }
    }while(!isEnd);

    do{
        isEnd = true;
        let endflg;
        for(let production of productions){                                 //根据产生式构造FOLLOW集
            endflg = getFollow(production);
            if(!endflg)isEnd = false;
        }
    }while(!isEnd);
    
    //构造项目集规范族I0
    let index = 0;                                                          //规范族序号
    let tmpSet = [];
    let subtmpSet = new Array(3);
    subtmpSet[0] = productions[0];                                          //产生式
    subtmpSet[1] = 0;                                                       //项目中 · 的位置
    subtmpSet[2] = 0;                                                       //产生式的序号
    tmpSet.push(subtmpSet);
    for(subtmpSet of tmpSet){                                               //CLOSURE过程
        let pos = subtmpSet[1];
        if(nonterminals.includes(subtmpSet[0][1][pos])){
            let proindex = 0;
            for(let production of productions){
                let subtmpSet1 = new Array(3);
                if(production[0].toString() == subtmpSet[0][1][pos].toString()){
                    subtmpSet1[0] = production;
                    subtmpSet1[1] = 0;
                    subtmpSet1[2] = proindex;
                    let isRepeat = false;
                    for(let subtmpSet2 of tmpSet){
                        if(subtmpSet2.toString() == subtmpSet1.toString()){
                            isRepeat = true;
                            break;
                        }
                    }
                    if(!isRepeat){
                        tmpSet.push(subtmpSet1);
                    }
                }
                proindex++;
            }
        }
    }
    projectsSets.push(tmpSet);

    for(let projectsSet of projectsSets){                                   //构造项目集规范族集
        for(let nonterminal of nonterminals){                               //GO(I,nonterminal)
            getprojectsSet(projectsSet,nonterminal,false,index);
        }
        for(let terminal of terminals){                                     //GO(I,terminal)
            getprojectsSet(projectsSet,terminal,true,index)
        }
        index++;
    }

    // //根据状态序号对ACTION[terminal]内操作排序
    // for(let Action of Actions){
    //     Action.sort(cmp);
    // }
    // //根据状态序号对GOTO[nonterminal]内操作排序
    // for(let Goto of Gotos){
    //     Goto.sort(cmp);
    // }

    index = 0;
    for(let projectsSet of projectsSets){                                   //归约操作插入Action表
        for(let project of projectsSet){
            let pos = project[1];
            if(pos == project[0][1].length){
                if(project[0][0].toString() == "S\'"){                      //若发现项目S'->文法开始符·
                    Actions[Actions.length-1][index]=[index,"acc"];         //置ACTIONS['#'][index]操作为acc
                }
                else{
                    let FOLLOWindex = nonterminals.indexOf(project[0][0]);  //找到FOLLOW(project[0][0])
                    for(let subindex = 0; subindex < FOLLOWs[FOLLOWindex].length; subindex++){
                        let terminalindex = terminals.indexOf(FOLLOWs[FOLLOWindex][subindex]);
                        Actions[terminalindex][index]=[index,`R${project[2]}`];
                    }
                }
                break;
            }
        }
        index++;
    }
    LoadSLR();                                                              //载入SLR表
}

let statementStack = [];                                                    //状态栈
let signalStack = [];                                                       //符号栈

function analyze(){
    let codestring = document.getElementById("inputString").value;                   //输入串
    let resultmsg = document.getElementById("resultmsg");                            //过程分析显示

    resultmsg.value = "";

    if(codestring == ""){
        alert("Input string can not be empty!");
        return;
    }
    //分析相关对象初始化
    codestring += '#';

    statementStack = [];
    signalStack = [];

    statementStack.push(0);
    signalStack.push('#');

    let inputindex = 0;
    while(inputindex < codestring.length){
        if(terminals.includes(codestring[inputindex])){
            let terminalindex = terminals.indexOf(codestring[inputindex]);
            let statementindex = statementStack[statementStack.length - 1];
            let act = Actions[terminalindex][statementindex][1];
            if(act[0] == 'S'){                                              //移进操作
                let actStatementindex = Number(act[1]);                     //移进状态的序号
                statementStack.push(actStatementindex);
                signalStack.push(codestring[inputindex]);
                
                resultmsg.value += `ACTION[${statementindex},${codestring[inputindex]}] = ${act},状态 ${act[1]} 入栈\n`;
				inputindex++;
            }
            else if(act[0] == 'R'){                                         //归约操作
                let actProductionindex = Number(act[1]);                    //归约产生式的序号
                let Strlen = productions[actProductionindex][1].length;               //产生式右部的长度，即出栈字符及出栈状态的个数
                for(let i = 0; i < Strlen; i++){
                    statementStack.pop();
                    signalStack.pop();
                }
                signalStack.push(productions[actProductionindex][0]);

                statementindex = statementStack[statementStack.length - 1];
                let nonterminalindex = nonterminals.indexOf(signalStack[signalStack.length - 1]);
                let GotoState = Gotos[nonterminalindex][statementindex][1];
                if(GotoState.toString() !== ""){
                    statementStack.push(GotoState);
                    resultmsg.value += `${act} : 用 ${productions[actProductionindex][0]} -> ${productions[actProductionindex][1]} 归约且GOTO(${statementindex},${signalStack[signalStack.length - 1]}) = ${GotoState} 入栈\n`;
                }
                else{
                    resultmsg.value += `ERROR : ANALYZE FAILED.(GOTO have no next action)\n`;
                }
            }
            else if(act.toString() == "acc"){
                resultmsg.value += `acc : ANALYZE SUCCESSFULLY.\n`;
                return;
            }
            else{
                resultmsg.value += `ERROR : ANALYZE FAILED.(ACTION have no next action)\n`;
                return;
            }
        }
        else{
            resultmsg.value += `ERROR : FOUND INVALID CHARATER.\n`;
            return;
        }
    }
}