import requests


class Config(object):

    def get_stops():
        r = requests.get('https://reisapi.ruter.no/Line/GetLinesRuterExtended?ruterOperatedOnly=true')
        j = r.json()
        ss = [x['Stops'] for x in j if (x['Transportation'] == 2 or x['Transportation'] == 8)]
        stops = dict()
        for i in ss:
            for j in i:
                stops[j['Id']] = j['Name']
        print(f'{len(stops)} bus stops')
        return stops

    STOPS = get_stops()
