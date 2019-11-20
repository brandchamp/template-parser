'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Replace template expressions such as `use {{REF-DISC-CODE}} code...` with provided token values
 */
function parseTemplate(template, tokenValues) {
    var templateTokens = extractTokensFromTemplate(template);
    var unreplacedTokens = [];
    var parsedTemplate = templateTokens
        .reduce(function (evaluatedTemplate, templateToken) {
        var expression = templateToken.expression, token = templateToken.token, props = templateToken.props;
        var tokenValueOrFunction = tokenValues[token];
        var isFunction = typeof tokenValueOrFunction === 'function';
        var evaluatedProps = props.map(function (prop) {
            // If prop is wrapped in string unwrap it ('"test"' => 'test')
            if (prop.startsWith('"') && prop.endsWith('"')) {
                return JSON.parse(prop);
            }
            // If prop is not wrapped in string check is it one of provided tokes
            if (tokenValues[prop]) {
                return tokenValues[prop];
            }
            return prop;
        });
        var tokenValue = isFunction
            ? tokenValueOrFunction.apply(void 0, evaluatedProps) : tokenValueOrFunction;
        if ((typeof tokenValue !== 'string' && typeof tokenValue !== 'number') ||
            (evaluatedProps.length && !isFunction) // expression with props requires function
        ) {
            unreplacedTokens.push(templateToken);
            return evaluatedTemplate;
        }
        return evaluatedTemplate.replace(expression, String(tokenValue));
    }, template);
    return {
        text: parsedTemplate,
        unreplacedTokens: unreplacedTokens,
    };
}
/**
 * Example 1 => {{ REF-DISC-CODE }}
 *  {
 *    expression: '{{ REF-DISC-CODE }}'
 *    token: 'REF-DISC-CODE'
 *    props: [],
 *  }
 *
 * Example 2 => {{ LINK-BUTTON "Profile", "https://portal/me" }}
 *  {
 *    expression: {{ LINK-BUTTON "My profile", PROFILE-URL}},
 *    token: 'LINK-BUTTON'
 *    props: ['"My Profile"', 'PROFILE-URL']
 *  }
 */
function extractTokensFromTemplate(template) {
    if (!template || typeof template !== 'string') {
        return [];
    }
    // Look for template expressions in text as {{ TOKEN }}
    // Note: the .exec method mutates the RegExp instance, so always create new one here:
    var templateExpressionRegExp = /{{([^{}]+)}}/g;
    return matchAll(template, templateExpressionRegExp)
        .map(function (match) {
        // Parse expression into tokens
        // e.g {{ LINK-BUTTON "Name" Link }} => [LINK-BUTTON, "Name", LINK]
        var tokensRegex = /("(?:[^"\\]|\\.)*")|([A-z0-9:-]+)/g;
        var tokens = matchAll(match[1], tokensRegex);
        if (!tokens || !tokens.length) {
            return; // Not valid template ignore e.g ({{  }})
        }
        return {
            expression: match[0],
            token: tokens.shift()[0],
            props: tokens.map(function (t) { return t[0]; }),
        };
    })
        .filter(function (token) { return token; });
}
// Helpers
/**
 * Can be replaced with String.prototype.matchAll but support for it is not best ATM
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll
 */
function matchAll(str, regex) {
    var matches = [];
    var match;
    while ((match = regex.exec(str))) {
        matches.push(match);
    }
    return matches;
}

exports.extractTokensFromTemplate = extractTokensFromTemplate;
exports.parseTemplate = parseTemplate;
