var last_update = null

// create a table in a card for a given platform at a station
function get_card(platform, platform_full) {
    return `
        <div class="col-lg-4 col-md-6 col-xs-12">
            <div class="card mb-4 shadow rounded border border-dark">
                <div class='card-header'>
                    <p class="lead m-0">
                        Platform ${platform_full}
                    </p>
                </div>
                <div class='card-body'>
                    <table id='${platform}' class="table">
                      <thead class='thead-dark'>
                        <tr>
                          <th>Line</th>
                          <th>Destination</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                      </tbody>
                    </table>
                </div>
            </div>
        </div>
    `
}


// Add a row to a table
function get_row(line_num, destination, time_to_train) {
    return `
    <tr>
      <td>${line_num}</td>
      <td>${destination}</td>
      <td>${time_to_train}</td>
    </tr>
    `
}

// Add a button for a favourite stop
function add_favourite (stop_id, stop_name) {
    return `

    <button id='fav-button-${stop_id}' class='dropdown-item btn btn-secondary'>${stop_name}</button>
    `
}

// Show either add or remove favourite, depending on current stop
function get_correct_fav_button() {
    var stop_id = $('#select-stop').val();
    var selector = '#fav-button-' + stop_id;

    if ($(selector).length) {
        $('#set-favourite-button').addClass('d-none')
        $('#remove-favourite-button').removeClass(' d-none')

    } else {
        $('#set-favourite-button').removeClass('d-none')
        $('#remove-favourite-button').addClass(' d-none')
    }

}


function get_time_since_update() {
    var seconds = Math.floor((new Date() - last_update) / 1000);

    diff = Math.floor(seconds / 86400);
    if (diff > 1) {
        return diff + ' days  ago'
    }

    diff = Math.floor(seconds / 3600);
    if (diff > 1) {
        return diff + ' hours  ago';
    }

    diff = Math.floor(seconds / 60);
    if (diff > 1) {
        return diff + ' minutes  ago';
    }

    return 'within the last minute';
}


var format_time = function () {
    if (Object.prototype.toString.call(last_update) === "[object Date]") {
        var time_str = get_time_since_update()
    } else {
        var time_str = 'Never'
    }

    $('#time-since-update').text(time_str);

}


$(function() {

    // Get Train time data from stop_id
    function fill_data(stop_id) {
        $.post('/train_times/', {
            stop_wanted: stop_id
        }).done(function(data) {
            // parse new data as JSON
            data = JSON.parse(data);
            $('#results').empty();
            var platforms = data.stop_info.platforms;
            var trains = data.result;

            // Add Platform tables
            $.each(platforms, function (i, item) {
                var platform = "platform-" + item.split(' ')[0];
                $('#results').append(get_card(platform, item));
            })

            // Add data to appropriate platform table
            $.each(data.result, function (i, item) {
                var platform = "#platform-" + item.platform.split(' ')[0];
                $(platform).append(get_row(item.line_num, item.destination, item.time_away));
            })

            // if currently a favourite, button removes it as fav, else, adds as fav
            get_correct_fav_button();

            last_update = new Date();

        })
    }

    // Get current list of favourites and create buttons
    function get_favourites() {
        biggerdata = []
        $.getJSON('/get_favourites/', function (data) {
            $('#favourites').empty()
            $.each(data, function(i, item) {
                $('#favourites').append(add_favourite(item.stop_id, item.stop_name))
            })
        })
    }

    // when fav button clicked, update data
    $('#favourites').on('click', '.btn', function () {
        stop_id = this.id.split('-')[2]
        $('#select-stop').val(stop_id)
        fill_data(stop_id)

    })

    // add to favourites and add button
    $('#set-favourite-button').on('click', function () {
        stop_id = $('#select-stop').val()
        $.post('/set_favourite/', {
            stop_id: stop_id
        }).done( function (data) {
            data = JSON.parse(data)
            $('#favourites').append(add_favourite(data.stop_id, data.stop_name))
            get_correct_fav_button()
        });
    })

    // update favourited and remove button
    $('#remove-favourite-button').on('click', function () {
        stop_id = $('#select-stop').val();
        var selector = '#fav-button-' + stop_id
        $(selector).remove();
        $.post('/remove_favourite/', {
            stop_id: stop_id
        }).done( function () {
            get_correct_fav_button()
        })

    })

    // change data
    $('#select-stop').on('change', function () {
        fill_data(this.value)
    })

    // refresh data on button click
    $('#refresh-button').on('click', function () {
        var stop_id = $('#select-stop').val();
        fill_data(stop_id);
    })


    // on startup, get list of stops, favourites, correct button
    $(document).ready(function () {
        let dropdown = $('#select-stop');
        var listitems = ''
        $.getJSON('/get_stops/', function (data) {
            $.each(data, function (i, item) {
                listitem = '<option value=' + item.stop_id + '>' + item.stop + '</option>'
                listitems += listitem
            });
            $(dropdown).append(listitems)
        })

        get_favourites()
        get_correct_fav_button()
    })
});

setInterval(format_time, 1000);
