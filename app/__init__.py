from flask import Flask
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
# print(Config.LIST_OF_STOPS)
# print(app.config['LIST_OF_STOPS'])

from app import routes
