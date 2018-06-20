import requests


def get_stops():
    r = requests.get('https://reisapi.ruter.no/Line/GetLinesRuterExtended?ruterOperatedOnly=true')
    j = r.json()
    ss = [x['Stops'] for x in j if (x['Transportation'] == 2 or x['Transportation'] == 8)]
    stops = dict()
    for i in ss:
        for j in i:
            stops[j['Id']] = j['Name']
    return stops


class Config(object):

    STOPS = get_stops()
