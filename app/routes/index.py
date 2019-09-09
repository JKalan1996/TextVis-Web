import json
import os

from app import app
from flask import Flask, request
from analyzer import search

debug = False

allVedio = json.load(open('fpath', 'r'))


@app.route('/')
def root():
	return app.send_static_file('index.html')


@app.route('/data/<parameter>')
def _data(parameter):
	# data preprocessing
	parameter = json.load(parameter)
	result = search(parameter,allVedio)
	
	return json.dumps(result)
