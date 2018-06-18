import requests


class Config(object):

    def get_stops():
        stops = dict()
        for i in range(1, 6):
            r = requests.get(f'https://reisapi.ruter.no/Line/GetStopsByLineID/{i}')
            k = r.json()
            s = [x['Name'].split('[')[0].strip() for x in k]
            id_ = [x['ID'] for x in k]
            sid = dict(zip(id_, s))
            stops = {**stops, **sid}
        return stops

    STOPS = get_stops()
