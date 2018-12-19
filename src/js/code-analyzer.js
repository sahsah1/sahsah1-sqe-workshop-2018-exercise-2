import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
//var safeEval = require('safe-eval');
//import * as safeEval from 'eval';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc:true});
};

var valueMap = {};
var variablesToDelete = new Set();
var reds = [];
var greens = [];
var parameters = [];

function getValueMap() {
    return valueMap;
}

const parseByType = {
    'FunctionDeclaration': parseFunction,
    'VariableDeclaration': parseVarDec,
    'AssignmentExpression': parseAssignExp,
    'WhileStatement': parseWhileExp,
    'IfStatement': parseIf,
    'ReturnStatement': parseReturn
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
    if(typeof exp == 'object' && exp!= null) {
        var i = exp.length;
        for (var j = 0; j < i; j++) {
            if (tempCheck(exp, j)) {
                //exp.shift();
                exp.splice(j, 1);
                j--;
            }
        }
    }
}

function tempCheck(exp, j) {
    if(typeof exp[j] == 'object' && exp[j].hasOwnProperty('type') && isRemovable(exp,j)){
        return true;
    }
    return false;
}

function isRemovable(exp,j){
    if (exp[j]['type'] == 'VariableDeclaration' && isVarDecRemovable(exp)){
        return true;
    }
    else if(exp[j]['type'] == 'ExpressionStatement' && variablesToDelete.has(exp[j]['expression']['left']['name'])){
        return true;
    }
    return false;
}

function isVarDecRemovable(exp){
    for(var key in exp){
        if(exp[key].hasOwnProperty('type') && exp[key]['type'] == 'FunctionDeclaration') {
            return false;
        }
    }
    return true;
}

function parseFunction(exp) {
    let params = exp['params'];
    for (var i=0;i<params.length;i++){
        let key = escodegen.generate(params[i]);
        valueMap[key] = key;
        parameters.push(key);
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
    let tempMap = JSON.parse(JSON.stringify(valueMap));
    substituteInExp(exp['test']);
    substituteCode(exp['consequent']);
    substituteInExp(exp['consequent']);
    valueMap = tempMap;
    substituteCode(exp['alternate']);
    substituteInExp(exp['alternate']);
}

function parseWhileExp(exp) {
    substituteInExp(exp['test']);
    substituteCode(exp['body']);
    substituteInExp(exp['body']);
}

function parseReturn(exp) {
    substituteInExp(exp['argument']);
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
    let index = 0;
    for(var key in valueMap){
        for(var value in parameters){
            valueMap[key] = valueMap[key].replace(new RegExp(parameters[value], 'g'), values[index]);
            index++;
        }
        index = 0;
        valueMap[key] = eval(valueMap[key]);
    }
    parameters.length = 0;
}

function findRedGreen(exp) {
    for(var key in exp){
        if(typeof exp[key] == 'object'){
            findRedGreen(exp[key]);
        }
        else if(key == 'type' && exp[key] == 'IfStatement'){
            substituteInExp(exp['test']);
            fillRedGreen(eval(escodegen.generate(exp['test'])), exp);
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

/*elm.insertAdjacentHTML('beforeend','<xmp style=\'background-color: green; ' +
    'font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; font-size: 20px; width: 350px\'>'
    + codeLines[i]+'</xmp>');
//elm.insertAdjacentHTML('afterbegin', '<pre>bla</pre>');*/

/*elm.insertAdjacentHTML('beforeend', '<xmp style=\'background-color: red; ' +
    'font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; font-size: 20px; width: 350px\'>'
    + codeLines[i]+'</xmp>');*/

function resetValueMap() {
    valueMap = {};
}

export {reds};
export {greens};
export {substituteInExp};
export {resetValueMap};
export {getValueMap};
//export {colorIfTests};
export {findRedGreen};
export {replaceInput};
export {generateCode};
export {substituteCode};
export {parseCode};
export {variablesToDelete};
export {valueMap};
