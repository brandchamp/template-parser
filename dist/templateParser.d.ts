interface ITokenValueProvider {
    (...props: any): string;
}
interface ITemplateToken {
    expression: string;
    token: string;
    props: string[];
}
interface IParseTemplateResponse {
    text: string;
    unreplacedTokens: ITemplateToken[];
}
export declare type ITokenValue = string | ITokenValueProvider;
/**
 * Replace template expressions such as `use {{REF-DISC-CODE}} code...` with provided token values
 */
export declare function parseTemplate(template: string, tokenValues: {
    [key: string]: ITokenValue;
}): IParseTemplateResponse;
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
export declare function extractTokensFromTemplate(template: any): ITemplateToken[];
export {};
