import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {substituteCode} from './code-analyzer';
import {generateCode} from './code-analyzer';
import {replaceInput} from './code-analyzer';
import {findRedGreen} from './code-analyzer';
//import {colorIfTests} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let inputVector = $('#inputPlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        //let old = JSON.parse(JSON.stringify(parsedCode));

        substituteCode(parsedCode);
        let code = generateCode(parsedCode);

        $('#parsedCode').val(code);
        replaceInput(inputVector);
        findRedGreen(parseCode(code));
        //colorIfTests(code);
        //$('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
    });
});
