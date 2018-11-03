const expect = require('chai').expect
const assert = require('chai').assert

const fs = require('fs')
const path = require('path')

const etitle = require('../etitle')

const CURRENT_PATH = __dirname
const SAMPLE_ROOT = path.join(CURRENT_PATH, '../sample')

const title_single_relative_test = {
    file: path.join(SAMPLE_ROOT, 's{cott }james/$ - cv.txt'),
    path_expected: 'sjames/cv',
    branch_expected: 'sjames',
    branch_title_expected: 'Scott James',
    title_expected: 'Curriculum Vitae',
    labels: ['sjames']
}

const only_root_title_title = {
    file: path.join(SAMPLE_ROOT, 'billy {_of=chicago}/Section 5{%colon%}10{%colon% Behavior for }Introspection'),
    path_expected: 'billy/section510introspection',
    branch_expected: 'billy',
    branch_title_expected: 'Billy of Chicago',
    title_expected: 'Section 5:10 - Behavior for Introspection',
    labels: ['billy']
}

const title_hyphen_test = {
    file: path.join(SAMPLE_ROOT, 's{cott }james/fundamental-process-of-behavior.txt'),
    path_expected: 'sjames/fundamental-process-of-behavior',
    branch_expected: 'sjames',
    branch_title_expected: 'Scott James',
    title_expected: 'Fundamental Process of Behavior',
    labels: ['sjames']
}

const title_single_override_test = {
    file: path.join(SAMPLE_ROOT, 's{cott }james/$ - resume.txt'),
    path_expected: 'sjames/resume',
    branch_expected: 'sjames',
    branch_title_expected: 'Scott James',
    title_expected: 'Résumé',
    labels: ['sjames']
}

const check = (item, result) => {
    expect(result.selector).to.equal(item.path_expected)
    expect(result.branch).to.equal(item.branch_expected)
    expect(result.branch_title).to.equal(item.branch_title_expected)
    expect(result.title).to.equal(item.title_expected)
    expect(result.sequence).to.equal(item.sequence)
    expect(result.labels.length).to.equal(item.labels.length)
    item.labels.forEach(v => expect(result.labels).to.include(v))
}

describe("parse_with_titles", function () {
    it("root .titles only", function (done) {
        etitle.parse_with_titles(only_root_title_title.file, SAMPLE_ROOT)
            .then(v => {
                check(only_root_title_title, v)
                done()
            })
            .catch(err => done(err))
    })

    it("root .titles", function (done) {
        etitle.parse_with_titles(title_hyphen_test.file, SAMPLE_ROOT, { allowHyphensInSelector: true })
            .then(v => {
                check(title_hyphen_test, v)
                done()
            })
            .catch(err => done(err))
    })

    it("root .titles with wrong allowHyphensInSelector setting", function (done) {
        etitle.parse_with_titles(title_hyphen_test.file, SAMPLE_ROOT)
            .then(v => {
                expect(v.selector).to.not.equal(title_hyphen_test.path_expected)
                done()
            })
            .catch(err => done(err))
    })

    it("relative .titles", function (done) {
        etitle.parse_with_titles(title_single_relative_test.file, SAMPLE_ROOT, { allowHyphensInSelector: true })
            .then(v => {
                check(title_single_relative_test, v)
                done()
            })
            .catch(err => done(err))
    })

    it("relative override .titles", function (done) {
        etitle.parse_with_titles(title_single_override_test.file, SAMPLE_ROOT, { allowHyphensInSelector: true })
            .then(v => {
                check(title_single_override_test, v)
                done()
            })
            .catch(err => done(err))
    })

    it("with provided titles", function (done) {
        const options = {
            allowHyphensInSelector: true,
            titleData: [
                {
                    "key": "sjames/fundamental-process-of-behavior",
                    "title": "Fundamental Process of Behavior"
                }
            ]
        }
        etitle.parse_with_titles(title_hyphen_test.file, SAMPLE_ROOT, options)
            .then(result => {
                check(title_hyphen_test, result)
                done()
            })
    })

    it("with provided titles (mixed case)", function (done) {
        const options = {
            allowHyphensInSelector: true,
            titleData: [
                {
                    "key": "sjames/Fundamental-process-of-behavior",
                    "title": "Fundamental Process of Behavior"
                }
            ]
        }
        etitle.parse_with_titles(title_hyphen_test.file, SAMPLE_ROOT, options)
            .then(result => {
                check(title_hyphen_test, result)
                done()
            })
    })
})
