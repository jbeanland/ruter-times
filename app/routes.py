from flask import render_template, request
import json

from app import app
from app.utils import get_trains


@app.route('/', methods=['GET', 'POST'])
def main():
    return render_template('main.html', title='Landing')


@app.route('/GET/times/', methods=['POST'])
def train_times():
    trains = get_trains(int(request.form['stop_wanted']))
    return json.dumps(trains)


@app.route('/GET/stops/')
def get_stops():
    return json.dumps(app.config['STOPS'])
