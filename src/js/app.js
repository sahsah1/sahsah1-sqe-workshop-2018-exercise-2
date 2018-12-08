import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {substituteCode} from './code-analyzer';
import {generateCode} from './code-analyzer';
//import {setJson} from './code-analyzer';
//import {newJson} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        //setJson(parsedCode);
        substituteCode((parsedCode));
        let code = generateCode(parsedCode);

        //let substitutedCode = replaceAllOccurences(codeToParse);
        $('#parsedCode').val(code);
        //$('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
    });
});
