from Database import engine, base
import model

base.metadata.create_all(bind=engine)