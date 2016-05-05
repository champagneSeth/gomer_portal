var tree        = require('./decisionTree.js')
,   fs          = require('fs')
,   readline    = require('readline')
,   http        = require('http')
,   express     = require('express')
,   bodyParser  = require('body-parser')
,   app         = express()
,   router      = express.Router()  
,   port        = process.env.PORT || 9000
,   server      = http.createServer(app)
,   unclass     = 'unclassified.csv'
;


function appendToCSV(data, fileName) {
    var newEntry = '', comma = '';
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            newEntry += comma + data[key];
            comma = ',';
        }
    }
    fs.appendFile(fileName, newEntry + '\n', function (err) {
        if (err) console.log('[ server ] Error appending to file: ' + err);
    });
}

router.get('/', function (req, res) {
    console.log('[ server ] Index page requested');
    res.status(200).sendFile(__dirname + '/public/index.html');
});

router.get('/patient', function (req, res) {
    console.log('[ server ] Patient form requested');
    res.status(200).sendFile(__dirname + '/public/sheet1.html');
});

router.get('/doctor', function (req, res) {
    console.log('[ server ] Doctor form requested');
    res.status(200).sendFile(__dirname + '/public/form.html');
});


// Add new patient to unclassified and return the decision from the tree
router.post('/api/patient', function (req, res) {
    console.log('[ server ] New patient entry');

    console.log(req.body);
    appendToCSV(req.body, unclass);

    tree.traverse(req.body, function (result) {
        res.status(200).json({ 
            success : true
        ,   result  : result 
        });
    });
});

// Get list of patients from unclassified file
router.get('/api/getPatients', function (req, res) {
    console.log('[ server ] Sending unclassified patients')

    var attrs, patients = [];
    var rd = readline.createInterface({
        input : fs.createReadStream(unclass)
    });

    rd.on('line', function(line) {
        if (!attrs) {
            attrs = line.split(',');
            return;   
        }
        var patient = {};
        line.split(',').forEach(function (val, i) {
            patient[attrs[i]] = val;
        });
        patients.push(patient);
    });

    rd.on('close', function() {
        res.status(200).json({
            patients : patients
        });
    });
});

// Manually classify a patient and update the decision tree
router.post('/api/doctor', function (req, res) {
    console.log('[ server ] Patient classified');

    var newEntry = '', comma = '';
    req.body.patients.forEach(function (patient) {
        appendToCSV(patient, tree.csvFile);
    });

    fs.writeFileSync(unclass, 'temp,sight,cough,hearing,bleeding,conscious,vomit,pulse,blood,pupil,breathing\n');

    tree.update();
    res.sendStatus(200);
});


app.use(bodyParser.urlencoded({
    extended : true
}));

app.use(express.static(__dirname + '/public'));
app.use('/', router);

server.listen(port);
console.log('Magic happens on port ' + port + '\n');
