import sqlite3
import json
import os

db_path = "/Users/pranay/Projects/learning_for_kids/src/backend/app.db"
if not os.path.exists(db_path):
    print("Database not found at", db_path)
else:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, email, hashed_password FROM users WHERE email='pranay.suyash@gmail.com'")
    user = cursor.fetchone()
    
    if user:
        print(f"User found: ID={user['id']}, Email={user['email']}")
        
        cursor.execute("SELECT id, name, age, preferred_language FROM profiles WHERE user_id=?", (user['id'],))
        profiles = cursor.fetchall()
        print(f"Profiles ({len(profiles)}):")
        for p in profiles:
            print(f"  - {p['name']} (Age: {p['age']}, Lang: {p['preferred_language']})")
    else:
        print("User not found")
        
    conn.close()
