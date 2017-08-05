const expect = require('chai').expect
const assert = require('chai').assert

const fs = require('fs')
const path = require('path')

const etitle = require('../etitle')

describe("create_selector", function () {
    it("just slash", function () {
        const selector = etitle.create_selector('/')
        expect(selector).to.equal('')
    })

    it("blank", function () {
        const selector = etitle.create_selector('')
        expect(selector).to.equal('')
    })

    it("invalid doubleequals", function () {
        const selector = etitle.create_selector('asdf/==')
        expect(selector).to.equal('asdf')
    })

    it("with odd trailing slash", function () {
        const selector = etitle.create_selector('{=s.=b. }smith/lectures/{On the }2nd Person/')
        expect(selector).to.equal('smith/lectures/2ndperson')
    })

    it("basic", function () {
        const selector = etitle.create_selector('{=s.=b. }smith/lectures/{On the }2nd Person')
        expect(selector).to.equal('smith/lectures/2ndperson')
    })

    it("with deepDot", function () {
        const selector = etitle.create_selector('mongodb/basic{=setup}/configure.sh', false, true)
        expect(selector).to.equal('mongodb/basic/configure.sh')
    })

    it("error: missing key", function () {
        try {
            etitle.create_selector()
            expect(1).to.eq(0)
        }
        catch (ex) {
            expect(ex.message).to.eq('key is required')
        }
    })

    it("with ==", function () {
        const selector = etitle.create_selector('john==doe/baking{ at home}', false, false)
        expect(selector).to.equal('doe/baking')
    })

    it("with deepDot (but not set)", function () {
        const selector = etitle.create_selector('mongodb/basic{=setup}/configure.sh', false, false)
        expect(selector).to.not.equal('mongodb/basic/configure.sh')
    })

    it("with allowHyphensInSelector", function () {
        const selector = etitle.create_selector('s{cott }james/fundamental-process-of-behavior', true)
        expect(selector).to.equal('sjames/fundamental-process-of-behavior')
    })
})
