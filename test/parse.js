const expect = require('chai').expect;
const assert = require('chai').assert;

const fs = require('fs');
const path = require('path');

const etitle = require('../etitle');

const CURRENT_PATH = __dirname
const SAMPLE_ROOT = path.join(CURRENT_PATH, '../sample')

const basic_test = {
    file: path.join(SAMPLE_ROOT, '{=s.=b. }smith/lectures/{On the }2nd Person;2nd=person;mathematics;psychology.txt'),
    path_expected: 'smith/lectures/2ndperson',
    branch_expected: 'smith',
    branch_title_expected: 'S. B. Smith',
    title_expected: 'On the 2nd Person',
    labels: ['smith', '2ndperson', 'mathematics', 'psychology']
};

const special_character_test1 = {
    file: path.join(SAMPLE_ROOT, 'billy {_of=chicago}/{%quotes%}inner{%quotes% and %quotes%}outer{%quotes% of }Psychological Analysis.txt'),
    path_expected: 'billy/innerouterpsychologicalanalysis',
    branch_expected: 'billy',
    branch_title_expected: 'Billy of Chicago',
    title_expected: '"inner" and "outer" of Psychological Analysis',
    labels: ['billy']
};

const special_character_test2 = {
    file: path.join(SAMPLE_ROOT, 'billy {_of=chicago}/Section 5{%colon%}10{%colon% Behavior for }Introspection.txt'),
    path_expected: 'billy/section510introspection',
    branch_expected: 'billy',
    branch_title_expected: 'Billy of Chicago',
    title_expected: 'Section 5:10: Behavior for Introspection',
    labels: ['billy']
};

const fairly_boring_test = {
    file: path.join(SAMPLE_ROOT, 'billy {_of=chicago}/{The Importance of} Continual Regression Analysis;mathematics.txt'),
    path_expected: 'billy/continualregressionanalysis',
    branch_expected: 'billy',
    branch_title_expected: 'Billy of Chicago',
    title_expected: 'The Importance of Continual Regression Analysis',
    labels: ['billy', 'mathematics']
};

const branch_casing_test = {
    file: path.join(SAMPLE_ROOT, 'james==king/Topological Analysis;mathematics.txt'),
    path_expected: 'king/topologicalanalysis',
    branch_expected: 'king',
    branch_title_expected: 'James King',
    title_expected: 'Topological Analysis',
    labels: ['king', 'mathematics']
};

const exceptions_in_branch_test = {
    file: path.join(SAMPLE_ROOT, 's{cott }james/{What is }Illustrative{ and Analytic Economics%questionmark%}.txt'),
    path_expected: 'sjames/illustrative',
    branch_expected: 'sjames',
    branch_title_expected: 'Scott James',
    title_expected: 'What is Illustrative and Analytic Economics?',
    labels: ['sjames']
};

const labelmode_branch_test = {
    file: path.join(SAMPLE_ROOT, '{=s.=b. }smith/lectures/{On the }2nd Person;2nd=person;mathematics;psychology.txt'),
    path_expected: 'smith/lectures/2ndperson',
    branch_expected: 'smith',
    branch_title_expected: 'S. B. Smith',
    title_expected: 'On the 2nd Person',
    labels: ['smith/lectures', '2ndperson', 'mathematics', 'psychology']
};

const labelmode_each_test = {
    file: path.join(SAMPLE_ROOT, '{=s.=b. }smith/lectures/{On the }2nd Person;2nd=person;mathematics;psychology.txt'),
    path_expected: 'smith/lectures/2ndperson',
    branch_expected: 'smith',
    branch_title_expected: 'S. B. Smith',
    title_expected: 'On the 2nd Person',
    labels: ['smith', 'lectures', '2ndperson', 'mathematics', 'psychology']
};

const labelmode_explicit_test = {
    file: path.join(SAMPLE_ROOT, '{=s.=b. }smith/lectures/{On the }2nd Person;2nd=person;mathematics;psychology.txt'),
    path_expected: 'smith/lectures/2ndperson',
    branch_expected: 'smith',
    branch_title_expected: 'S. B. Smith',
    title_expected: 'On the 2nd Person',
    labels: ['2ndperson', 'mathematics', 'psychology']
};

const title_test = {
    file: path.join(SAMPLE_ROOT, 's{cott }james/fundamental-process-of-behavior.txt'),
    path_expected: 'sjames/fundamental-process-of-behavior',
    branch_expected: 'sjames',
    branch_title_expected: 'Scott James',
    title_expected: 'Fundamental Process of Behavior',
    labels: ['sjames']
};

const title_single_relative_test = {
    file: path.join(SAMPLE_ROOT, 's{cott }james/$ - cv.txt'),
    path_expected: 'sjames/cv',
    branch_expected: 'sjames',
    branch_title_expected: 'Scott James',
    title_expected: 'Curriculum Vitae',
    labels: ['sjames']
};

const title_single_override_test = {
    file: path.join(SAMPLE_ROOT, 's{cott }james/$ - resume.txt'),
    path_expected: 'sjames/resume',
    branch_expected: 'sjames',
    branch_title_expected: 'Scott James',
    title_expected: 'Résumé',
    labels: ['sjames']
};

const check = (item, result) => {
    let [selector, branch, title, branch_title, labels] = result;
    expect(selector).to.equal(item.path_expected)
    expect(branch).to.equal(item.branch_expected)
    expect(branch_title).to.equal(item.branch_title_expected)
    expect(title).to.equal(item.title_expected)
    expect(item.labels.length).to.equal(labels.length)
    item.labels.forEach(v => expect(labels).to.include(v));
};

function runWithTitleData(item, options) {
    return new Promise((resolve, reject) => {
        etitle.parse(item.file, SAMPLE_ROOT, options)
            .then(result => {
                check(item, result);
                resolve();
            }).catch(err => reject(err));
    });
}

describe("econtent", function () {
    it("tests createSelector", function (done) {
        const selector = etitle.createSelector('{=s.=b. }smith/lectures/{On the }2nd Person');
        expect(selector).to.equal('smith/lectures/2ndperson');
        done();
    });

    it("tests createSelector with deepDot", function (done) {
        const selector = etitle.createSelector('mongodb/basic{=setup}/configure.sh', false, true);
        expect(selector).to.equal('mongodb/basic/configure.sh');
        done();
    });

    it("tests createSelector with deepDot (but not set)", function (done) {
        const selector = etitle.createSelector('mongodb/basic{=setup}/configure.sh', false, false);
        expect(selector).to.not.equal('mongodb/basic/configure.sh');
        done();
    });

    it("tests createSelector with allowHyphensInSelector", function (done) {
        const selector = etitle.createSelector('s{cott }james/fundamental-process-of-behavior', true);
        expect(selector).to.equal('sjames/fundamental-process-of-behavior');
        done();
    });

    it("tests 'root' (default) labelMode", function (done) {
        check(basic_test, etitle.parse(basic_test.file, SAMPLE_ROOT));
        done();
    });

    it("tests 'branch' labelMode", function (done) {
        check(labelmode_branch_test, etitle.parse(labelmode_branch_test.file, SAMPLE_ROOT, { labelMode: 'branch'} ));
        done();
    });

    it("tests 'each' labelMode", function (done) {
        check(labelmode_each_test, etitle.parse(labelmode_each_test.file, SAMPLE_ROOT, { labelMode: 'each'} ));
        done();
    });

    it("tests 'explicit' labelMode", function (done) {
        check(labelmode_explicit_test, etitle.parse(labelmode_explicit_test.file, SAMPLE_ROOT, { labelMode: 'explicit'} ));
        done();
    });

    it("tests special characters", function (done) {
        check(special_character_test1, etitle.parse(special_character_test1.file, SAMPLE_ROOT));
        done();
    });

    it("tests more special characters", function (done) {
        check(special_character_test2, etitle.parse(special_character_test2.file, SAMPLE_ROOT));
        done();
    });

    it("tests branch casing", function (done) {
        check(branch_casing_test, etitle.parse(branch_casing_test.file, SAMPLE_ROOT));
        done();
    });

    it("tests root .titles", function (done) {
        etitle.parseUsingTitleData(title_test.file, SAMPLE_ROOT, { allowHyphensInSelector: true })
            .then(v => {
                check(title_test, v)
                done();
            })
            .catch(err => done(err));
    });

    it("tests root .titles with wrong allowHyphensInSelector setting", function (done) {
        etitle.parseUsingTitleData(title_test.file, SAMPLE_ROOT, { allowHyphensInSelector: false })
            .then(v => {
                let [selector,] = v;
                expect(selector).to.not.equal(title_test.path_expected)
                done();
            })
            .catch(err => done(err));
    });

    it("tests relative .titles", function (done) {
        etitle.parseUsingTitleData(title_single_relative_test.file, SAMPLE_ROOT, { allowHyphensInSelector: true })
            .then(v => {
                check(title_single_relative_test, v)
                done();
            })
            .catch(err => done(err));
    });

    it("tests relative override .titles", function (done) {
        etitle.parseUsingTitleData(title_single_override_test.file, SAMPLE_ROOT, { allowHyphensInSelector: true })
            .then(v => {
                check(title_single_override_test, v)
                done();
            })
            .catch(err => done(err));
    });

    it("tests root .titles sync", function (done) {
        check(title_test, etitle.parseUsingTitleDataSync(title_test.file, SAMPLE_ROOT, { allowHyphensInSelector: true }));
        done();
    });

    it("tests root .titles with wrong allowHyphensInSelector setting sync", function (done) {
        let [selector,] = etitle.parseUsingTitleDataSync(title_test.file, SAMPLE_ROOT, { allowHyphensInSelector: false })
        expect(selector).to.not.equal(title_test.path_expected)
        done();
    });

    it("tests relative .titles sync", function (done) {
        check(title_single_relative_test, etitle.parseUsingTitleDataSync(title_single_relative_test.file, SAMPLE_ROOT, { allowHyphensInSelector: true }))
        done();
    });

    it("tests relative override .titles sync", function (done) {
        check(title_single_override_test, etitle.parseUsingTitleDataSync(title_single_override_test.file, SAMPLE_ROOT, { allowHyphensInSelector: true }))
        done();
    });

    it("tests with provided titles", function (done) {
        const options = {
            allowHyphensInSelector: true,
            titleData: [
                {
                    "key": "sjames/fundamental-process-of-behavior",
                    "title": "Fundamental Process of Behavior"
                }
            ]
        }
        const result = etitle.parseUsingTitleDataSync(title_test.file, SAMPLE_ROOT, options)
        check(title_test, result);
        done();
    });

    it("tests exceptions in branch", function (done) {
        check(exceptions_in_branch_test, etitle.parse(exceptions_in_branch_test.file, SAMPLE_ROOT));
        done();
    });

    it("tests the most common usage", function (done) {
        check(fairly_boring_test, etitle.parse(fairly_boring_test.file, SAMPLE_ROOT));
        done();
    });
});