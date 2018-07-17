var Syntax_Highlighter = /** @class */ (function () {
    function Syntax_Highlighter(routines) {
        this.parseRoutines = routines;
    }
    Syntax_Highlighter.prototype.parseSingleResult = function (s, r, replacement) {
        if (s.match(r) == null) {
            return [{ value: s, grouped: false }];
        }
        var match_len = s.match(r)[0].length;
        var str1 = s.slice(0, s.search(r));
        var str2 = s.slice(s.search(r), s.search(r) + match_len).replace(r, replacement);
        var str3 = s.slice(s.search(r) + match_len);
        var strarr = [{ value: str1, grouped: false }, { value: str2, grouped: true }, { value: str3, grouped: false }];
        return strarr;
    };
    /*
    * Takes a snippet
    * Returns the snippet parsed
    */
    Syntax_Highlighter.prototype.parseSnippet = function (results, r, replacement) {
        if (results.length == 1) {
            results = this.parseSingleResult(results[0].value, r, replacement);
        }
        for (var i = 0; i < results.length; i++) {
            if (results[i].grouped == false && results[i].value.search(r) != -1) {
                var new_results = this.parseSingleResult(results[i].value, r, replacement);
                results.splice.apply(results, [i, 1].concat(this.parseSnippet(new_results, r, replacement)));
            }
        }
        return results;
    };
    Syntax_Highlighter.prototype.parseAllRoutines = function (s, routines) {
        var results = [{ value: s, grouped: false }];
        for (var i = 0; i < routines.length; i++) {
            results = this.parseSnippet(results, routines[i].reg, routines[i].replacement);
        }
        // join all of the results into a friendly routine
        var str = "";
        for (var i = 0; i < results.length; i++) {
            str += results[i].value;
        }
        return str;
    };
    Syntax_Highlighter.prototype.escapeHtml = function (string) {
        return String(string).replace(/[&<>"'`=\/]/g, function (s) {
            return Syntax_Highlighter.entityMap[s];
        });
    };
    Syntax_Highlighter.prototype.parseAllSnippets = function () {
        var code_snippets = document.getElementsByClassName("code");
        for (var i = 0; i < code_snippets.length; i++) {
            var escaped = this.escapeHtml(code_snippets[i].innerHTML);
            var t = this.parseAllRoutines(escaped, this.parseRoutines);
            var pre = document.createElement("pre");
            pre.innerHTML = t;
            code_snippets[i].parentNode.appendChild(pre);
        }
        var len = code_snippets.length;
        for (var i = 0; i < len; i++) { // cleanup
            code_snippets[0].parentNode.removeChild(code_snippets[0]);
        }
    };
    /*
    * Function to escape html brackets so it doesn't interfere with the pre tag
    */
    Syntax_Highlighter.entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };
    return Syntax_Highlighter;
}());
/// <reference path='syntax.ts'/>
var parseRoutines = new Array();
parseRoutines.push({ reg: new RegExp("(&#x2F;&#x2F;&#x2F;.*)"), replacement: "<span class='typescript_reference'>$1</span>" });
parseRoutines.push({ reg: new RegExp("(&#x2F;&#x2F;.*)"), replacement: "<span class='typescript_comment'>$1</span>" });
parseRoutines.push({ reg: new RegExp("(&#x2F;\\*[^*]*\\*+(?:[^&#x2F;*][^*]*\\*+)*&#x2F;)"), replacement: "<span class='typescript_multi_comment'>$1</span>" });
parseRoutines.push({ reg: new RegExp("(number|string|any)"), replacement: "<span class='typescript_type'>$1</span>" });
parseRoutines.push({ reg: new RegExp("(class)"), replacement: "<span class='typescript_class'>$1</span>" });
parseRoutines.push({ reg: new RegExp("(return)"), replacement: "<span class='typescript_return'>$1</span>" });
parseRoutines.push({ reg: new RegExp("(if)"), replacement: "<span class='typescript_condition'>$1</span>" });
parseRoutines.push({ reg: new RegExp("(else)"), replacement: "<span class='typescript_condition'>$1</span>" });
parseRoutines.push({ reg: new RegExp("(undefined)"), replacement: "<span class='typescript_undefined'>$1</span>" });
parseRoutines.push({ reg: new RegExp("(interface)"), replacement: "<span class='typescript_interface'>$1</span>" });
parseRoutines.push({ reg: new RegExp("(enum)"), replacement: "<span class='typescript_enum'>$1</span>" });
parseRoutines.push({ reg: new RegExp("\\b(\\d+)(?!;)\\b"), replacement: "<span class='typescript_number'>$1</span>" });
parseRoutines.push({ reg: new RegExp("\\.(\\d+)"), replacement: "<span>.</span><span class='typescript_number'>$1</span>" });
parseRoutines.push({ reg: new RegExp(" (-?)(\\d+)"), replacement: "<span> $1</span><span class='typescript_number'>$2</span>" });
parseRoutines.push({ reg: new RegExp("(static)"), replacement: "<span class='typescript_static'>$1</span>" });
parseRoutines.push({ reg: new RegExp("(let)"), replacement: "<span class='typescript_variable'>$1</span>" });
parseRoutines.push({ reg: new RegExp("(public)"), replacement: "<span class='typescript_public'>$1</span>" });
parseRoutines.push({ reg: new RegExp("(constructor)"), replacement: "<span class='typescript_constructor'>$1</span>" });
var highlighter = new Syntax_Highlighter(parseRoutines);
highlighter.parseAllSnippets();
