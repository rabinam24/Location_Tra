# from flask import Flask
from flask import Blueprint
import base64
from PIL import Image
# from collections import OrderedDict
from collections import OrderedDict
import secrets
from flask_jwt_extended import JWTManager,jwt_required,create_access_token,get_jwt_identity
from flask import Flask, request, jsonify
from datetime import datetime

from flask_cors import CORS
# from models import UserForm, db

from wtforms import Form,StringField,FloatField,FileField

from werkzeug.utils import secure_filename
import os
import logging
from functools import wraps

# from config import db
app = Flask(__name__)
# from flask_sqlalchemy import SQLAlchemy
# from flask import Flask
# from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mydatabase.db'  # Change as needed
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)
# Association table for many-to-many relationship between TravelLog and TravelLogDocument
travel_log_document_association = db.Table(
    'travel_log_document_association',
    db.Column('travel_log_id', db.Integer, db.ForeignKey('travel_log.id'), primary_key=True),
    db.Column('travel_log_document_id', db.Integer, db.ForeignKey('travel_log_document.id'), primary_key=True)
)

class TripInfo(db.Model):
    __tablename__ = 'trip_info'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    start_at = db.Column(db.DateTime, nullable=False)
    from_gps = db.Column(db.String(50), nullable=False)
    end_at = db.Column(db.DateTime, nullable=False)
    distance = db.Column(db.Float, nullable=False)
    
    # Define one-to-one relationship with TravelLog
    travel_log = db.relationship('TravelLog', uselist=False, backref='trip_info', lazy=True)

class TravelLog(db.Model):
    __tablename__ = 'travel_log'
    
    id = db.Column(db.Integer, primary_key=True)
    trip_info_id = db.Column(db.Integer, db.ForeignKey('trip_info.id'), unique=True, nullable=False)
    gps = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    available_isp = db.Column(db.String(100), nullable=False)
    ground_station = db.Column(db.String(100), nullable=False)
    pole_station = db.Column(db.String(100), nullable=False)
    wire_stretch = db.Column(db.String(100), nullable=False)
    attached_pole = db.Column(db.String(100), nullable=False)
    
    # Define one-to-many relationship with TravelLogDetail
    travel_log_details = db.relationship('TravelLogDetail', backref='travel_log', lazy=True)

    # Define many-to-many relationship with TravelLogDocument
    travel_log_documents = db.relationship('TravelLogDocument', secondary=travel_log_document_association,
                                           backref=db.backref('travel_logs', lazy='dynamic'))

class TravelLogDetail(db.Model):
    __tablename__ = 'travel_log_detail'
    
    detail_id = db.Column(db.Integer, primary_key=True)
    travel_log_id = db.Column(db.Integer, db.ForeignKey('travel_log.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    port_count = db.Column(db.Integer, nullable=False)
    
    # Define many-to-one relationship with TravelLogDocument
    travel_log_document_id = db.Column(db.Integer, db.ForeignKey('travel_log_document.id'))
    travel_log_document = db.relationship('TravelLogDocument', backref='travel_log_details', lazy=True)

class TravelLogDocument(db.Model):
    __tablename__ = 'travel_log_document'
    
    id = db.Column(db.Integer, primary_key=True)
    document_path = db.Column(db.String(200), nullable=False)
    document_name = db.Column(db.String(100), nullable=False)

def basic_auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth:
            return jsonify({"message": "Authentication required"}), 401
        return f(*args, **kwargs, auth=auth)
        # if not auth or not (auth.username == 'admin' and auth.password == 'password'):
        #     return jsonify({"message": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/protected')
@basic_auth_required
def protected(auth):
    return jsonify({
        "message": "You have access to the protected route",
        "username": auth.username,
        "password": auth.password
    })

@app.route('/restricted')
@jwt_required()
def restricted():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username', None)
    password = request.json.get('password', None)

    if username != 'admin' or password != 'password':
        return jsonify({"msg": "Bad username or password"}), 401

    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token), 200





# app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///mydatabase.db"
# app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
# db =SQLAlCHEMY(app)
# db = SQLAlchemy()
# db.init_app(app)  #not needed when db is in the same file like main.py here
# db.init_app(app)
# Generate a JWT secret key
jwt_secret_key = secrets.token_hex(16)
app.config['JWT_SECRET_KEY'] = jwt_secret_key
jwt = JWTManager(app)
CORS(app)  # Enable CORS for all routes
# Mock Database
userData = {
    'id':1 ,# MockData primary key id
    'location':'nepalgunj'
}

# CORS(app, origins='http://localhost:5173')  # Allow requests only from http://localhost:5173
# import sqlite3
# db.create_all()
# Set up logging
if not os.path.exists('logs'):
    os.makedirs('logs')
logging.basicConfig(filename='logs/form_data.log', level=logging.INFO,
                    format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger()


from flask import send_file,send_from_directory
from werkzeug.utils import safe_join

class submitForm(Form):
    form_location = StringField('Location')
    form_latitude = FloatField('Latitude')
    form_longitude = FloatField('longitude')
    form_selectpole = StringField('SelectPole')
    form_selectpolestatus = StringField('SelectPoleStatus')
    form_selectlocation = StringField('SelectPoleLocation')
    form_description = StringField('Description')
    form_poleimage = FileField('selectpoleimage')

# class Student(db.Model):
#     roll = db.Column(db.Integer,primary_key=True)
#     name = db.Column(db.String(80))

# class Dummy(db.Model):
#     id = db.Column(db.Integer,primary_key=True)
#     dumb = db.Column(db.String(80))

def randomize():
    # Generate SQL code for creating tables
    sql_code = db.Model.metadata.create_all(bind=db.engine)
    print(sql_code)

@app.route('/')
def hello_world():
    directory = 'buildStaticReactVite'
    full_path = safe_join(directory,'hello')
    print(full_path)
    return 'Hello from backend!'

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'jpg', 'jpeg', 'png', 'gif'}


# if __name__ == '__main__':
#     app.run(debug=True)

# # Flask API to handle userform for the frontend react code

# app = Flask(__name__)
# @app.route('/')
# def hello_world():
#     return 'Hello from backend!'


# Configure database (replace with your configuration from config.py or environment variables)

# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:acharya@localhost/test'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# db.init_app(app)  # Initialize database
# print("Database initialized successfully")
app.config['UPLOAD_FOLDER'] = 'uploads'

# @app.route('/submit-user-form', methods=['POST'])
# @app.route('/form2',methods=['GET'])
# def form2():
#     data = request.args
    # try:
        # Get form data from request.form
        # location = request.form.get('location')
        # gpslocation = request.form.get('gpslocation')
        # selectpool = request.form.get('selectpool')
        # selectpoolstatus = request.form.get('selectpoolstatus')
        # selectpoollocation = request.form.get('selectpoollocation')
        # description = request.form.get('description')
        # poolimage = request.form.get('poolimage')  # Assuming image path is sent
        # availableisp = request.form.get('availableisp')
        # selectisp = request.form.get('selectisp')
        # multipleimages = request.form.get('multipleimages')  # Assuming comma-separated image paths
        # form_data = request.json

        # Validate and process data (optional)
        # ...

        # Create a new user form object
        # new_form = UserForm(
        #     location=location,
        #     gpslocation=gpslocation,
        #     selectpool=selectpool,
        #     selectpoolstatus=selectpoolstatus,
        #     selectpoollocation=selectpoollocation,
        #     description=description,
        #     poolimage=poolimage,
        #     availableisp=availableisp,
        #     selectisp=selectisp,
        #     multipleimages=multipleimages,
        # )
        #  new_form = UserForm(
        #     location=location,
        #     gpslocation=gpslocation,
        #     selectpool=selectpool,
        #     selectpoolstatus=selectpoolstatus,
        #     selectpoollocation=selectpoollocation,
        #     description=description,
        #     poolimage=poolimage,
        #     availableisp=availableisp,
        #     selectisp=selectisp,
        #     multipleimages=multipleimages,
        # )

        # Add the form to the database and commit changes
        # db.session.add(new_form)
        # db.session.commit()
        # return 'submit-form-data'

        # return jsonify({'message': 'User form submitted successfully'}), 201

    # except Exception as e:
    #     print(f"Error processing user form: {e}")
    #     return jsonify({'error': 'An error occurred'}), 500
    # return data

# @app.route('/bibash')
# def bibash():
#     return 'Bibash Acharya'


# @app.route('/form2',methods=['POST'])
# def form2():
#     data = request.json
#     return data


@app.route('/submit-user-form', methods=['GET', 'POST'])
def submit_user_form():
    if request.method == 'GET':
        data = request.args
        data2 = data.to_dict()
        data3 = {
            "empty": "nothing in here"
        }
        combined = {**data2,**data3}
        return jsonify(combined)
        # return jsonify(data)
        # location =  request.args.get('location')

        return data
   
    elif request.method == 'POST':
        # if db.app is not None:
        #     return jsonify({"Message":"Database has been initialized."})
        # else:
        #     return({"message":"Database has not been initialized."})
        form_data = request.form
        # form_data = request.json
        # files = request.files['poleimage']
        # files = request.files.getlist('poleimage')
        # test_data2= request.get_json()
        location = form_data.get('location')
        gpslocation = form_data.get('gpslocation').replace(" ","")
        print("Form Data:", form_data)
        # test1 = test_data2.get('location')
        # test2 = test_data2.get('gpslocation')
        # Validate GPS location format
        if gpslocation.count(',') != 1:
            return jsonify({"error": "GPS location must contain exactly two float values separated by a comma"}), 400
        print(location,gpslocation)
        print(type(gpslocation))
        latitude = gpslocation.split(',')[0]
        longitude = gpslocation.split(',')[1]
        print(latitude)
        print(longitude)
        # before typecasting
        print(type(latitude))
        print(type(longitude))
        try:
            latitude_float = float(latitude)
            longitude_float = float(longitude)
        except ValueError:
            return jsonify({"error": "Latitude and longitude must be float values"}), 400
        
        selectpole = form_data.get('selectpole')
        print(selectpole)
        selectpolestatus = form_data.get('selectpolestatus')
        print(selectpolestatus)
        selectpolelocation = form_data.get('selectpolelocation')
        print(selectpolelocation)
        description = form_data.get('description')
        print(description)
        availableisp = form_data.get('availableisp')
        print(availableisp)
        print(type(availableisp))
        saved_files = []
        
        if 'poleimage' in request.files:
            print("yes there is electricPole.jpg")
            print(type(request.files))
            print(type(request.files['poleimage']))
            poleimage = request.files['poleimage']
            filename = poleimage.filename
            content_type = poleimage.content_type
            print(filename,type(filename))
            print(content_type,type(content_type))
            directory = 'dummy'
            file_path = os.path.join(directory, filename)
            print(file_path)
            poleimage.save(file_path)
        else:
            print("no electricPOle.jpg")

        if availableisp.lower() == 'yes':
            selectisp = form_data.get('selectisp')
            ispimages = request.files.getlist('ispimages')
            for particular_isp in ispimages:
                ispfilename = particular_isp.filename
                main_dir = 'dummy'
                sub_dir = selectisp
                ispfilepath = os.path.join(main_dir,sub_dir)
                if not os.path.exists(ispfilepath):
                    os.makedirs(ispfilepath)
                ispfilefullpath = os.path.join(ispfilepath,ispfilename)
                print(ispfilefullpath)
                particular_isp.save(ispfilefullpath)
        elif availableisp.lower() == 'no':
            pass
        else:
            return jsonify({"error":"please enter only yes and no boolean values in availableisp"})
        
        form_data_log = request.form.to_dict()
        file_data_log = request.files.to_dict()
        m2 = request.files
        print("nothing in here",type(request.files))
        print("ok start")
        print(m2)
        print("to dickitng type")
        print(type(request.files.to_dict()))
        print("closed")
        print("after to dikcting")
        print(request.files.to_dict())
        # Log form data
        logger.info(f"Form data received: {form_data_log}")
        # Log file data (file names and content types)
        # print("outside the filelog ",type(file_data_log))
        # print("hello from log ")
        # print(file_data_log)
        # print("exit")
        # print("about to enter ",type(file_data_log.items()))
        # print("entering")
        # print(file_data_log.items())
        # print("exited")
        for filename_log, file_log in file_data_log.items():
            if availableisp.lower()=='yes':
                # print("inside yes: heheh huhuh",type(filename_log),type(file_log))
                # print(filename_log)
                # print("breaking bad")
                # print(file_log)
                # selectisp = form_data.get('selectisp')
                # ispimages = request.files.getlist('ispimages')
                # for particular_isp in ispimages:
                #     ispfilename = particular_isp.filename
                logger.info(f"File received: {filename_log} FilenameReceived:{file_log.filename} (content type: {file_log.content_type})")
            elif availableisp.lower()=='no':
                print("outside no")
                logger.info(f"File received: {filename_log} FilenameReceived:{None if str(filename_log)=='ispimages' else file_log.filename}) (content type: {file_log.content_type})")


        # Save the uploaded files
        # saved_files = []
        # if isinstance(files, list):
        #     for file in files:
        #         if file and allowed_file(file.filename):
        #             filename = secure_filename(file.filename)
        #             file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        #             file.save(file_path)
        #             saved_files.append(file_path)
        # else:
        #     # Handle the case where only one file is uploaded
        #     single_file = files
        #     if single_file and allowed_file(single_file.filename):
        #         filename = secure_filename(single_file.filename)
        #             file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        #             file.save(file_path)
        #             saved_files.append(file_path)
        
        # for file in files:
        #     if file and allowed_file(file.filename):
        #         filename = secure_filename(file.filename)
        #         file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        #         file.save(file_path)
        #         saved_files.append(file_path)
        # filename = "rgb.jpg"
        # directory = 'dummy'
        # img = Image.new('RGB', (100, 100), color = 'red')
        # file_path = os.path.join(directory, filename)
        # img.save(file_path)


        # Check if the Latitude and Longitude values are in between the Range for Nepal
        # The latitude and longitude range for Nepal is approximately:
        # Latitude: 26.3475° N to 30.4474° N
        # Longitude: 80.0580° E to 88.2015° E
        if not (26.3475 <= latitude_float <= 30.4474 and 80.0580 <= longitude_float <= 88.2015):
            return jsonify({"error": "Latitude and Longitude values must be within the range for Nepal"}), 400

        print(latitude_float)
        print(longitude_float)
        print(type(latitude_float))
        print(type(longitude_float))
        with open(file_path,'rb') as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            # print(encoded_string)
            # print(encoded_string)
        submit_location: str = location
        submit_latitude: float = latitude_float
        submit_longitude: float = longitude_float
        submit_selectpole: str = selectpole
        submit_selectpolestatus: str = selectpolestatus
        submit_selectpolelocation: str = selectpolelocation
        submit_description: str = description
        submit_poleimage: str = str(encoded_string)
        submit_poleimagename: str = str(filename)

        submit_data = {
            'location':submit_location,
            'latitude':submit_latitude,
            'longitude':submit_longitude,
            'selectpole':submit_selectpole,
            'selectpolestatus':submit_selectpolestatus,
            'selectpolelocation':submit_selectpolelocation,
            'description':submit_description,
            'poleimage':submit_poleimage,
            'poleimagename':submit_poleimagename
        }


        form_object = submitForm(data=submit_data)

        if form_object.validate():
            print("form submission successful")
            print("yahoo!")
            unordered_data = {"form_submission_success":True,"selectpole":selectpole,"selectpolestatus":selectpolestatus,"location":submit_data['location'],"latitude":submit_data['latitude'],"longitude":submit_data['longitude'],"description":description,"poleimage":str(encoded_string),"poleimagename":str(filename),"message": "Form data logged successfully"}

            # response_data = OrderedDict([
            #     ("form_submission_success", True),
            #     ("location", submit_data['location']),
            #     ("latitude", submit_data['latitude']),
            #     ("longitude", submit_data['longitude']),
            #     ("description", description),
            #     ("selectpole", selectpole),
            #     ("selectpolestatus", selectpolestatus),
            #     ("poleimage", str(encoded_string)),
            #     ("poleimagename", str(filename)),
            #     ("message":"Form data logged successfully")
            # ])

            response_data = OrderedDict([
                ("form_submission_success", True),
                ("location", submit_data['location']),
                ("latitude", submit_data['latitude']),
                ("longitude", submit_data['longitude']),
                ("description", description),
                ("selectpole", selectpole),
                ("selectpolestatus", selectpolestatus),
                ("poleimage", str(encoded_string)),
                ("poleimagename", str(filename)),
                ("message", "Form data logged successfully")
            ])
            # Authentication Logic
            if location in userData['location']:
                return jsonify({"message":f"location {location} already present in database..skipping creation"})

            else:
                jsonify({"message":f"need to create data {location} in database"})


            # response_data_sorted = dict(sorted(response_data.items(), key=lambda item: item[0]))

            # return jsonify(response_data_sorted), 200

            return jsonify(dict(response_data)), 200

            # return jsonify(response_data),200
        else:
            all_errors = {field: error[0] for field, error in form_object.errors.items()}
            print("form submission not successful")
            return jsonify({"form_submission_success":False,"errors":all_errors}), 400
        
      

        # commenting the below code for now
        # return jsonify({"location":f"{test1}","gpslocation":f"{test2}","description":"empty"})
        # return "hahahha"

# Example data structure to hold trip data
trips = {}

# CRUD Operations for TRIP
# Create Route for a particular trip.. i.e Starting a trip
@app.route('/start_trip',methods=['POST'])
def start_trip():
    print("Create operation for trip with id 19")
    # Assuming the frontend sends the current user's name
    # current_user = request.json.get('current_user')
    # Get the current time as the trip start time
    start_time = datetime.now()
    # print(start_time)
    # Return the trip start time as a response
    start_time_formatted = start_time.strftime('%Y-%m-%d %H:%M:%S')
    # print(start_time_formatted)
    # print(f"started : True, startTime: {start_time_formatted}")
    data = request.json
    if not data or 'trip_id' not in data or 'user_id' not in data or 'start_at' not in data or 'username' not in data or 'from_gps_x' not in data or 'from_gps_y' not in data:
        return jsonify({'error': 'Bad Request', 'message': 'Trip ID, User ID, and Start Location are required'}), 400

    trip_id = int(data['trip_id'])
    user_id = int(data['user_id'])
    start_location = data['start_at'] #startlocation in words
    
    if trip_id in trips:
        return jsonify({'error': 'Conflict', 'message': 'Trip already started'}), 409

    # trips data with username, user_id values to be inserted into the database
    trips[trip_id] = {
        'user_id': user_id,
        'username': data['username'],
        'start_at': start_location,
        'from_gps_x':27, # latitude fetched from react frontend say 27
        'from_gps_y':82, # longitude longitude fetched from react frontend say 82
        'start_time': data.get('start_time'),
        'distance':0,
        'status': 'ongoing' # 'status':ongoing or status:started at starttrip and status:'ended' at endtrip
    }
    try:
        print("trip type : ",type(trips.get(trip_id)))
        print("trip data contents")
        print(trips.get(trip_id))
    except Exception as e:
        print(f"the error is {e}")    
    # trips['from_gps'] and  trips['distance']: 0 at 
    # mock trip data before inserting into the database..Database already created
    # this thips[trip_id] data need to be inserted into the database

    # return jsonify({'message': 'Trip started successfully', 'trip': trips[trip_id]}), 201
    return jsonify({'started': True, 'startTime': start_time_formatted,'message': 'Trip started successfully', 'trip': trips[trip_id]}),201

# Read ROUTE for a particular trip
@app.route('/trips/<int:trip_id>', methods=['GET'])
def get_trip(trip_id):
    print("read operation for trip with id 19")
    trip = trips.get(trip_id) #query from the database
    print("type of trip : ",type(trip))
    print("trip data contents of id 19")
    print(trip)
    if not trip:
        return jsonify({'error': 'Not Found', 'message': 'Trip not found'}), 404
    return jsonify(trip)

# # Update Route for a particular trip
# @app.route('/trips/<int:trip_id>', methods=['PUT'])
# def update_trip(trip_id):
#     trip = trips.get(trip_id) #query from the database
#     if trip is None:
#         # return jsonify({'error': 'Trip not found'}), 404
#         try:
#             data = request.get_json(force=True)
#             trip.username = data['username']
#             trip.start_at = datetime.strptime(data['start_at'], '%Y-%m-%d %H:%M:%S')
#             trip.from_gps = data['from_gps']
#             trip.end_at = datetime.strptime(data['end_at'], '%Y-%m-%d %H:%M:%S')
#             trip.distance = data['distance']
#         except Exception as e:
#             return jsonify({'error': f'Invalid JSON provided caught an exception {e}'}), 400

    #     return jsonify({
    #     'message': f'Trip updated successfully! with username: {trip.username}, starttime: {trip.start_at}'
    # }), 200

# Update Route for a particular trip
@app.route('/trips/<int:trip_id>', methods=['PUT'])
def update_trip(trip_id):
    trip = trips.get(trip_id)  # Query from the database
    if trip is None:
        trip = {}  # Create a new trip (you might want to use a proper Trip class or structure)

    try:
        data = request.get_json(force=True)
        trip['username'] = data['username']
        trip['start_at'] = datetime.strptime(data['start_at'], '%Y-%m-%d %H:%M:%S')
        trip['from_gps'] = data['from_gps']
        trip['end_at'] = datetime.strptime(data['end_at'], '%Y-%m-%d %H:%M:%S')
        trip['distance'] = data['distance']

        # Save the new trip to the trips dictionary
        trips[trip_id] = trip
    except KeyError as e:
        return jsonify({'error': f'Missing key in JSON data: {e}'}), 400
    except ValueError as e:
        return jsonify({'error': f'Invalid data format: {e}'}), 400
    except Exception as e:
        return jsonify({'error': f'An unexpected error occurred: {e}'}), 500

    return jsonify({
        'message': f'Trip updated successfully! with username: {trip["username"]}, starttime: {trip["start_at"]}'
    }), 200

# Delete Route for a particular trip
@app.route('/trips/<int:trip_id>', methods=['DELETE'])
def delete_trip(trip_id):
    trip = trips.get(trip_id) #the trip refers  to particualar trip to delete..actually to be queried from the database
    # del trips[trip] # logic to delete a trip
    try:
        trips.pop(trip_id)
    except Exception as e:
        return jsonify({'message':f'no such trip=> {e}'})
    # if trip is None:
    #     return jsonify({'error':'no trip'})
    return jsonify({'message': f'Trip with ID: {trip_id} deleted successfully!'})

# Read Route for all trips (reading list of trips)
@app.route('/trips', methods=['GET'])
def get_all_trips():
    print("Read route for all trips")
    print("types :",type(trips))
    print("all trips")
    print(trips)
    return jsonify(trips)
    # try:
    #     trips_list = list(trips.keys())
    #     return jsonify({'trips': trips_list}), 200
    #     # trips_list = list(trips.values())
    #     # return jsonify({'trips': trips_list}), 200
    # except Exception as e:
    #     print(f"the error is {e}")
    #     return jsonify({'error': 'Internal Server Error', 'message': str(e)}), 500

# Decorator to check if a trip has started
def trip_started_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        trip_id = kwargs.get('trip_id')
        if trip_id is None or trip_id not in trips or trips[trip_id]['status'] != 'ongoing':
            return jsonify({'error': 'Unauthorized', 'message': 'Trip must be started before ending it'}), 401
        return func(*args, **kwargs)
    return wrapper

# Route for end_trip
@app.route('/end_trip', methods=['POST'])
@trip_started_required
def end_trip():
    end_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    data = request.json
    
    if not data or 'trip_id' not in data or 'end_at' not in data or 'distance' not in data:
        return jsonify({'error': 'Bad Request', 'message': 'Trip ID and End Location are required'}), 400
    
    trip_id = data['trip_id']
    end_at = data['end_at']
    distance = data['distance']

    trip_data = trips[trip_id]
    trip_data['end_at'] = end_at
    trip_data['end_time'] = end_time
    trip_data['distance'] = distance
    trip_data['status'] = 'completed'

    
    if trip_id not in trips:
        return jsonify({'error': 'Not Found', 'message': 'Trip not found'}), 404
    
    if trips[trip_id]['status'] == 'ended':
        return jsonify({'error': 'Conflict', 'message': 'Trip already ended'}), 409

    trips[trip_id]['end_at'] = end_at
    trips[trip_id]['end_time'] = data.get('end_time')  # or trips[trip_id]['end_time'] = datetime.now()
    trips[trip_id]['status'] = 'ended'
    # these data trips[trip_id]['end_location'], trips[trip_id]['end_location'], trips[trip_id]['status'] = 'ended' need to be inserted into the database

    return jsonify({'message': 'Trip ended successfully', 'trip': trips[trip_id]}), 20


# @app.route('/static/<path:pathLocation>')
# def serve_static(pathLocation):
#     return send_file(f'buildStaticReactVite/{pathLocation}')




# print(app.url_map)
if __name__ == '__main__':
    # print("This must be either True or False",os.path.exists('dummy'))
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    if not os.path.exists('dummy'):
        os.makedirs('dummy')
    with app.app_context():
        db.create_all()
    # with app.app_context():
    #     randomize()
    app.run(debug=True)