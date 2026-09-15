#!/usr/bin/env python3
"""
Database migration script using SQLAlchemy
"""
import os
from sqlalchemy import create_engine, text
from app.database import Base
from app.models import *  # Import all models

def run_migrations():
    """Run database migrations"""
    print("Running database migrations...")
    
    # Get database URL from environment
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("ERROR: DATABASE_URL environment variable not set")
        return False
    
    try:
        # Create engine
        engine = create_engine(database_url)
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✓ Database tables created successfully")
        
        return True
        
    except Exception as e:
        print(f"ERROR: Migration failed - {e}")
        return False

def run_seeds():
    """Run seed data from SQL files"""
    print("Running seed data...")
    
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("ERROR: DATABASE_URL environment variable not set")
        return False
    
    try:
        engine = create_engine(database_url)
        
        # List of seed files to execute in order
        seed_files = [
            'database/seeds/assist_questions.sql',
            'database/seeds/assist_questions_part2.sql', 
            'database/seeds/phq9_questions.sql',
            'database/seeds/trigger_items.sql'
        ]
        
        with engine.connect() as conn:
            for seed_file in seed_files:
                if os.path.exists(seed_file):
                    print(f"Loading {seed_file}...")
                    with open(seed_file, 'r', encoding='utf-8') as f:
                        sql_content = f.read()
                    
                    # Clean the SQL content
                    # Remove USE statements
                    lines = sql_content.split('\n')
                    cleaned_lines = []
                    
                    for line in lines:
                        # Skip USE statements and comments
                        if (line.strip().startswith('USE ') or 
                            line.strip().startswith('--') or 
                            line.strip().startswith('SELECT ') or
                            line.strip().startswith('SOURCE ') or
                            line.strip() == ''):
                            continue
                        cleaned_lines.append(line)
                    
                    cleaned_sql = '\n'.join(cleaned_lines)
                    
                    # Split by semicolon but be careful with JSON content
                    statements = []
                    current_statement = ""
                    paren_count = 0
                    in_string = False
                    
                    for char in cleaned_sql:
                        current_statement += char
                        
                        if char == "'" and not in_string:
                            in_string = True
                        elif char == "'" and in_string:
                            in_string = False
                        elif char == '(' and not in_string:
                            paren_count += 1
                        elif char == ')' and not in_string:
                            paren_count -= 1
                        elif char == ';' and not in_string and paren_count == 0:
                            stmt = current_statement.strip()
                            if stmt and not stmt.startswith('--'):
                                statements.append(stmt[:-1])  # Remove the semicolon
                            current_statement = ""
                    
                    # Add the last statement if it doesn't end with semicolon
                    if current_statement.strip():
                        statements.append(current_statement.strip())
                    
                    # Execute each statement
                    try:
                        for stmt in statements:
                            if stmt.strip():
                                conn.execute(text(stmt))
                        conn.commit()
                        print(f"✓ {seed_file} loaded successfully")
                    except Exception as e:
                        print(f"✗ Error loading {seed_file}: {e}")
                        conn.rollback()
                        return False
                else:
                    print(f"⚠ {seed_file} not found, skipping...")
        
        print("✓ All seed data loaded successfully")
        return True
        
    except Exception as e:
        print(f"ERROR: Seed data loading failed - {e}")
        return False

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--seeds":
        success = run_seeds()
    else:
        success = run_migrations()
    
    exit(0 if success else 1)