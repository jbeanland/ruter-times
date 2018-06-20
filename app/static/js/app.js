var allstops = null;


$(function() {

var last_update = null;
var stops = null;
var stops_arr = [];
var current_stop = {'stop_id': 0, 'stop_name': ''};


// create a table in a card for a given platform at a station
function get_card(platform, platform_full) {
    return `
        <div class="col-xl-4 col-lg-6 col-md-6 col-sm-12 col-xs-12 p-1">
            <div class="card mb-4 shadow rounded border border-dark">
                <div class='card-header'>
                    <p class="lead m-0"  style="text-align:center">
                        Platform ${platform_full}
                    </p>
                </div>
                <div class='card-body p-2'>
                    <div class="card m-0">
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
    var stop_id = current_stop.stop_id;
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



    // Get Train time data from stop_id
    function fill_data() {
        var stop_id = current_stop.stop_id
        $.post('/GET/times/', {
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



            $('#text-entry').attr("placeholder", current_stop.stop_name);
            $('#text-entry').val('');

        })
    }

    // Get current list of favourites and create buttons
    function get_favourites() {
        favs = []

        if (localStorage.getItem('fav')) {
            favourites = localStorage.getItem('fav').split(',')
        } else {
            favourites = []
        }

        for (i in favourites) {
            favs.push( {'stop_id' : favourites[i], 'stop_name': stops[favourites[i]]} )
        }
        $.each(favs, function(i, item) {
            $('#favourites').append(add_favourite(item.stop_id, item.stop_name))
        })
    }

    // when fav button clicked, update data
    $('#favourites').on('click', '.btn', function () {
        stop_id = this.id.split('-')[2]
        id_ = this.id;
        stop_name = $(this).text();

        current_stop = {'stop_id': stop_id, 'stop_name': stop_name};



        // $('#select-stop').val(stop_id)
        $('#text-entry').val(stops[stop_id])
        fill_data()

    })

    // add to favourites and add button
    $('#set-favourite-button').on('click', function () {
        var stop_id = current_stop.stop_id;
        if (localStorage.getItem('fav')) {
            var favs = localStorage.getItem('fav') + ',' + stop_id
        } else {
            var favs = String(stop_id)
        };
        localStorage.setItem('fav', favs);

        $('#favourites').append(add_favourite(stop_id, stops[stop_id]))
        get_correct_fav_button()
    })

    // update favourited and remove button
    $('#remove-favourite-button').on('click', function () {
        stop_id = current_stop.stop_id;

        if (localStorage.getItem('fav')) {
            var favs = localStorage.getItem('fav').split(',')
        } else {
            var favs = []
        };

        ind = favs.indexOf(stop_id)
        if (ind >= 0) {
            favs.splice(ind, 1)
            favs = favs.join(',')
            localStorage.setItem('fav', favs)
        };

        var selector = '#fav-button-' + stop_id
        $(selector).remove();
        get_correct_fav_button();

    })

    // refresh data on button click
    $('#refresh-button').on('click', function () {
        fill_data();
    })

    function fillStopData(data) {
        data_list = []
        for (var k in data) {
            data_list.push({'value': k, 'label': data[k]})
        }
        data_list.sort(function(a, b) {
            return a['label'].localeCompare(b['label']);
        });

        stops = data;
        stops_arr = data_list;


    }


    // on startup, get list of stops, favourites, correct button
    $(document).ready(function () {
        let dropdown = $('#select-stop');
        var listitems = '';
        var s = {};
        var s_list = [];

        if (localStorage.getItem('stops')) {
            data = JSON.parse(localStorage.getItem('stops'));
            // refresh memory if still only have tube stops
            if (Object.keys(data).length < 200) {
                $.getJSON('/GET/stops/', function (data) {
                    localStorage.setItem('stops', JSON.stringify(data));
                    fillStopData(data);
                    get_favourites();
                    get_correct_fav_button();

                })
            } else {
                fillStopData(data);
                get_favourites();
                get_correct_fav_button();
            }
        } else {
            $.getJSON('/GET/stops/', function (data) {
                localStorage.setItem('stops', JSON.stringify(data));
                fillStopData(data);
                get_favourites();
                get_correct_fav_button();

            })
        };

    });

    var accentMap = {
          "á": "a",
          "ö": "o",
          "ť": "t",
          "ø": "o",
          "Ø": "o",
          "æ": "ae",
          "Æ": "ae",
          "å": "a",
          "Å": "a"
          // ADD MORE HERE
        };

    var normalize = function( term ) {
          var ret = "";
          for ( var i = 0; i < term.length; i++ ) {
            ret += accentMap[ term.charAt(i) ] || term.charAt(i);
          }
          return ret;
        }


 $("#text-entry").autocomplete({
    source: function( request, response ) {
        var matcher = new RegExp( $.ui.autocomplete.escapeRegex( request.term ), "i" );
        response($.grep(stops_arr, function(value) {
            return matcher.test(value.label) || matcher.test(normalize(value.label));
            })
        );
    },select: function(event, ui) {
        event.preventDefault();
        $("#text-entry").val(ui.item.label);
        current_stop = {'stop_id': ui.item.value, 'stop_name': ui.item.label};
        fill_data();
    },
    focus: function(event, ui) {
        event.preventDefault();
        $("#text-entry").val(ui.item.label);
    }
});

setInterval(format_time, 1000);
});

