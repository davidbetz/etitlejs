const expect = require('chai').expect
const assert = require('chai').assert

const fs = require('fs')
const path = require('path')

const etitle = require('../etitle')

const CURRENT_PATH = __dirname
const SAMPLE_ROOT = path.join(CURRENT_PATH, '../sample')

const basic_test = {
    file: path.join(SAMPLE_ROOT, '{=s.=b. }smith/lectures/{On the }2nd Person;2nd=person;mathematics;psychology.txt'),
    path_expected: 'smith/lectures/2ndperson',
    branch_expected: 'smith',
    branch_title_expected: 'S. B. Smith',
    title_expected: 'On the 2nd Person',
    labels: ['smith', '2ndperson', 'mathematics', 'psychology']
}

const special_character_test1 = {
    file: path.join(SAMPLE_ROOT, 'billy {_of=chicago}/{%quotes%}inner{%quotes% and %quotes%}outer{%quotes% of }Psychological Analysis.txt'),
    path_expected: 'billy/innerouterpsychologicalanalysis',
    branch_expected: 'billy',
    branch_title_expected: 'Billy of Chicago',
    title_expected: '"inner" and "outer" of Psychological Analysis',
    labels: ['billy']
}

const special_character_test2 = {
    file: path.join(SAMPLE_ROOT, 'billy {_of=chicago}/Section 5{%colon%}10{%colon% Behavior for }Introspection.txt'),
    path_expected: 'billy/section510introspection',
    branch_expected: 'billy',
    branch_title_expected: 'Billy of Chicago',
    title_expected: 'Section 5:10: Behavior for Introspection',
    labels: ['billy']
}

const fairly_boring_test = {
    file: path.join(SAMPLE_ROOT, 'billy {_of=chicago}/{The Importance of} Continual Regression Analysis;mathematics.txt'),
    path_expected: 'billy/continualregressionanalysis',
    branch_expected: 'billy',
    branch_title_expected: 'Billy of Chicago',
    title_expected: 'The Importance of Continual Regression Analysis',
    labels: ['billy', 'mathematics']
}

const sequence_test1 = {
    file: path.join(SAMPLE_ROOT, 'james==king/#1#Topological Analysis;mathematics.txt'),
    path_expected: 'king/topologicalanalysis',
    branch_expected: 'king',
    branch_title_expected: 'James King',
    title_expected: 'Topological Analysis',
    sequence: 1,
    labels: ['king', 'mathematics']
}

const sequence_test2 = {
    file: path.join(SAMPLE_ROOT, 'james==king/#2#{Formulation of }Manifolds;mathematics.txt'),
    path_expected: 'king/manifolds',
    branch_expected: 'king',
    branch_title_expected: 'James King',
    title_expected: 'Formulation of Manifolds',
    sequence: 2,
    labels: ['king', 'mathematics']
}

const sequence_test3_broken = {
    file: path.join(SAMPLE_ROOT, 'james==king/#3invalid.txt'),
    path_expected: 'king/3invalid',
    branch_expected: 'king',
    branch_title_expected: 'James King',
    title_expected: '#3invalid',
    labels: ['king']
}

const starts_with_doubleequals = {
    file: path.join(SAMPLE_ROOT, '==wasser/ignore.txt'),
    path_expected: 'wasser/ignore',
    branch_expected: 'wasser',
    branch_title_expected: 'Wasser',
    title_expected: 'ignore',
    labels: ['wasser']
}

const exceptions_in_branch_test = {
    file: path.join(SAMPLE_ROOT, 's{cott }james/{What is }Illustrative{ and Analytic Economics%questionmark%}.txt'),
    path_expected: 'sjames/illustrative',
    branch_expected: 'sjames',
    branch_title_expected: 'Scott James',
    title_expected: 'What is Illustrative and Analytic Economics?',
    labels: ['sjames']
}

const labelmode_branch_test = {
    file: path.join(SAMPLE_ROOT, '{=s.=b. }smith/lectures/{On the }2nd Person;2nd=person;mathematics;psychology.txt'),
    path_expected: 'smith/lectures/2ndperson',
    branch_expected: 'smith',
    branch_title_expected: 'S. B. Smith',
    title_expected: 'On the 2nd Person',
    labels: ['smith/lectures', '2ndperson', 'mathematics', 'psychology']
}

const labelmode_each_test = {
    file: path.join(SAMPLE_ROOT, '{=s.=b. }smith/lectures/{On the }2nd Person;2nd=person;mathematics;psychology.txt'),
    path_expected: 'smith/lectures/2ndperson',
    branch_expected: 'smith',
    branch_title_expected: 'S. B. Smith',
    title_expected: 'On the 2nd Person',
    labels: ['smith', 'lectures', '2ndperson', 'mathematics', 'psychology']
}

const labelmode_explicit_test = {
    file: path.join(SAMPLE_ROOT, '{=s.=b. }smith/lectures/{On the }2nd Person;2nd=person;mathematics;psychology.txt'),
    path_expected: 'smith/lectures/2ndperson',
    branch_expected: 'smith',
    branch_title_expected: 'S. B. Smith',
    title_expected: 'On the 2nd Person',
    labels: ['2ndperson', 'mathematics', 'psychology']
}

const explicit_key_test = {
    file: path.join(SAMPLE_ROOT, 'j{ane }olsen/records - gryrum ecga þeos medoheal morgentid.txt'),
    path_expected: 'jolsen/records',
    branch_expected: 'jolsen',
    branch_title_expected: 'Jane Olsen',
    title_expected: 'gryrum ecga þeos medoheal morgentid',
    labels: ['jolsen']
}

const title_test = {
    file: path.join(SAMPLE_ROOT, 's{cott }james/Fundamental Process of Behavior.txt'),
    path_expected: 'sjames/fundamentalprocessofbehavior',
    branch_expected: 'sjames',
    branch_title_expected: 'Scott James',
    title_expected: 'Fundamental Process of Behavior',
    labels: ['sjames']
}

const title_doubleequals_on_title_start = {
    file: path.join(SAMPLE_ROOT, 'asdf/==useless.txt'),
    path_expected: 'asdf/useless',
    branch_expected: 'asdf',
    branch_title_expected: 'Asdf',
    title_expected: 'Useless',
    labels: ['asdf']
}

const title_doubleequals_in_middle_of_title = {
    file: path.join(SAMPLE_ROOT, 'asdf/something==useless.txt'),
    path_expected: 'asdf/useless',
    branch_expected: 'asdf',
    branch_title_expected: 'Asdf',
    title_expected: 'Useless',
    labels: ['asdf']
}

const title_doubleequals_invalid = {
    file: path.join(SAMPLE_ROOT, 'asdf/==.txt'),
    path_expected: 'asdf',
    branch_expected: 'asdf',
    branch_title_expected: 'Asdf',
    title_expected: '',
    labels: ['asdf']
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

describe("parse", function () {
    it("basic", function () {
        check(basic_test, etitle.parse(basic_test.file, SAMPLE_ROOT))
    })

    it("simple", function () {
        check(title_test, etitle.parse(title_test.file, SAMPLE_ROOT))
    })

    it("'root' (default) labelMode", function () {
        check(basic_test, etitle.parse(basic_test.file, SAMPLE_ROOT))
    })

    it("'branch' labelMode", function () {
        check(labelmode_branch_test, etitle.parse(labelmode_branch_test.file, SAMPLE_ROOT, { labelMode: 'branch' }))
    })

    it("'each' labelMode", function () {
        check(labelmode_each_test, etitle.parse(labelmode_each_test.file, SAMPLE_ROOT, { labelMode: 'each' }))
    })

    it("'explicit' labelMode", function () {
        check(labelmode_explicit_test, etitle.parse(labelmode_explicit_test.file, SAMPLE_ROOT, { labelMode: 'explicit' }))
    })

    it("starts with doubleequals", function () {
        check(starts_with_doubleequals, etitle.parse(starts_with_doubleequals.file, SAMPLE_ROOT))
    })

    it("doubleequals (invalid)", function () {
        check(title_doubleequals_invalid, etitle.parse(title_doubleequals_invalid.file, SAMPLE_ROOT))
    })

    it("doubleequals key", function () {
        check(title_doubleequals_on_title_start, etitle.parse(title_doubleequals_on_title_start.file, SAMPLE_ROOT))
    })

    it("doubleequals key (middle)", function () {
        check(title_doubleequals_in_middle_of_title, etitle.parse(title_doubleequals_in_middle_of_title.file, SAMPLE_ROOT))
    })

    it("explicit key", function () {
        check(explicit_key_test, etitle.parse(explicit_key_test.file, SAMPLE_ROOT))
    })

    it("special characters", function () {
        check(special_character_test1, etitle.parse(special_character_test1.file, SAMPLE_ROOT))
    })

    it("more special characters", function () {
        check(special_character_test2, etitle.parse(special_character_test2.file, SAMPLE_ROOT))
    })

    it("sequence", function () {
        check(sequence_test1, etitle.parse(sequence_test1.file, SAMPLE_ROOT))
        check(sequence_test2, etitle.parse(sequence_test2.file, SAMPLE_ROOT))
    })

    it("sequence (invalid)", function () {
        check(sequence_test3_broken, etitle.parse(sequence_test3_broken.file, SAMPLE_ROOT))
    })

    it("exceptions in branch", function (done) {
        check(exceptions_in_branch_test, etitle.parse(exceptions_in_branch_test.file, SAMPLE_ROOT))
        done()
    })

    it("the most common usage", function (done) {
        check(fairly_boring_test, etitle.parse(fairly_boring_test.file, SAMPLE_ROOT))
        done()
    })
})
