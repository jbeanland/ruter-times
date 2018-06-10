import requests


class Config(object):

    def get_stops():
        stops = dict()
        for i in range(1, 6):
            r = requests.get(f'https://reisapi.ruter.no/Line/GetStopsByLineID/{i}')
            k = r.json()
            s = [x['Name'].strip(' [T-bane]') for x in k]
            id_ = [x['ID'] for x in k]
            sid = dict(zip(s, id_))
            stops = {**stops, **sid}
        list_of_stops = sorted(list(set(stops)))
        return stops, list_of_stops

    STOPS, LIST_OF_STOPS = get_stops()
    SECRET_KEY = 'a-terrible-secret-key'
