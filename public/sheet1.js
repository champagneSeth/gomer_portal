$('#result').hide();

$("#symptoms").submit(function (e) {
    e.preventDefault();

    $.ajax({
        url     : '/api/patient'
    ,   type    : 'POST'
    ,   data    : $(this).serialize()

    }).done(function (data) {
        console.log(data.result);
        $('#result').show();
        if (data.result === 'y') {
            $('#woo').text('Yes');
        } else if (data.result === 'n') {
            $('#woo').text('No');
        } else {
            $('#woo').text('Unknown');
        }
    });
});
