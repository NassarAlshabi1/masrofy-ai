const {test}=require('node:test'); const assert=require('node:assert/strict'); const {parseExpense,valid,initial}=require('../www/model');
for(const [text,cents] of [['قهوة 65.50 جنيه',6550],['فاتورة 1,200 جنيه',120000],['قهوة ٦٥ جنيه',6500],['قهوة ٦٥٫٥٠ جنيه',6550],['قهوة ۶۵ جنيه',6500]]) test(text,()=>assert.equal(parseExpense(text).cents,cents));
for(const text of ['قهوة .50 جنيه','قهوة −50 جنيه','قهوة -50','مقابلة الساعة 3','2 قهوة بـ100','قهوة 0','قهوة 1,20','قهوة 65.555','قهوة']) test('reject '+text,()=>assert.throws(()=>parseExpense(text)));
test('valid saved state',()=>assert.ok(valid(JSON.parse(JSON.stringify(initial())))));
test('invalid saved state',()=>assert.equal(valid({version:1,expenses:[{cents:-1}],tasks:[false,false]}),false));
