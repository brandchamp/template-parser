interface ITokenValueProvider {
  (...props:any):string,
}

// Check extractTokensFromTemplate function for examples
interface ITemplateToken {
  expression:string,
  token:string,
  props:string[],
}

interface IParseTemplateResponse {
  text:string,
  unreplacedTokens:ITemplateToken[],
}

export type ITokenValue = string | ITokenValueProvider;

/**
 * Replace template expressions such as `use {{REF-DISC-CODE}} code...` with provided token values
 */
export function parseTemplate(
  template:string,
  tokenValues:{ [key:string]:ITokenValue },
):IParseTemplateResponse {
  const templateTokens = extractTokensFromTemplate(template);
  const unreplacedTokens = [] as ITemplateToken[];

  const parsedTemplate = templateTokens
    .reduce((evaluatedTemplate, templateToken) => {
      const { expression, token, props } = templateToken;
      const tokenValueOrFunction = tokenValues[token];
      const isFunction = typeof tokenValueOrFunction === 'function';

      const evaluatedProps = props.map((prop) => {
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

      const tokenValue = isFunction
        ? (tokenValueOrFunction as any)(...evaluatedProps)
        : tokenValueOrFunction;

      if (
        (typeof tokenValue !== 'string' && typeof tokenValue !== 'number') ||
        (evaluatedProps.length && !isFunction) // expression with props requires function
      ) {
        unreplacedTokens.push(templateToken);
        return evaluatedTemplate;
      }

      return evaluatedTemplate.replace(expression, String(tokenValue));
    }, template);

  return {
    text: parsedTemplate,
    unreplacedTokens,
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
export function extractTokensFromTemplate(template):ITemplateToken[] {
  if (!template || typeof template !== 'string') {
    return [];
  }

  // Look for template expressions in text as {{ TOKEN }}
  // Note: the .exec method mutates the RegExp instance, so always create new one here:
  const templateExpressionRegExp = /{{([^{}]+)}}/g;
  return matchAll(template, templateExpressionRegExp)
    .map((match) => {
      // Parse expression into tokens
      // e.g {{ LINK-BUTTON "Name" Link }} => [LINK-BUTTON, "Name", LINK]
      const tokensRegex = /("(?:[^"\\]|\\.)*")|([A-z0-9:-]+)/g;
      const tokens = matchAll(match[1], tokensRegex);
      if (!tokens || !tokens.length) {
        return; // Not valid template ignore e.g ({{  }})
      }
      return {
        expression: match[0],
        token: tokens.shift()[0],
        props: tokens.map(t => t[0]),
      };
    })
    .filter(token => token);
}

// Helpers

/**
 * Can be replaced with String.prototype.matchAll but support for it is not best ATM
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll
 */
function matchAll(str, regex) {
  const matches = [];
  let match;

  while ((match = regex.exec(str))) {
    matches.push(match);
  }

  return matches;
}
