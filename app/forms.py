from flask import current_app
from flask_wtf import FlaskForm
from wtforms import SubmitField, SelectField

from app import app


class StopForm(FlaskForm):
    with app.app_context():
        choices = [(v, k) for k, v in app.config['STOPS'].items()]
    choices = sorted(choices, key=lambda tup: tup[1])
    print(f'choices[:5]: {choices[:5]}')
    stop = SelectField(u'Field name', choices=choices)
    submit = SubmitField()
