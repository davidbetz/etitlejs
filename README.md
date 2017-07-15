# Extended Title Reader (JavaScript)

**Copyright (c) 2017 David Betz**

(the 2017 JavaScript port of the 2008 .NET version)

[![Build Status](https://travis-ci.org/davidbetz/etitlejs.svg?branch=master)](https://travis-ci.org/davidbetz/etitlejs)
[![npm version](https://badge.fury.io/js/etitle.svg)](https://badge.fury.io/js/etitle)

## Installation

    npm install etitle

Home:

* [https://www.npmjs.com/package/etitle](https://www.npmjs.com/package/etitle)

* [https://github.com/davidbetz/etitlejs](https://github.com/davidbetz/etitlejs)

Related project: 
    
* [https://www.npmjs.com/package/econtent](https://www.npmjs.com/package/econtent)

* [https://github.com/davidbetz/econtentn](https://github.com/davidbetz/econtentn)

## Purpose

Filenames can contain a lot more than simply a name. This is an important discovery when a filename is all that we have. Modern content solutions demand pretty URLs, expressive titles, and meaningful tags/labels.

This projects lets you get all of these from the filename.

## Example

Consider the following document filename:

    /usr/cms/uni/billy {_of=chicago}/{The Importance of} Continual Regression Analysis;mathematics.txt

Using `etitle`, this data produces the following data:

* **Title**: The Importance of Continual Regression Analysis

* **Branch Title**: Billy of Chicago

* **URL**: billy/continualregressionanalysis

* **Branch**: billy

* **Labels/Tags**: ['billy', 'mathematics']

Using this information, a custom web platform could contain a registry of URLs for routing.

## Details

### Paths

Filenames are based after their base path. In the above example, we would have told the system to scan or read the following path:

    /usr/cms/uni

In this path it would find the following file:

    /usr/cms/uni/billy {_of=chicago}/{The Importance of} Continual Regression Analysis;mathematics.txt

It knows to only parse the following:

    billy {_of=chicago}/{The Importance of} Continual Regression Analysis;mathematics.txt

### Selectors

Selectors are the keys that can be used as URLs. Selectors, therefore, follow the same rules as URLs with the added constraint of prettiness.

These are created by removing exceptions, labels, and file-related stuff from the filename. In the previous example, the following:

    billy {_of=chicago}/{The Importance of} Continual Regression Analysis;mathematics.txt

...becomes...

    billy/continualregressionanalysis

Exceptions are the {} sections. Anything in those are removed from. Pretty URLs don't have spaces (%20), so those are removed. They also don't have file extensions (e.g. txt); because there is no such thing as a "directory" on the web, they also don't have directory indicators (e.g. the training slash).

Therefore, after integrating this into a flexible web platform (e.g. Node.JS/Express, or Django for the Python port of this project), a uer could access something like the following:

    https://example.org/course/billy/continualregressionanalysis

Selectors can also be explicitly set by prefixing text with double equals (==). For example, consider the following:

    james==king/Topological Analysis;mathematics.txt

The selector of this is `king/topologicalanalysis`.

This mechanism allows you to sort and seek (e.g. pressing `j` to go to `james`) in your file explorer. The alternative way for writing this is `{james }king`, but this doesn't preserve the ease-of-access in file explorer.

While the selector is the full entity (e.g. billy/continualregressionanalysis), a `branch selector` is everything in front of the final segment (e.g. `billy`).

### Titles

The title of the document also comes from the filename. The title of the previous document would be the following:

    The Importance of Continual Regression Analysis

Filenames should be design around the filename with exception codes and metadata added subsequently.

There are also branch titles.

Consider again the following example:

    billy {_of=chicago}/{The Importance of} Continual Regression Analysis;mathematics.txt

The branch title of this would be the following:

    Billy of Chicago

When viewing a label on a website, this could be the page title.

### Casing

Filenames are case-sensitive. The case you set is the case the file will have. However, not every tool will respect this. Also, though Windows retains case in many cases, it's horribly inconsistent. Filenames in Windows are not treated as technical entities, they are incorrectly treated as human-readable labels. To get around alternation by tools and this Windows design flaw, `etitle` allows you to be very explicit about your casing.

In our example, the name of the document's author is in the filename as the following:

    billy {_of=chicago}

`etitle` renders this as the following:

    Billy of Chicago

The underscore (_) explicitly forces lowercase. The equals (=) explicitly forces uppercase.

By default, titles start with uppercase.

### Labels

Every modern content system has a concept of labels / tags (hereafter "labels").

`etitle` provides a few different ways of adding label metadata. The most explicit is with a series of semicolons like in the following example:

    {=s.=b. }smith/lectures/{On the }2nd Person;2nd=person;mathematics;psychology.txt

This would have the following labels:
    
    'smith', '2ndperson', 'mathematics', 'psychology'

There are four (4) different label modes. These modes tell `etitle` how to find the labels.

#### root (default)

This is the default. This treats root (the first) selector segment as a label.

This allows for easy categorization to reflect your original filesystem organization structure.

Example:

    john/biology/title;chemistry.txt -> john, chemistry

#### each

This treats each selector segment as a label.

This mode is helpful is you have subcategories. One use case currently in use is for the root to be an author and the second segment to be a book title. Both the author and the title are labels.

Example:

    john/biology/title;chemistry.txt -> john, biology, chemistry

#### branch

This treats the `branch selector` as a label.

The use case for this is similar to `each`, but it's more explicit. One use case for this is blogging. `2017/01/myblogentry` may be a selector (e.g. your URL path), but `2017/01` may be a label for your label cloud.

Example:

    john/biology/title;chemistry.txt -> john/biology, chemistry

#### explicit

This only uses explicitly set labels as labels. The root is not added into the mix, completely decoupling  labels from your physical folder structure.

Example:

    john/biology/title;chemistry.txt -> chemistry

### Hyphens

Hyphens are taboo in modern websites, but changing a URL is worst. Therefore, to retain backward compatibility, there's a `allowHyphensInSelector` option (options are discussed in `usage`). This will tell the engine to *not* strip out hyphens when creating the selector.

### Special Characters

Special characters can be used in titles with special character codes. For example, consider the following example:

    billy {_of=chicago}/Section 5{%colon%}10{%colon% Behavior for }Introspection.txt

The title for this is as follows:

    Section 5:10: Behavior for Introspection

Though a colon is not allowed in the filename, we can still have it in the title.

Here's a full set of special character codes:

    %questionmark%
    %colon%
    %quotes%
    %slash%
    %blackslash%
 

### .titles for existing data

For existing data, you have neither the time nor the inclination to go through the aforementioned formatting for existing content. Your data already has titles and associated URLs. This is where `etitle`'s concept of the `.titles` helps.

The `.titles` file is a simple key/value file that specifies selectors and titles in a selector/title format. It's placed either in the root of the dataset or in any subfolder. For example, for the path `/usr/cms/uni/`, the `.titles` file is `/usr/cms/uni/.title`. The root dataset is always used, but the folder dataset can add and override titles.

Consider the following line from one website's `.titles` file:

    2007/08/Minima-NET-35-Blog-Engine, Minima .NET 3.5 Blog Engine (a.k.a. Minima 2.0)

This signifies that `2007/08/minima-net-35-blog-engine` will have a title of "Minima .NET 3.5 Blog Engine (a.k.a. Minima 2.0)".

In this particular case, files before 2008 (when `etitle` was originally built, on .NET) were exported using the selectors specified by the former blog engine ([Minima](http://minima.codeplex.com/) in this case). The filename created during the export was "2007/08/minima-net-35-blog-engine;projects.txt". The `.titles` file was given the key (which `etitle` would figure out on its own) and the title also exported.

Files with selectors not in the `.titles` files will be treated normally.

### .titles for new data

The `.titles` file can also be used to store titles for individual files. To do this, you set the title of your document to $, then store the selector / title in the `.titles`. One easy way to set the title to $ is the use the following pattern in your file name:

    $ - selector.txt

For example:

    $ - resume.txt

That is, "dollarsign space hyphen space selector".

The following would be either in your root or relative `.titles` files:

    resume, Curriculum Vitae

Your selector is `resume` and your title is "Curriculum Vitae".

## Manual titles

You can also provide title data using the `titleData` property of `options`. See usage for details. 

## Usage

First,

    const etitle = require('etitle');

There are two core functions. The signatures are:
    
* `[selector, branch, title, branch_title, labels] etitle.parse(filename, fileroot, options)`

* `[selector, branch, title, branch_title, labels] etitle.parseUsingTitleDataSync(filename, fileroot, options)`

* `[Promise] etitle.parseUsingTitleData(filename, fileroot, options)`

The syntax of the first is fairly simple:

    let [selector, branch, title, branch_title, labels] = etitle.parse(filename, fileroot, options)

The second is like the first, but also looks for title data (`.titles`)

    let [selector, branch, title, branch_title, labels] = etitle.parseUsingTitleDataSync(filename, fileroot, options)

The third is uses a Promise. Therefore, your usage is the following:

        etitle.parseUsingTitleData(filename, fileroot, options)
            .then(v => {
                let [selector, branch, title, branch_title, labels] =  = v;
            })
            .catch(err => { throw err; });

The `fileroot` is the base of all your files. When doing an iterative filesystem scan, this would be your starting point.

`options` can include the following:

* `allowHyphensInSelector`: boolean

* `labelMode`: can be 'root', 'each', 'branch, 'manual'

* `keepDot`: if true, dots will be kept in the selector; this comes in handy when sharing files (e.g. configure.sh)

* `titleData`: this is an array of key/value objects which can manually override titles; if set, titles are not searched for, even if the title functions are used. This enables scenarios where external titles might be needed, but disabling won't require code changes. Effectively, setting `titleData` to [] will disable the title search.

### createSelector

Though the above functions are the primary entry points, the internally used `createSelector` function has also been exported.

This function creates a key from a path and has myriad use cases. For example, a simply find/replace from / to _ will make a legal Azure Table Storage key.

Signature:

    [selector] createSelector(path, allowHyphensInSelector, keepDot)

Consider the following:

    {=s.=b. }smith/lectures/{On the }2nd Person

This becomes the following:

    smith/lectures/2ndperson

## Examples

### Blog

Consider the following URL:

    https://netfxharmonics.com/2016/09/modulararm

The above url comes from the following file:

    E:\Drive\Documents\Content\NetFX\NetFXContent\2016\09\{Developing Azure }Modular ARM{ Templates};azure;powershell.md

The title is "Developing Azure Modular ARM Templates".

The labelMode is `branch`, therefore the labels are "2016/09", "azure", and "powershell".

### Shared Files

Consider the following URL:

    https://linux.azure.david.betz.space/mongodb/install

The above url comes from the following file:

    /home/dbetz/azure/armtemplates/mongodb/install.sh

The title is "mongodb/install.sh".

The labelMode is `root`, therefore the single label is "mongodb".

### User Text Content

Consider the following URL:

    https://ectypal.net/_/gaffin

For this site, `gaffin` represents a label.

The title for this page is:

    Richard Gaffin

The label `gaffin` and the title `Richard Gaffin` came from the following folder name:

    E:\Drive\Documents\Content\Ectypal\EctypalContent\richard==gaffin


Consider the following URL:

    https://ectypal.net/_/vanasselt

For this site, `vanasselt` represents a label.

The title for this page is:

    Willem van Asselt

The label `gaffin` and the title `Richard Gaffin` came from the following folder name:

    E:\Drive\Documents\Content\Ectypal\EctypalContent\{willem }_van=asselt

The author writes the `v` in his name `Willem van Asselt` as lowercase. The underscore (_) enforces this.
