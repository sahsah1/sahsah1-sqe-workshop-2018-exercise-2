import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse);
};

const valueMap = {};
var newJson;

function setJson(json) {
    newJson = json;
}

const parseByType = {
    'FunctionDeclaration': parseFunction,
    'VariableDeclaration': parseVarDec,
    'AssignmentExpression': parseAssignExp,
    'IfStatement': parseIf
};

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

function generateCode(json) {
    return escodegen.generate(json);
}

function removeFromJSON(exp) {
    var i = exp.length;
    for(var j=0;j<i;j++) {
        if (typeof exp[0] == 'object' && exp[0].hasOwnProperty('type') && isRemovable(exp)) {
            exp.shift();
        }
    }
}

function isRemovable(exp){
    return (exp[0]['type'] == 'VariableDeclaration' || exp[0]['type'] == 'ExpressionStatement');
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
    substituteInExp(exp);
}

function substituteInExp(exp) {
    for(var key in exp){
        if(typeof exp[key] == 'object'){
            substituteInExp(exp[key]);
        }
        else if(existInDict(exp,key)){
            var toChange = exp['name'];
            exp['name'] = valueMap[toChange];
        }
    }
}

function existInDict(exp,key){
    return (key == 'type' && exp[key] == 'Identifier' && exp['name'] in valueMap);
}

function generateValue(str){
    let vars = str.split(' ');
    for(var i=0;i<vars.length;i++) {
        for (var val in valueMap) {
            if(val==vars[i]){
                var regex = new RegExp(vars[i], 'g');
                str = str.replace(regex,valueMap[val]);
                break;
            }
        }
    }
    return str;
}

/*function replaceAllOccurences(prog) {
    for(var variable in valueMap){
        var regex = new RegExp(' '+variable+' ', 'g');
        prog = prog.replace(regex,valueMap[variable]);
    }
    return prog;
}*/


//export {replaceAllOccurences};
export {newJson};
export {setJson};
export {generateCode};
export {substituteCode};
export {parseCode};
