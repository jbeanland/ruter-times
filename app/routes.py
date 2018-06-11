from flask import render_template, request
import json

from app import app
from app.utils import get_trains


@app.route('/', methods=['GET', 'POST'])
def main():
    print('this is the main page')

    return render_template('main.html', title='Landing')


@app.route('/train_times/', methods=['POST'])
def train_times():
    print('in train_times')
    trains = get_trains(request.form['stop_wanted'])
    return json.dumps(trains)


@app.route('/get_stops/')
def get_stops():
    print('getting stops')
    choices = [{'stop_id': v, 'stop': k} for k, v in app.config['STOPS'].items()]
    choices = sorted(choices, key=lambda k: k['stop_id'])
    print(json.dumps(choices[:5]))
    return json.dumps(choices)
