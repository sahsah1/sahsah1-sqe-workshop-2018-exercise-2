import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
//var safeEval = require('safe-eval');
import * as safeEval from 'safe-eval';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc:true});
};

var valueMap = {};
var variablesToDelete = new Set();
var reds = [];
var greens = [];

function getValueMap() {
    return valueMap;
}

const parseByType = {
    'FunctionDeclaration': parseFunction,
    'VariableDeclaration': parseVarDec,
    'AssignmentExpression': parseAssignExp,
    'WhileStatement': parseWhileExp,
    'IfStatement': parseIf
};

function generateCode(json) {
    return escodegen.generate(json);
}

function substituteCode(exp){
    for(var key in exp){
        if(typeof exp[key] == 'object'){
            substituteCode(exp[key]);
        }
        else if(key == 'type' && parseByType.hasOwnProperty(exp[key])){
            parseByType[exp[key]](exp);
        }
    }
    removeFromJSON(exp);
}

function removeFromJSON(exp) {
    var i = exp.length;
    for(var j=0;j<i;j++) {
        if (typeof exp[j] == 'object' && exp[j].hasOwnProperty('type') && isRemovable(exp,j)) {
            //exp.shift();
            exp.splice(j,1);
            j--;
        }
    }
}

function isRemovable(exp,j){
    if (exp[j]['type'] == 'VariableDeclaration'){
        /*for(var dec in exp[j]['declarations']){
            return variablesToDelete.has(exp[j]['declarations'][dec]['id']['name']);
        }*/
        return true;
    }
    else if(exp[j]['type'] == 'ExpressionStatement' && variablesToDelete.has(exp[j]['expression']['left']['name'])){
        return true;
    }
    return false;
}

function parseFunction(exp) {
    let params = exp['params'];
    for (var i=0;i<params.length;i++){
        let key = escodegen.generate(params[i]);
        valueMap[key] = key;
    }
}

function parseVarDec(exp) {
    let declarations = exp['declarations'];
    for(var i=0;i<declarations.length;i++){
        let key = escodegen.generate(declarations[i]['id']);
        valueMap[key] = generateValue(escodegen.generate(declarations[i]['init']));
    }
}

function parseAssignExp(exp) {
    let key = escodegen.generate(exp['left']);
    valueMap[key] = generateValue(escodegen.generate(exp['right']));
}

function parseIf(exp) {
    //substituteInExp(exp);
    let tempMap = JSON.parse(JSON.stringify(valueMap));
    substituteInExp(exp['test']);
    substituteCode(exp['consequent']);
    substituteInExp(exp['consequent']);
    valueMap = tempMap;
    substituteCode(exp['alternate']);
    substituteInExp(exp['alternate']);
    //substituteCode(exp['alternate']);
}

function parseWhileExp(exp) {
    substituteInExp(exp['test']);
    substituteCode(exp['body']);
    substituteInExp(exp['body']);
}

function substituteInExp(exp) {
    for(var key in exp){
        if(isValidForSub(exp, key)){
            substituteInExp(exp[key]);
        }
        else if(existInDict(exp,key)){
            var toChange = exp['name'];
            exp['name'] = valueMap[toChange];
            //exp['toDelete'] = true;
        }
    }
}

function isValidForSub(exp, key) {
    return (typeof exp[key] == 'object' && !(exp.hasOwnProperty('type') && exp['type'] == 'AssignmentExpression' && key == 'left'));
}

function existInDict(exp,key){
    return (exp.hasOwnProperty('type') && key == 'type' && exp[key] == 'Identifier' && exp['name'] in valueMap);
}

function generateValue(str){
    let vars = str.split(' ');
    for(var i=0;i<vars.length;i++) {
        for (var val in valueMap) {
            if(val==vars[i]){
                if(paranthesisCheck(vars[i+1], val)){
                    str = str.replace(val,'(' + val + ')');
                }
                var regex = new RegExp(vars[i], 'g');
                str = str.replace(regex,valueMap[val]);
                variablesToDelete.add(val);
                break;
            }
        }
    }
    return str;
}

function paranthesisCheck(str, val){
    if((str == '*' || str == '/') && valueMap[val].length > 1)
        return true;
    return false;
}

function replaceInput(input) {
    let values = input.split(',');
    for(var key in valueMap){
        valueMap[key] = valueMap[key].replace('x',values[0]);
        valueMap[key] = valueMap[key].replace('y',values[1]);
        valueMap[key] = valueMap[key].replace('z',values[2]);
        valueMap[key] = safeEval(valueMap[key]);
    }
}

function findRedGreen(exp) {
    for(var key in exp){
        if(typeof exp[key] == 'object'){
            findRedGreen(exp[key]);
        }
        else if(key == 'type' && exp[key] == 'IfStatement'){
            substituteInExp(exp['test']);
            fillRedGreen(safeEval(escodegen.generate(exp['test'])), exp);
            //fillRedGreen(safeEval(escodegen.generate(exp['test']).replace()))
        }
    }
}

function fillRedGreen(evaluated, exp){
    if(evaluated){
        greens.push(exp['loc']['start']['line']);
    }
    else{
        reds.push(exp['loc']['start']['line']);
    }
}

function colorIfTests(code) {
    let codeLines = code.split('\n');
    var elm = document.getElementById('parsedCode');
    for(var i=0;i<codeLines.length;i++){
        if(greens.includes(i+1)){
            elm.insertAdjacentHTML('beforeend','<xmp style=\'background-color: green; ' +
                'font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; font-size: 20px; width: 350px\'>'
                + codeLines[i]+'</xmp>');
            //elm.insertAdjacentHTML('afterbegin', '<pre>bla</pre>');
        }
        else if(reds.includes(i+1)){
            elm.insertAdjacentHTML('beforeend', '<xmp style=\'background-color: red; ' +
                'font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; font-size: 20px; width: 350px\'>'
                + codeLines[i]+'</xmp>');
        }
        else{
            elm.insertAdjacentHTML('beforeend',codeLines[i] + '\n');
        }
    }
}

function resetValueMap() {
    valueMap = {};
}

export {resetValueMap};
export {getValueMap};
export {colorIfTests};
export {findRedGreen};
export {replaceInput};
export {generateCode};
export {substituteCode};
export {parseCode};
