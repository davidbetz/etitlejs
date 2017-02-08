// MIT License
// Copyright (c) 2017 David Betz
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

"use strict"

const fs = require('fs')
const path = require('path')

const poundre = /^#([0-9]+)#(.*)/i
const doubleequalsre = /==([A-Za-z0-9]+)/i
const titleFileName = '.titles'

const parse = (input, base, options) => {
    options = options || {}
    options.labelMode = options.labelMode || 'root'
    return processSelector(input, base, options)
}

const parseUsingTitleDataSync = (input, base, options) => {
    options = options || {}
    options.labelMode = options.labelMode || 'root'
    const parent = path.dirname(input).replace(/\\/g, "/")
    if (options.titleData && options.titleData.length > 0) {
        return processSelector(input, base, options)
    }
    options.titleData = createEffectiveTitleData(parseTitleDataSync(base), parseTitleDataSync(parent))
    return processSelector(input, base, options)
}

const parseUsingTitleData = (input, base, options) => {
    options = options || {}
    options.labelMode = options.labelMode || 'root'
    return new Promise((resolve, reject) => {
        const parent = path.dirname(input).replace(/\\/g, "/")
        if (options.titleData && options.titleData.length > 0) {
            return resolve(processSelector(input, base, options))
        }
        parseTitleData(base)
            .then(rootTitleData =>
                parseTitleData(parent)
                    .then(relativeTitleData => {
                        options.titleData = createEffectiveTitleData(rootTitleData, relativeTitleData)
                        resolve(processSelector(input, base, options))
                    }).catch(err => { reject(err); })
            ).catch(err => { reject(err); })
    })
}

const createSelector = (key, allowHyphensInSelector, keepDot) => {
    if (!key) {
        return ''
    }
    if (key.indexOf("==") > -1) {
        const partArray = key.split('/')
        const list = []
        for (let part of partArray) {
            if (part.indexOf("==") > -1) {
                const doubleequalsresult = doubleequalsre.exec(part)
                if (doubleequalsresult != null) {
                    const [, item] = doubleequalsresult
                    list.push(item.trim())
                }
            }
            else {
                list.push(part)
            }
        }
        key = list.join("/")
    }

    key = key
        .replace(/%questionmark%/g, "?")
        .replace(/%colon%/g, ":")
        .replace(/%quotes%/g, "\"")
        .replace(/%slash%/g, "/")
        .replace(/%blackslash%/g, "\\")
        .replace(/ /g, '')
        .trim().toLowerCase()

    key = removeEachException(key)

    key = key.replace(new RegExp(`[^A-Za-z0-9\/${(allowHyphensInSelector ? "-" : '')}${(keepDot ? "\\." : '')}]+`, 'g'), '')

    return key
}

function createEffectiveTitleData(rootTitleData, relativeTitleData) {
    let effectiveTitleData = rootTitleData
    if (relativeTitleData.length > 0) {
        effectiveTitleData = rootTitleData.filter(v => {
            return !relativeTitleData.find(p => v.key == p.key)
        }).concat(relativeTitleData)
    }
    return effectiveTitleData
}

function transformTitleData(data) {
    return data.split('\n').map(line => {
        const index = line.indexOf(',')
        if (index == -1) {
            return null
        }
        return {
            key: line.substring(0, index).trim(),
            title: line.substring(index + 1).trim()
        }
    })
}

function parseTitleDataSync(titleFolder) {
    const titleFile = path.join(titleFolder, titleFileName)
    if (!fs.existsSync(titleFile)) {
        return []
    }
    else {
        return transformTitleData(fs.readFileSync(titleFile, 'utf8'))
    }
}

function parseTitleData(titleFolder) {
    return new Promise((resolve, reject) => {
        const titleFile = path.join(titleFolder, titleFileName)
        fs.exists(titleFile, exists => {
            if (!exists) {
                return resolve([])
            }
            fs.readFile(titleFile, 'utf8', function (err, data) {
                if (err) throw reject(err)
                resolve(transformTitleData(data))
            })
        })
    })
}

function clean(path) {
    if (path[0] == '/') path = path.substring(1)
    if (path[path.length - 1] == '/') path = path.substring(0, path.length - 1)
    return path
}

function processSelector(input, base, options) {
    const allowHyphensInSelector = options.allowHyphensInSelector
    const labelMode = options.labelMode
    const parent = path.dirname(input).replace(/\\/g, "/")
    input = clean(input.substring(base.length)).replace(/\\/g, "/")
    const name = path.basename(input).replace(/\\/g, "/")
    input = clean(input.substring(0, input.length - name.length - 1))
    base = base.replace(/\\/g, "/")
    const lastDot = name.lastIndexOf(".")
    const filename = name.substring(0, lastDot)
    let [key, title] = getKeyAndTitle(filename, allowHyphensInSelector)
    const semicolonIndex = filename.indexOf(";")
    const url = input.replace(/\\/g, '/')
    const branch_title = formatBranchName(url.split('/')[0])
    const branchesToRoot = createSelector(url)
    //+ 
    const selector = createSelector(clean(url) + '/' + key, allowHyphensInSelector)
    const branch = createSelector(url.split('/')[0] || '', allowHyphensInSelector)
    //+ 
    title = cleanTitle(selector, title, options.titleData).trim()
    //+ label
    let labels = []
    if (semicolonIndex > 0 && filename[semicolonIndex - 1] != '/') {
        filename.substring(semicolonIndex + 1, filename.length).split(';').map(v => labels.push(createSelector(v)))
    }
    if (labelMode == 'root' && branch) {
        labels.push(branch)
    }
    else if (labelMode == 'branch' && branchesToRoot) {
        labels.push(branchesToRoot)
    }
    else if (labelMode == 'each' && branchesToRoot) {
        branchesToRoot.split('/').map(v => labels.push(v))
    }
    return [selector, branch, title, branch_title, labels || []]
}

function cleanTitle(key, title, titleData) {
    if (!title) {
        return ''
    }
    if (title == "$" || titleData) {
        const newTitle = titleData.find(v => v.key == key)
        if (newTitle) {
            title = newTitle.title
        }
    }
    title = title.replace(/{/g, '')
        .replace(/}/g, '')
        .replace(/%questionmark%/g, "?")
        .replace(/%colon%/g, ":")
        .replace(/%quotes%/g, "\"")
        .replace(/%slash%/g, "/")
        .replace(/%blackslash%/g, "\\")
    if (title == "$") {
        title = ''
    }
    return title
}

function getKeyAndTitle(path, allowHyphensInSelector) {
    let key
    let title
    const semicolonIndex = path.indexOf(";")
    if (semicolonIndex > 0 && path[semicolonIndex - 1] != '/') {
        path = path.substring(0, semicolonIndex)
    }
    if (path.startsWith("#")) {
        const poundresult = poundre.exec(line)
        if (poundresult != null) {
            const [, path] = poundresult
            path = path.trim()
        }
    }
    if (path.startsWith("==")) {
        const doubleequalsresult = doubleequalsre.exec(line)
        if (doubleequalsresult != null) {
            const [, key] = doubleequalsresult
            return [key.trim(), '']
        }
    }
    else if (path.indexOf("==") > -1) {
        const doubleequalsresult = doubleequalsre.exec(line)
        if (doubleequalsresult != null) {
            const [, key] = doubleequalsresult
            return [key.trim(), title]
        }
    }
    if (path.indexOf(" - ") > -1) {
        const pathPartArray = path.split('-')
        if (pathPartArray[0].trim() == "$") {
            title = "$"
            key = pathPartArray[1].trim()
        }
        else {
            title = pathPartArray[1].trim()
            key = pathPartArray[0].trim()
        }
    }
    else {
        key = path
        title = path
    }
    //+ 
    key = createSelector(key, allowHyphensInSelector)
    title = title.trim()
    //+ 
    return [key, title]
}

function createFromFileName(key, allowHyphensInSelector, keepDot) {
    const semicolonIndex = key.indexOf(";")
    if (semicolonIndex > 0 && key[semicolonIndex - 1] != '/') {
        key = filename.substring(0, semicolonIndex)
    }
    else {
        const lio = key.lastIndexOf(".")
        if (lio > -1) {
            key = key.substring(0, lio)
        }
    }
    return createSelector(key, allowHyphensInSelector, keepDot)
}

function removeEachException(text) {
    let inside = false
    let escaped = false
    let newString = ''
    for (let location = 0; location < text.length; location++) {
        let current = text[location]
        if (current == '\\') {
            escaped = !escaped
        }
        else if (current == '{' && !escaped) {
            inside = true
        }
        else if (current == '}' && inside && !escaped) {
            inside = false
        }
        else if (inside) {
            escaped = false
        }
        else {
            newString += current
            escaped = false
        }
    }
    return newString
}

function formatBranchName(name) {
    var sb = []
    name = name.replace(/{/g, "").replace(/}/g, "").replace(/==/g, " ")
    for (var n = 0; n < name.length; n++) {
        const c = name[n]
        if (c == '_' && n + 1 < name.length) {
            sb.push(" " + name[n + 1].toString().toLowerCase())
            n++
        }
        else if (c == '=' && n + 1 < name.length) {
            sb.push(" " + name[n + 1].toString().toUpperCase())
            n++
        }
        else if (c == ' ' && n + 1 < name.length) {
            if (name[n + 1] == '=' || name[n + 1] == '_') {
                continue
            }
            sb.push(" " + name[n + 1].toString().toUpperCase())
            n++
        }
        else if (n == 0) {
            sb.push(name[n].toString().toUpperCase())
        }
        else {
            sb.push(c)
        }
    }
    return sb.join('').trim()
}

exports.parse = parse
exports.parseUsingTitleData = parseUsingTitleData
exports.parseUsingTitleDataSync = parseUsingTitleDataSync
exports.createSelector = createSelector
