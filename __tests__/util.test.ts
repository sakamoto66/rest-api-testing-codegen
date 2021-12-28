import { json_stringify } from '../src/util';

describe('json_stringify', () => {
    const space = '  ';
    const fn = (val:any) => {
        if(val == 'hoge') {
            return `"foo"`;
        }
        return JSON.stringify(val);
    };
    test('text', () => {
        const json = 'text';
        const assert = JSON.stringify(json, null, space);
        expect(json_stringify(json, space, 1)).toBe(assert);
    });
    test('number', () => {
        const json = 123;
        const assert = JSON.stringify(json, null, space);
        expect(json_stringify(json, space, 1)).toBe(assert);
    });
    test('object', () => {
        const json = {
            "string":"bb",
            "number":123,
            "object":{"subobj":999},
            "array":[1,2,3,4,"aa"]
        };
        const assert = JSON.stringify(json, null, space);
        expect(json_stringify(json, space, 1)).toBe(assert);
    });
    test('array', () => {
        const json = [
            "bb",
            123,
            {"subobj":999},
            [1,2,3,4,"aa"]
        ];
        const assert = JSON.stringify(json, null, space);
        expect(json_stringify(json, space, 1)).toBe(assert);
    });
    test('callback', () => {
        const json = [
            "hoge",
            {
                "subobj":"hoge",
                "item":["hoge","hoge"]
            }
        ];
        const assert = JSON.stringify(json, null, space).replace(/hoge/g, "foo");
        expect(json_stringify(json, space, 1, fn)).toBe(assert);
    });
});
