from datetime import datetime, timedelta
from math import floor
import requests
import pytz

from app import app


strf_format = '%Y-%m-%dT%H:%M'


# Return useful information about the upcoming departures from a station.
# Takes the raw json results from GET StopVisit/GetDepartures/
def format_train_times_results(r, minutes_in_results=30):
    trains = []
    now = datetime.now(pytz.timezone('Europe/Oslo'))
    # We don't want all trains, only the ones coming soon.
    cutoff = (datetime.now() + timedelta(seconds=minutes_in_results * 60)).strftime(strf_format)
    print(now, cutoff, 'new len(r): ', len(r))
    print([(x['MonitoredVehicleJourney']['MonitoredCall']['ExpectedDepartureTime'], x['MonitoredVehicleJourney']['MonitoredCall']['ExpectedDepartureTime'] < cutoff) for x in r])

    # Filter for only those within the cutoff number of minutes.
    r = [x for x in r if x['MonitoredVehicleJourney']['MonitoredCall']['ExpectedDepartureTime'] < cutoff]
    print('new len(r): ', len(r))
    for x in r:
        line_num = x['MonitoredVehicleJourney']['PublishedLineName']
        destination = x['MonitoredVehicleJourney']['DestinationName']
        platform = x['MonitoredVehicleJourney']['MonitoredCall']['DeparturePlatformName']
        time_of_departure = x['MonitoredVehicleJourney']['MonitoredCall']['ExpectedDepartureTime']
        t = datetime.strptime(time_of_departure.split('+')[0], "%Y-%m-%dT%H:%M:%S")
        # print(f'train: {line_num}, {destination}, {platform}, {time_of_departure}, {(t-now).days}')

        if (t - now).days >= 0:
            mins_till_train = floor((t - now).seconds / 60)
            if mins_till_train == 0:
                time_away = 'now'
            elif mins_till_train == 1:
                time_away = '1 minute away'
            else:
                time_away = f'{mins_till_train} minutes away'
            trains.append({'line_num': line_num,
                           'destination': destination,
                           'platform': platform,
                           'time_away': time_away})

    return trains


def get_trains(stop_wanted):
    q = f"https://reisapi.ruter.no/StopVisit/GetDepartures/{stop_wanted}"
    r = requests.get(q)
    if r.status_code == 200:
        k = r.json()
        print('in get_trains\n')
        train_times = format_train_times_results(k)
        return {'result': train_times,
                'request_info': {'status_code': 200,
                                 'time_of_request': datetime.now().strftime(strf_format),
                                 },
                'stop_info': {'stop_id': stop_wanted,
                              'stop_name': app.config['STOPS_REV'][int(stop_wanted)],
                              'platforms': sorted(list(set([x['platform'] for x in train_times]))),
                              }
                }
        return train_times
    else:
        return {'request_info': {'status_code': 400
                                 }
                }
