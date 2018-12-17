import assert from 'assert';
import {
    parseCode,
    substituteCode,
    getValueMap,
    resetValueMap,
    generateCode,
    replaceInput, findRedGreen, getGreens, getReds
} from '../src/js/code-analyzer';

/*describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('')),
            '{"type":"Program","body":[],"sourceType":"script"}'
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;')),
            '{"type":"Program","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"a"},"init":{"type":"Literal","value":1,"raw":"1"}}],"kind":"let"}],"sourceType":"script"}'
        );
    });
});*/

describe('The function parser', () => {
    it('is parsing a function with parameters correctly', () => {
        substituteCode(parseCode('function foo(x, y, z){}'));
        assert.deepEqual(getValueMap()['x'],'x');
        assert.deepEqual(getValueMap()['y'],'y');
        assert.deepEqual(getValueMap()['z'],'z');
        resetValueMap();
    });
});

describe('The varDec parser', () => {
    it('is parsing a varDec correctly', () => {
        substituteCode(parseCode('let x = 0;'));
        assert.deepEqual(getValueMap()['x'],0);
        resetValueMap();
    });
});

describe('The assignment parser', () => {
    it('is parsing an assignment correctly', () => {
        substituteCode(parseCode('let x = 0;' +
            'x = 1;'));
        assert.deepEqual(getValueMap()['x'],1);
        resetValueMap();
    });
});

describe('The if parser', () => {
    it('is parsing an if statement correctly', () => {
        substituteCode(parseCode('if(x < y){' +
            'x = 1}'));
        assert.deepEqual(getValueMap()['x'],1);
        resetValueMap();
    });
});

describe('The else if parser', () => {
    it('is parsing an else if statement correctly', () => {
        substituteCode(parseCode('if(x < y){' +
            'x = 1;}' +
            'else if(x > y){' +
            'y = 2}'));
        assert.deepEqual(getValueMap()['y'],2);
        resetValueMap();
    });
});

describe('The while parser', () => {
    it('is parsing a while statement correctly', () => {
        substituteCode(parseCode('while(x>y){' +
            'x = 10}'));
        assert.deepEqual(getValueMap()['x'],10);
        resetValueMap();
    });
});

describe('The remove function', () => {
    it('is removing an assignment correctly', () => {
        let str = 'let c = 1;' +
            'if (c > 0){' +
            'c = c + 5;' +
            'let a = c;}';
        let parsed = parseCode(str);
        substituteCode(parsed);
        assert.notEqual(str.length, generateCode(parsed).length);
        resetValueMap();
    });
});

describe('The dont remove global variables feature', () => {
    it('is not removing a global variable', () => {
        let str = 'let a = 1;\n' +
            'function foo() {\n' +
            '}';
        let parsed = parseCode(str);
        substituteCode(parsed);
        assert.deepEqual(str.length, generateCode(parsed).length);
        resetValueMap();
    });
});

describe('The insert parenthesis feature', () => {
    it('is adding parenthesis correctly', () => {
        let parsed = parseCode('function foo(x,y){\n' +
            '    let c = x + y;\n' +
            '    let z = 1;\n' +
            '    z = c * 2;\n' +
            '}');
        substituteCode(parsed);
        assert.deepEqual(getValueMap()['z'], '(x + y) * 2');
        resetValueMap();
    });
});

describe('The replace input function', () => {
    it('is replacing correctly', () => {
        let parsed = parseCode('function foo(x,y){\n' +
            '    let c = x + y;\n' +
            '    let z = 1;\n' +
            '    z = c * 2;\n' +
            '}');
        substituteCode(parsed);
        replaceInput('1,2');
        assert.deepEqual(getValueMap()['z'], 6);
        resetValueMap();
    });
});

describe('The fill red and green function', () => {
    it('is filling arrays correctly', () => {
        let parsed = parseCode('function foo(x,y) {\n' +
            '    if (x < y) {\n' +
            '        x = 1;\n' +
            '    }\n' +
            '    else if (x > y) {\n' +
            '        y = 2;\n' +
            '    }\n' +
            '}');
        substituteCode(parsed);
        let code = generateCode(parsed);
        replaceInput('1,2');
        findRedGreen(parseCode(code));
        assert.deepEqual(getGreens()[0], 2);
        assert.deepEqual(getReds()[0], 3);
        resetValueMap();
    });
});