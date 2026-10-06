import os
import sqlite3
import pandas as pd
from sqlalchemy import create_engine, text
import pymysql

# Database Configurations
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DB = os.getenv("MYSQL_DB", "ecommerce_data_mining")

# Resolve Dataset Path (support local repository structure and Vercel serverless bundle)
def resolve_dataset_path():
    candidates = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "dataset", "sample_sales.csv")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dataset", "sample_sales.csv")),
        os.path.abspath(os.path.join(os.getcwd(), "dataset", "sample_sales.csv")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "sample_sales.csv"))
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return candidates[0]

DATASET_PATH = resolve_dataset_path()

# In Vercel serverless functions, the root filesystem is read-only except /tmp
if os.getenv("VERCEL"):
    SQLITE_PATH = "/tmp/ecommerce_data_mining.db"
else:
    SQLITE_PATH = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "database", "ecommerce_data_mining.db")
    )

_active_engine = None
_db_type = "sqlite"

def get_db_status():
    global _db_type
    return {
        "db_type": _db_type,
        "mysql_host": MYSQL_HOST,
        "mysql_port": MYSQL_PORT,
        "mysql_database": MYSQL_DB,
        "sqlite_path": SQLITE_PATH
    }

def try_connect_mysql():
    try:
        conn = pymysql.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            connect_timeout=2
        )
        with conn.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{MYSQL_DB}`")
        conn.commit()
        conn.close()

        uri = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
        engine = create_engine(uri, pool_pre_ping=True)
        # Test connection
        with engine.connect() as test_conn:
            test_conn.execute(text("SELECT 1"))
        return engine
    except Exception as e:
        print(f"[Database] MySQL connection notice: {e}. Falling back to SQLite for high reliability.")
        return None

def init_database():
    global _active_engine, _db_type
    engine = try_connect_mysql()
    if engine:
        _active_engine = engine
        _db_type = "mysql"
        print("[Database] Connected successfully to MySQL Server.")
    else:
        sqlite_dir = os.path.dirname(SQLITE_PATH)
        os.makedirs(sqlite_dir, exist_ok=True)
        _active_engine = create_engine(f"sqlite:///{SQLITE_PATH}")
        _db_type = "sqlite"
        print(f"[Database] Using SQLite fallback at: {SQLITE_PATH}")

    seed_star_schema_from_csv()
    return _active_engine

def get_engine():
    global _active_engine
    if _active_engine is None:
        init_database()
    return _active_engine

def seed_star_schema_from_csv():
    """Populates Star Schema tables (Fact_Sales, Dim_Customer, Dim_Product, Dim_Store, Dim_Time, Transactions) from CSV"""
    engine = get_engine()
    if not os.path.exists(DATASET_PATH):
        print(f"[Database] Dataset CSV not found at {DATASET_PATH}")
        return

    df = pd.read_csv(DATASET_PATH)
    # Clean rows with empty values for fact table insertion
    df_clean = df.dropna().drop_duplicates(subset=["sales_id"])

    try:
        with engine.connect() as conn:
            # Users table
            users_df = pd.DataFrame([
                {"id": 1, "name": "System Administrator", "email": "admin@ecommerce.com", "password": "admin123", "role": "admin"},
                {"id": 2, "name": "Data Analyst", "email": "analyst@ecommerce.com", "password": "analyst123", "role": "analyst"},
                {"id": 3, "name": "Student Demo", "email": "student@ecommerce.com", "password": "student123", "role": "user"}
            ])
            users_df.to_sql("users", engine, if_exists="replace", index=False)

            # Dim_Customer
            cust_cols = ["customer_id", "customer_name", "age", "gender", "location"]
            dim_cust = df_clean[cust_cols].rename(columns={"customer_name": "name"}).drop_duplicates(subset=["customer_id"])
            dim_cust.to_sql("customers", engine, if_exists="replace", index=False)

            # Dim_Product
            prod_cols = ["product_id", "product_name", "category", "price"]
            dim_prod = df_clean[prod_cols].drop_duplicates(subset=["product_id"])
            dim_prod.to_sql("products", engine, if_exists="replace", index=False)

            # Dim_Store
            store_cols = ["store_id", "store_name", "region"]
            dim_store = df_clean[store_cols].drop_duplicates(subset=["store_id"])
            dim_store.to_sql("stores", engine, if_exists="replace", index=False)

            # Dim_Time
            df_clean["time_id"] = "T" + df_clean["order_date"].astype(str).str.replace("-", "")
            time_cols = ["time_id", "order_date", "day", "month", "quarter", "year"]
            dim_time = df_clean[time_cols].rename(columns={"order_date": "date"}).drop_duplicates(subset=["time_id"])
            dim_time.to_sql("time_dimension", engine, if_exists="replace", index=False)

            # Fact_Sales
            fact_cols = ["sales_id", "customer_id", "product_id", "store_id", "time_id", "quantity", "total_amount"]
            sales_fact = df_clean[fact_cols]
            sales_fact.to_sql("sales_fact", engine, if_exists="replace", index=False)

            # Transactions (for Market Basket / Association Rules)
            tx_cols = ["transaction_id", "customer_id", "product_id", "quantity"]
            tx_table = df_clean[tx_cols]
            tx_table.to_sql("transactions", engine, if_exists="replace", index=False)

            print(f"[Database] Successfully populated Star Schema tables ({len(sales_fact)} fact records).")
    except Exception as e:
        print(f"[Database] Error seeding tables: {e}")

def execute_query(query_str, params=None):
    engine = get_engine()
    with engine.connect() as conn:
        result = conn.execute(text(query_str), params or {})
        try:
            return pd.DataFrame(result.fetchall(), columns=result.keys())
        except Exception:
            return pd.DataFrame()
