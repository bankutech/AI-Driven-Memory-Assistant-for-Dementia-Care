import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    try:
        # Parse DATABASE_URL: mysql://root:Sm@13022006@localhost:3306/brainCare
        # Note: In a production app, we'd use a proper URL parser or separate env vars
        connection = mysql.connector.connect(
            host='localhost',
            database='brainCare',
            user='root',
            password='Sm@13022006'
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error while connecting to MySQL: {e}")
        return None

def get_person_by_id(person_id):
    conn = get_db_connection()
    if not conn: return None
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM persons WHERE id = %s"
        cursor.execute(query, (person_id,))
        person = cursor.fetchone()
        return person
    except Error as e:
        print(f"Database error: {e}")
        return None
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def get_latest_interaction(person_id):
    conn = get_db_connection()
    if not conn: return None
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT ai_summary FROM interactions WHERE person_id = %s ORDER BY started_at DESC LIMIT 1"
        cursor.execute(query, (person_id,))
        interaction = cursor.fetchone()
        return interaction
    except Error as e:
        print(f"Database error: {e}")
        return None
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def get_all_face_encodings():
    conn = get_db_connection()
    if not conn: return []
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT id, person_id, embedding FROM face_encodings"
        cursor.execute(query)
        encodings = cursor.fetchall()
        return encodings
    except Error as e:
        print(f"Database error: {e}")
        return []
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()
