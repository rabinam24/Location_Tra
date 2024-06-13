# # from flask_sqlalchemy import SQLAlchemy

# # db = SQLAlchemy()

# from config import db

# class UserForm(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     location = db.Column(db.String(80), nullable=False)
#     gpslocation = db.Column(db.String(255))
#     selectpool = db.Column(db.String(80))
#     selectpoolstatus = db.Column(db.String(80))
#     selectpoollocation = db.Column(db.String(255))
#     description = db.Column(db.Text)
#     poolimage = db.Column(db.String(255))  # Store image path or URL
#     availableisp = db.Column(db.String(255))
#     selectisp = db.Column(db.String(80))
#     multipleimages = db.Column(db.Text)  # Store comma-separated image paths or URLs

#     def __repr__(self):
#         return f"<UserForm {self.id}>"


