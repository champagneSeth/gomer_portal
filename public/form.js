
// temp,sight,cough,hearing,bleeding,conscious,vomit,pulse,blood,pupil,breathing,GOAL
var patients = [];
var dialog;

$(function () {
    $.ajax({
        url : '/api/getPatients'
    }).done(function (data) {
        patients = data.patients;
        console.log(patients);
        patients.forEach(buildPatientDiv);
    });

    dialog = $('#dialog').dialog({
        autoOpen: false
    ,   height  : 450
    ,   width   : 350
    ,   modal   : true
    ,   buttons : {
            Close: function() {
                dialog.dialog('close');
            }
        }
    });
});


$('#submit-btn').on('click', function () {
    $.ajax({
        url     : '/api/doctor'
    ,   type    : 'POST'
    ,   data    : {
        patients : patients
    }
    }).done(function () {
        location.pathname = '';
    });
});


// <div class="go_right" align="right">
//     <button type="button">Patient ID-1</button>
//     <button type="button" class="btn btn-danger btn-sm">
//         <span class="glyphicon glyphicon-ok"></span> Yes
//     </button>
//     <button type="button" class="btn btn-success btn-sm">
//         <span class="glyphicon glyphicon-remove"></span> No
//     </button>
// </div>
function buildPatientDiv(patient, i) {
    var div     = $('<div>')
    ,   butt    = $('<button>')
    ,   yes     = $('<button>')
    ,   no      = $('<button>')
    ;

    patient['GOAL'] = 'n'; // Default all patients to no

    yes.attr({
        type    : 'button'
    ,   class   : 'btn btn-danger btn-sm'
    }).append($('<span>').attr({
        class : 'glyphicon glyphicon-ok'
    })).append(' Yes');
    yes.on('click', function () {
        patients[i]['GOAL'] = 'y';
    });

    no.attr({
        type    : 'button'
    ,   class   : 'btn btn-success btn-sm'
    }).append($('<span>').attr({
        class : 'glyphicon glyphicon-remove'
    })).append(' No');
    no.on('click', function () {
        patients[i]['GOAL'] = 'n';
    });

    butt.attr({
        type : 'button'
    }).text('Patient ID-' + i);
    butt.on('click', function (e) {
        $('#symptoms').html('');
        for (var key in patient) {
            if (patient.hasOwnProperty(key)) {
                $('#symptoms').append($('<p>')
                    .text(key + ' : ' + patient[key]));
            }
        }
        dialog.dialog('open');
    });
    
    div.attr({
        class : 'go_right'
    ,   align : 'right'
    })
    .append(butt)
    .append(yes)
    .append(no);

    $('#patients').append(div);
}
