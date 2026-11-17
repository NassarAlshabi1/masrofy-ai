const {test}=require('node:test'); const assert=require('node:assert/strict'); const {parseExpense,valid,initial,migrate}=require('../www/model');
for(const [text,amount] of [['قهوة 65',65],['قهوة 65 جنيه',65],['فاتورة 1,200 ريال',1200],['قهوة ٦٥',65],['قهوة 65 usd',65],['قهوة 120$',120],['قهوة ۶۵',65],['قهوة 65 ج.م',65]]) test(text,()=>assert.equal(parseExpense(text).amount,amount));
for(const text of ['قهوة .50','قهوة 65.50','قهوة ٦٥٫٥٠','قهوة 65٫5','قهوة −50','قهوة -50','مقابلة الساعة 3','2 قهوة بـ100','قهوة 0','قهوة 1,20','قهوة 65.555','قهوة']) test('reject '+text,()=>assert.throws(()=>parseExpense(text)));
test('currency words stripped from title',()=>{assert.equal(parseExpense('قهوة 65 ريال').title,'قهوة');assert.equal(parseExpense('قهوة 65 usd').title,'قهوة');assert.equal(parseExpense('قهوة 65 ج.م').title,'قهوة');});
test('valid saved state',()=>assert.ok(valid(JSON.parse(JSON.stringify(initial())))));
test('invalid saved state',()=>assert.equal(valid({version:2,expenses:[{amount:-1}],tasks:[false,false]}),false));
test('migrate v1 cents to whole amounts',()=>{const m=migrate({version:1,expenses:[{title:'قهوة',cents:6550,category:'مشتريات'}],tasks:[true,false]});assert.deepEqual(m,{version:2,expenses:[{title:'قهوة',amount:66,category:'مشتريات'}],tasks:[true,false]});assert.ok(valid(m));});
