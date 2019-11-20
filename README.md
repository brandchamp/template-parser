# Template Parser

Opinionated simple and small template parser without dependencies.

### Api

* **parseTemplate** - Replace tokens in text with provided values
* **extractTokensFromTemplate** - Get tokens metadata from provided template


### parseTemplate

```JavaScript
import { parseTemplate } from '@brandchamp/simple-template-parser';

const template = `
  Hi {{FIRST-NAME}} {{LAST-NAME}},

  Please register to our portal to earn free stuff

  {{LINK-BUTTON "Register" REGISTER-URL}}

  All the best
  {{COMPANY-LOGO}}
`;

// Example 1 - Parsing template with all tokens available
const { text, unreplacedTokens } = parseTemplate(template, {
  'FIRST-NAME': 'John',
  'LAST-NAME': 'Doe',
  'COMPANY-LOGO': '<img src="http://company-logo.example.com"></img>',
  'REGISTER-URL': 'https://register.example.com',
  'LINK-BUTTON'(name, url) {
    return `<a class="ui large primary button" href="${url}">${name}</a>`;
  },
});

/*
<<<<<<<<OUTPUT [text]>>>>>>>
  Hi John Doe,

  Please register to our portal to earn free stuff

  <a class="ui large primary button" href="https://register.example.com">Register</a>

  All the best
  <img src="http://company-logo.example.com"></img>

<<<<<<<<OUTPUT [unreplacedTokens]>>>>>>>
[]
*/

// Example 2 - Parsing template without having value for all tokens
const { text, unreplacedTokens } = parseTemplate(template, {
  'FIRST-NAME': 'John',
  'COMPANY-LOGO': '<img src="http://company-logo.example.com"></img>',
});

/*
<<<<<<<<OUTPUT [text]>>>>>>>
  Hi John {{LAST-NAME}},

  Please register to our portal to earn free stuff

  {{LINK-BUTTON "Register" REGISTER-URL}}

  All the best
  <img src="http://company-logo.example.com"></img>

<<<<<<<<OUTPUT [unreplacedTokens]>>>>>>>
[{
  expression: '{{LAST-NAME}}',
  token: 'LAST-NAME',
  props: [],
}, {
  expression: '{{LINK-BUTTON "Register" REGISTER-URL}}',
  token: 'LINK-BUTTON',
  props: ['"Register"', 'REGISTER-URL'],
}]
*/

```

### extractTokensFromTemplate

```JavaScript

import { extractTokensFromTemplate } from '@brandchamp/simple-template-parser';

const template = `
  Hi {{FIRST-NAME}} {{LAST-NAME}},

  Please register to our portal to earn free stuff

  {{LINK-BUTTON "Register" REGISTER-URL}}

  All the best
  {{COMPANY-LOGO}}

  P.S Keep in mind that token naming convention is up to you ;)
  {{ functionName prop1 prop2 }}
`;

// Example3 - Extracting tokens from template without parsing it

const tokens = extractTokensFromTemplate(template)

/*
<<<<<<<<OUTPUT [tokens]>>>>>>>
[{
  expression: '{{FIRST-NAME}}',
  token: 'FIRST-NAME',
  props: [],
}, {
  expression: '{{LAST-NAME}}',
  token: 'LAST-NAME',
  props: [],
}, {
  expression: '{{LINK-BUTTON "Register" REGISTER-URL}}',
  token: 'LINK-BUTTON',
  props: ['"Register"', 'REGISTER-URL'],
}, {
  expression: '{{COMPANY-LOGO}}',
  token: 'COMPANY-LOGO',
  props: [],
}, {
  expression: '{{ functionName prop1 prop2 }}',
  token: 'functionName',
  props: [prop1, prop2],
}]
*/
```

### More examples

For more examples reference provided test `test/templateParser.spec.ts`
