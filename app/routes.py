from flask import render_template, request, current_app, redirect
import json

from app import app
from app.utils import get_trains


@app.route('/', methods=['GET', 'POST'])
def main():
    return render_template('main.html', title='Landing')


@app.route('/train_times/', methods=['POST'])
def train_times():
    trains = get_trains(int(request.form['stop_wanted']))
    return json.dumps(trains)


@app.route('/get_stops/')
def get_stops():
    choices = [{'stop_id': v, 'stop': k} for k, v in app.config['STOPS'].items()]
    choices = sorted(choices, key=lambda k: k['stop'])
    return json.dumps(app.config['STOPS_REV'])


@app.route('/get_favourites/')
def get_favourites():
    favs = request.cookies.get('user_favourite', '')
    if favs != '':
        favs = request.cookies['user_favourite']
        favs = favs.split(',')
        favs = [{'stop_id': s, 'stop_name': app.config['STOPS_REV'][int(s)]} for s in favs]
    else:
        favs = []
    return json.dumps(favs)


@app.route('/set_favourite/', methods=['POST'])
def set_favourite():
    new_favourite = request.form['stop_id']
    stop_name = app.config['STOPS_REV'][int(new_favourite)]
    response = current_app.make_response(json.dumps({'stop_id': int(new_favourite), 'stop_name': stop_name}))

    favs = request.cookies.get('user_favourite', '')
    if favs != '':
        favs = ",".join([favs, new_favourite])
    else:
        favs = new_favourite
    response.set_cookie('user_favourite', value=favs)

    # print(json.dumps({'stop_id': int(new_favourite), 'stop_name': stop_name}))
    return response


@app.route('/remove_favourite/', methods=['POST'])
def remove_favourite():
    stop_id = request.form['stop_id']
    response = current_app.make_response(redirect('/'))
    try:
        existing = request.cookies['user_favourite'].split(',')
        existing.remove(stop_id)
        if len(existing) == 0:
            existing = ''
        else:
            existing = ','.join(existing)
    except (ValueError, AttributeError):
        existing = ''
    response.set_cookie('user_favourite', value=existing)
    return response
