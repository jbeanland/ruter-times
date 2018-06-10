from flask import render_template, request
# from application.forms import StopForm

from app import app
from app.utils import get_trains
from app.forms import StopForm


@app.route('/', methods=['GET', 'POST'])
def main():
    print('this is the main page')
    print(app.config['LIST_OF_STOPS'][:5])
    form = StopForm()
    # if form.validate_on_submit():
    #     print('form validated')

    return render_template('main.html', title='Landing', stops=app.config['LIST_OF_STOPS'], form=form)


@app.route('/train_times/', methods=['POST'])
def train_times():
    print('in train_times')
    trains = get_trains(request.form['stop_wanted'])
    return str(trains[0])
