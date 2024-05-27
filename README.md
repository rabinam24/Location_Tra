# InternShip
## About
Location tracker
## Instructions for Project Run and Configuration
* Firstly clone the Repository or Download the Source Code of this Repo from Github
## a) Setup for the Flask Server
* cd backend
* install virtual environment using:```python -m venv .venv```
* Activate the virtual environment using:```.venv/Scripts/Activate```(for Windows Users) or ```source .venv/bin/activate```(for MacOS Users) 
* install packages using:```pip3 install -r requirements.txt``` or ```pip install -r requirements.txt```
* Run:```flask --app main run``` to run the main.py file in flask
## b) Setup for Node Server
* cd frontend
* install dependencies using: ```npm install --force```
* run the project using ```npm run dev``` to start the node server
## For running the Main Application : Location Tracker
* navigate to the main project directory or root directory of project
* install dependencies using : ```npm install``` or ```npm i```
* run the project using npm run start
* it is always recommended to start the Flask Server before Node Server
## For Serving React Static Files in Flask
* In **package.json** file of **frontend** directory which contains code for React appliacation, add the following configuation:
```
{
  "proxy": "http://localhost:5000"
}
```
* To deploy combined React and Flask application, run this command: ```npm run build``` 
* In the **main.py** of **backend** directory which contains code for Flask appliation, add the following:
```
from flask import send_file

@app.route('/static/<path:path>')
def serve_static(path):
    return send_file(f'build/{path}')
``` 
* make sure to place this route after other routes in **app.py** of backend folder

## `NodeJS` version Used: v20.12.2
## `Flask` verion Used: v3.0.3
## for avoiding Version and Dependecy conflict in this appliacation, set Dependabot alert in Github Repository, Use Docker for Application Dockerization
> The quieter you become, the more you are able to hear