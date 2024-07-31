from config import db

# models for the mydatabase2.db file inside main2.py

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
