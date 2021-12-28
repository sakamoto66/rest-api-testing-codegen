import { CodeGenerator } from '../src/codegenerator';
import * as fs from 'fs';

describe('CodeGenerator', () => {
    const space = '  ';

    test('indent0', () => {
        const gen = new CodeGenerator('a.cache', space);
        gen.push('abc');
        gen.push('def');
        gen.push('ghi');
        gen.close();
        const assert = "abc\ndef\nghi\n";
        expect(fs.readFileSync('a.cache', "utf8")).toBe(assert);
    });
    test('indent1', () => {
        const gen = new CodeGenerator('a.cache', space);
        gen.up('{');
        gen.push('abc');
        gen.push('def');
        gen.down('}');
        gen.down('}');
        gen.close();
        const assert = "{\n  abc\n  def\n}\n}\n";
        expect(fs.readFileSync('a.cache', "utf8")).toBe(assert);
    });
    test('indent2', () => {
        const gen = new CodeGenerator('a.cache', space);
        gen.up('{');
        gen.push('abc');
        gen.up('{');
        gen.push('def');
        gen.down('}');
        gen.down('}');
        gen.close();
        const assert = "{\n  abc\n  {\n    def\n  }\n}\n";
        expect(fs.readFileSync('a.cache', "utf8")).toBe(assert);
    });
});

