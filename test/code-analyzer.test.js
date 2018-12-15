import assert from 'assert';
import {parseCode, substituteCode, getValueMap, resetValueMap} from '../src/js/code-analyzer';

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


