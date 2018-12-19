import $ from 'jquery';
import {greens, reds, parseCode, variablesToDelete, resetValueMap} from './code-analyzer';
import {substituteCode} from './code-analyzer';
import {generateCode} from './code-analyzer';
import {replaceInput} from './code-analyzer';
import {findRedGreen} from './code-analyzer';
//import {colorIfTests} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        reds.length = 0;
        greens.length = 0;
        variablesToDelete.clear();
        resetValueMap();
        let codeToParse = $('#codePlaceholder').val();
        let inputVector = $('#inputPlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        substituteCode(parsedCode);
        //insertToLeftAssignment(parsedCode);
        let code = generateCode(parsedCode);

        replaceInput(inputVector);
        findRedGreen(parseCode(code));
        colorIfTests(code);
        //$('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
    });
});

function colorIfTests(code) {
    let codeLines = code.split('\n');
    var elm = document.getElementById('parsedCode');
    for(var i=0;i<codeLines.length;i++){
        if(greens.includes(i+1)){
            codeLines[i] += '   //This line is green';
            elm.insertAdjacentHTML('beforeend',codeLines[i] + '\n');
        }
        else if(reds.includes(i+1)){
            codeLines[i] += '   //This line is red';
            elm.insertAdjacentHTML('beforeend',codeLines[i] + '\n');
        }
        else{
            elm.insertAdjacentHTML('beforeend',codeLines[i] + '\n');
        }
    }
}
