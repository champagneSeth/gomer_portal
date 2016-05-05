var spawn       = require('child_process').spawn
,   fs          = require('fs')
,   classify    = 'classified.csv'
,   pyScript    = 'decision_tree_learning.py'
,   tree        = {}
;

module.exports = {
    traverse    : traverseTree
,   update      : learnTree 
,   csvFile     : classify
}

learnTree();

// Rerun the python script and recieve the new tree as json
function learnTree() {
    ps = spawn('python', [pyScript, classify]);

    ps.stdout.on('data', function(data) {
        console.log(data.toString());
        fs.writeFileSync('tree.json', data.toString());
        console.log('Tree has updated')
        tree = JSON.parse(data.toString().trim());
    });

    ps.on('close', function (code) {
        console.log('Python script exited with code ' + code);
    });
}

// Travers the tree based on an example
function traverseTree(data, callBack) {
    var result = '';
    var goDeeper = function (branch) {
        for (var key in branch) {
            if (branch.hasOwnProperty(key) && !result) {
                if (typeof branch[key] === 'string') {
                    result = branch[key];
                    return;
                } else {
                    goDeeper(branch[key][data[key]]);
                }
            }
        }
    }
    goDeeper(tree);
    callBack(result);
}
