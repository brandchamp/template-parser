import { assert } from 'chai';
import {
  parseTemplate,
  extractTokensFromTemplate,
} from '../src/templateParser';

describe('common/templateParser', () => {
  it('Should parse template with multiple discount codes and referral links', () => {
    // tslint:disable-next-line:max-line-length
    const rawString = 'Discount code {{REF-DISC-CODE}} and referral link {{TL:SHOPIFY-REF-LINK}} and discount code again {{REF-DISC-CODE}}';
    const tokens = {
      'REF-DISC-CODE': 'DC-1',
      'TL:SHOPIFY-REF-LINK': 'RL-1',
    };

    const evaluatedTemplate = parseTemplate(rawString, tokens);

    assert.deepEqual(evaluatedTemplate.unreplacedTokens.length, 0, 'All tokens replaced');
    assert.equal(
      evaluatedTemplate.text,
      'Discount code DC-1 and referral link RL-1 and discount code again DC-1',
    );
  });

  it('Should partially parse template', () => {
    const rawString = 'existing {{existing-token}} and {{non-existing-token}}';
    const tokens = {
      'existing-token': 'token',
    };

    const evaluatedTemplate = parseTemplate(rawString, tokens);
    assert.deepEqual(evaluatedTemplate.unreplacedTokens, [{
      expression: '{{non-existing-token}}',
      token: 'non-existing-token',
      props: [],
    }]);
    assert.equal(
      evaluatedTemplate.text,
      'existing token and {{non-existing-token}}',
    );

    // Add non existing token and parse again
    tokens['non-existing-token'] = 'new-token';
    const newEvaluatedTemplate = parseTemplate(rawString, tokens);

    assert.equal(newEvaluatedTemplate.unreplacedTokens.length, 0, 'All token replaced');
    assert.equal(
      newEvaluatedTemplate.text,
      'existing token and new-token',
    );
  });

  it('Should parse template including function tokens', () => {
    const rawString = `
    Function with params: {{ FUNC-WITH-PARAMS "String Param", TOKEN-PARAM }}
    Plain token {{ TOKEN }}
    Func no params {{ FUNC }}`;

    const evaluatedTemplate = parseTemplate(rawString, {
      'FUNC-WITH-PARAMS': (param1, param2) => `FWP(${param1}, ${param2})`,
      TOKEN: 'Plain token value',
      FUNC: () => 'Func token value',
    });
    assert.equal(evaluatedTemplate.unreplacedTokens.length, 0, 'All token replaced');
    assert.equal(
      trim(evaluatedTemplate.text),
      trim(`
      Function with params: FWP(String Param, TOKEN-PARAM)
      Plain token Plain token value
      Func no params Func token value`),
    );
  });

  it('Should not break if null is passed when parsing template', () => {
    const evaluatedTemplate1 = parseTemplate(null, { TOKEN: 'aaa' });
    assert.deepEqual(evaluatedTemplate1, { text: null, unreplacedTokens: [] });

    const evaluatedTemplate2 = parseTemplate(44 as any, { TOKEN: 'aaa' });
    assert.deepEqual(evaluatedTemplate2, { text: 44 as any, unreplacedTokens: [] });
  });

  it('Should replace same token with different params', () => {
    const template = '1) {{token "first"}} 2) {{token "second"}} 3) {{token third}}';
    const evaluatedTemplate = parseTemplate(template, {
      token: value => value,
    });
    assert.equal(evaluatedTemplate.unreplacedTokens.length, 0, 'All token replaced');
    assert.equal(evaluatedTemplate.text, '1) first 2) second 3) third');
  });

  it('Should replace token only if value is string or number', () => {
    const template = '{{token1}} {{token2}} {{fun1}} {{fun2}} {{empty-string}}';
    const evaluatedTemplate = parseTemplate(template, {
      token1: 't1',
      token2: [1, 2, 3] as any,
      fun1: () => 3 as any,
      fun2: () => null,
      'empty-string': '',
    });

    assert.deepEqual(evaluatedTemplate.unreplacedTokens, [{
      expression: '{{token2}}',
      token: 'token2',
      props: [],
    }, {
      expression: '{{fun2}}',
      token: 'fun2',
      props: [],
    }]);
    assert.equal(evaluatedTemplate.text, 't1 {{token2}} 3 {{fun2}} ');
  });

  it('Should not replace token with params if provided token value is not function', () => {
    const template = 'template: {{ token-1, param1 param2}} {{token-2,param1,param2 }} {{token-1}}';
    const evaluatedTemplate = parseTemplate(template, {
      'token-1': 'token 1 value',
      'token-2': (param1, param2) => `token 2 value with [${param1}, ${param2}]`,
    });

    assert.deepEqual(evaluatedTemplate.unreplacedTokens, [{
      expression: '{{ token-1, param1 param2}}',
      token: 'token-1',
      props: ['param1', 'param2'],
    }]);
    assert.equal(
      evaluatedTemplate.text,
      'template: {{ token-1, param1 param2}} token 2 value with [param1, param2] token 1 value',
    );
  });

  it('Should extract tokens from template', () => {
    assert.deepEqual(extractTokensFromTemplate('{invalid} {{}} {{  }} {{./, }}'), []);
    assert.deepEqual(extractTokensFromTemplate(null), []);

    assert.deepEqual(extractTokensFromTemplate('Referral link {{{{TL:SHOPIFY-REF-LINK}}}}'), [{
      expression: '{{TL:SHOPIFY-REF-LINK}}',
      token: 'TL:SHOPIFY-REF-LINK',
      props: [],
    }]);

    assert.deepEqual(extractTokensFromTemplate(
      'before {}{{ BUTTON "My Profile" LINK "http://my-profile.com"}}'), [{
        expression: '{{ BUTTON "My Profile" LINK "http://my-profile.com"}}',
        token: 'BUTTON',
        props: ['"My Profile"', 'LINK', '"http://my-profile.com"'],
      }]);

    assert.deepEqual(extractTokensFromTemplate(
      '{{TOKEN_1}} {{ TOKEN-2 }} {{ TOKEN:3 and  props}}'), [{
        expression: '{{TOKEN_1}}',
        token: 'TOKEN_1',
        props: [],
      }, {
        expression: '{{ TOKEN-2 }}',
        token: 'TOKEN-2',
        props: [],
      }, {
        expression: '{{ TOKEN:3 and  props}}',
        token: 'TOKEN:3',
        props: ['and', 'props'],
      }]);

    assert.deepEqual(extractTokensFromTemplate('{{ first,prop1 prop2/prop3 "4/5,6" }}'), [{
      expression: '{{ first,prop1 prop2/prop3 "4/5,6" }}',
      token: 'first',
      props: ['prop1', 'prop2', 'prop3', '"4/5,6"'],
    }]);
  });
});

// Helpers

// Replace any white space character(s) with single white space
export function trim(str:string) {
  return str.replace(/\s+/g, ' ').trim();
}
