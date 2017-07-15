require('should');

var name = 'zhaojian';

describe('Name', function () {
    it('the name should be zhaojian', function () {
        name.should.eql('zhaojian');
    });
});