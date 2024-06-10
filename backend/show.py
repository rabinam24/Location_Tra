from flask import Flask
from flask_cors import CORS
from config import db
app = Flask(__name__)
CORS(app)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///bib.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)
from datetime import datetime
class student(db.Model):
    roll = db.Column(db.Integer,primary_key=True)
    name = db.Column(db.String(80))


from sqlalchemy import DDL

# def classic():
#     # Generate SQL code for creating tables
#     ddl = DDL(db.Model.metadata.ddl)
#     sql_code = ddl.compile(db.engine)
#     print(sql_code)

from sqlalchemy.schema import CreateTable
from sqlalchemy import create_engine

def classic():
    # Create an engine
    engine = create_engine(app.config["SQLALCHEMY_DATABASE_URI"])
    # Generate SQL code for creating tables
    for table in db.Model.metadata.tables.values():
        create_table_stmt = CreateTable(table)
        print(type(create_table_stmt))
        print(create_table_stmt.compile(db.engine))
        # Compile the statement into a string
        # create_table_sql = str(create_table_stmt.compile(engine))
        # create_table_sql = create_table_stmt.compile(engine)
        # Execute the SQL statement to create the table
        # with engine.connect() as connection:
        #     connection.execute(create_table_sql)
        # Execute the SQL statement to create the table
        # db.engine.execute(str(create_table_stmt))
        # with engine.connect() as connection:
        #     connection.execute(str(create_table_stmt))

# def modern():
#     # Create an engine
#     engine = create_engine(app.config["SQLALCHEMY_DATABASE_URI"])
#     # Generate SQL code for creating tables
#     for table in db.Model.metadata.tables.values():
#         create_table_stmt = CreateTable(table)
#         create_table_sql = str(create_table_stmt.compile(engine))
#         # Execute the SQL statement to create the table
#         with engine.connect() as connection:
#             connection.execute(create_table_sql)
        
# def modern():
#     # Create an engine
#     engine = create_engine(app.config["SQLALCHEMY_DATABASE_URI"])
#     # Generate SQL code for creating tables
#     for table in db.Model.metadata.tables.values():
#         create_table_stmt = CreateTable(table)
#         # Execute the CreateTable statement to create the table
#         with engine.connect() as connection:
#             connection.execute(create_table_stmt)

from sqlalchemy import inspect

def modern():
    # Create an engine
    engine = create_engine(app.config["SQLALCHEMY_DATABASE_URI"])
    # Get a list of existing table names
    existing_tables = inspect(engine).get_table_names()
    print(type(existing_tables),"hello")
    print(existing_tables,"list of existing tables")
    print(type(db.Model.metadata.tables.values()))
    print(db.Model.metadata.tables.values())
    for table in db.Model.metadata.tables.values():
        table_name = table.name
        print(type(table_name),table_name)

        if table_name in existing_tables:
            print(f"{table_name}  table exists in the database..Skipping creation")
            break
        elif table_name not in existing_tables:
            print(f"{table_name} table doesnt exist in the database")
            print(f"Creating {table_name} table operation")
            create_table_stmt = CreateTable(table)
            # Execute the CreateTable statement to create the table
            with engine.connect() as connection:
                connection.execute(create_table_stmt)
            existing_tables.append(str(table_name))
            print(f"Congrats {table_name} table just created at {datetime.now()}")
    # for x in existing_tables:
    #     print("existing tables are : ",str(x))

    # Generate SQL code for creating tables
    # for table in db.Model.metadata.tables.values():
    #     table_name = table.name
    #     # Check if the table already exists
    #     for x in existing_tables:
    #         print("existing tables are : ",str(x))
        # if table_name not in existing_tables:
            # create_table_stmt = CreateTable(table)
            # Execute the CreateTable statement to create the table
            # with engine.connect() as connection:
            #     connection.execute(create_table_stmt)
        # else:
        #     print(f"Table '{table_name}' already exists, skipping creation.")



# Generate SQL code for creating tables
# sql_code = db.Model.metadata.create_all(bind=db.engine)

# # Print the generated SQL code
# print(sql_code)

# def classic():
#     # Generate SQL code for creating tables
#     sql_code = db.Model.metadata.create_all(bind=db.engine)
#     print(sql_code)

if  __name__=='__main__':
    with app.app_context():
        classic()
        modern()
    #     sql_code = db.Model.metadata.create_all(bind=db.engine)
    #     # Print the generated SQL code
    #     print(sql_code)        
    app.run(debug=True)