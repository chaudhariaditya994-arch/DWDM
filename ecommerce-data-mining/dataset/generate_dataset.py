import csv
import random
from datetime import datetime, timedelta

random.seed(42)

# Master definitions
CUSTOMERS = [
    {"id": f"C{i:04d}", "name": name, "age": age, "gender": gender, "location": loc}
    for i, (name, age, gender, loc) in enumerate([
        ("Aarav Sharma", 28, "Male", "Mumbai"),
        ("Diya Patel", 34, "Female", "Ahmedabad"),
        ("Rohan Gupta", 22, "Male", "Delhi"),
        ("Ananya Iyer", 45, "Female", "Bengaluru"),
        ("Vikram Singh", 31, "Male", "Jaipur"),
        ("Pooja Nair", 29, "Female", "Kochi"),
        ("Rahul Verma", 52, "Male", "Lucknow"),
        ("Neha Kulkarni", 24, "Female", "Pune"),
        ("Kavita Rao", 38, "Female", "Hyderabad"),
        ("Arjun Reddy", 41, "Male", "Chennai"),
        ("Siddharth Roy", 30, "Male", "Kolkata"),
        ("Meera Joshi", 27, "Female", "Mumbai"),
        ("Aditya Malhotra", 35, "Male", "Delhi"),
        ("Sneha Deshmukh", 33, "Female", "Nagpur"),
        ("Tanvi Bhat", 26, "Female", "Bengaluru"),
        ("Kunal Mehta", 48, "Male", "Surat"),
        ("Rhea Kapoor", 23, "Female", "Chandigarh"),
        ("Nikhil Saxena", 36, "Male", "Bhopal"),
        ("Isha Mukherjee", 29, "Female", "Kolkata"),
        ("Manish Tiwari", 44, "Male", "Patna"),
        ("Priya Das", 32, "Female", "Bhubaneswar"),
        ("Gaurav Bansal", 27, "Male", "Delhi"),
        ("Ritika Sen", 39, "Female", "Kolkata"),
        ("Amit Choudhury", 50, "Male", "Guwahati"),
        ("Shweta Mishra", 25, "Female", "Indore"),
        ("Varun Khanna", 37, "Male", "Amritsar"),
        ("Deepika Pillai", 31, "Female", "Thiruvananthapuram"),
        ("Harshvardhan Goel", 43, "Male", "Kanpur"),
        ("Simran Sethi", 28, "Female", "Ludhiana"),
        ("Akash Chauhan", 26, "Male", "Dehradun"),
        ("Sonal Agarwal", 35, "Female", "Agra"),
        ("Sameer Nanda", 40, "Male", "Vadodara"),
        ("Pallavi Ghosh", 29, "Female", "Ranchi"),
        ("Yashvardhan K", 33, "Male", "Mysuru"),
        ("Swati Hegde", 30, "Female", "Mangaluru")
    ], 1)
]

PRODUCTS = [
    {"id": "P001", "name": "Bread", "category": "Bakery & Dairy", "price": 40},
    {"id": "P002", "name": "Butter", "category": "Bakery & Dairy", "price": 60},
    {"id": "P003", "name": "Milk", "category": "Bakery & Dairy", "price": 32},
    {"id": "P004", "name": "Tea", "category": "Beverages", "price": 120},
    {"id": "P005", "name": "Biscuits", "category": "Snacks", "price": 30},
    {"id": "P006", "name": "Coffee", "category": "Beverages", "price": 180},
    {"id": "P007", "name": "Sugar", "category": "Grocery", "price": 45},
    {"id": "P008", "name": "Snacks", "category": "Snacks", "price": 50},
    {"id": "P009", "name": "Laptop", "category": "Electronics", "price": 55000},
    {"id": "P010", "name": "Wireless Mouse", "category": "Electronics", "price": 850},
    {"id": "P011", "name": "Smartphone", "category": "Electronics", "price": 18000},
    {"id": "P012", "name": "Screen Protector", "category": "Electronics", "price": 250},
    {"id": "P013", "name": "Phone Case", "category": "Electronics", "price": 350},
    {"id": "P014", "name": "Headphones", "category": "Electronics", "price": 1500},
    {"id": "P015", "name": "Running Shoes", "category": "Fashion", "price": 2400},
    {"id": "P016", "name": "Socks", "category": "Fashion", "price": 150},
    {"id": "P017", "name": "Camera", "category": "Electronics", "price": 32000},
    {"id": "P018", "name": "Memory Card", "category": "Electronics", "price": 650},
    {"id": "P019", "name": "Shampoo", "category": "Personal Care", "price": 280},
    {"id": "P020", "name": "Conditioner", "category": "Personal Care", "price": 310},
    {"id": "P021", "name": "Face Wash", "category": "Personal Care", "price": 190},
    {"id": "P022", "name": "T-Shirt", "category": "Fashion", "price": 699},
    {"id": "P023", "name": "Jeans", "category": "Fashion", "price": 1499},
    {"id": "P024", "name": "Backpack", "category": "Fashion", "price": 1299}
]

STORES = [
    {"id": "S101", "name": "Metro Express Mumbai", "region": "West"},
    {"id": "S102", "name": "Delhi Central Mart", "region": "North"},
    {"id": "S103", "name": "Tech Hub Bengaluru", "region": "South"},
    {"id": "S104", "name": "City Mega Store Kolkata", "region": "East"},
    {"id": "S105", "name": "West Gate Ahmedabad", "region": "West"},
    {"id": "S106", "name": "Jaipur Plaza Store", "region": "North"},
    {"id": "S107", "name": "Chennai Marina Outlet", "region": "South"}
]

# Basket co-occurrence rules for realistic association mining
ASSOCIATION_BUNDLES = [
    (["Bread", "Butter"], 0.75),
    (["Tea", "Biscuits"], 0.80),
    (["Milk", "Bread"], 0.70),
    (["Coffee", "Sugar"], 0.65),
    (["Laptop", "Wireless Mouse"], 0.70),
    (["Smartphone", "Screen Protector", "Phone Case"], 0.65),
    (["Running Shoes", "Socks"], 0.72),
    (["Camera", "Memory Card"], 0.68),
    (["Shampoo", "Conditioner"], 0.74),
    (["Tea", "Biscuits", "Snacks"], 0.60),
    (["T-Shirt", "Jeans"], 0.58)
]

def generate_dataset():
    records = []
    base_date = datetime(2025, 1, 1)
    
    # Generate 950 base records
    for i in range(1, 951):
        cust = random.choice(CUSTOMERS)
        store = random.choice(STORES)
        
        # Random date over 2025-2026
        days_offset = random.randint(0, 420)
        curr_date = base_date + timedelta(days=days_offset)
        
        # Select product with association rule probability
        bundle_roll = random.random()
        picked_bundle = None
        for bundle, prob in ASSOCIATION_BUNDLES:
            if bundle_roll < prob and random.random() < 0.4:
                picked_bundle = bundle
                break
                
        if picked_bundle:
            prod_name = random.choice(picked_bundle)
        else:
            prod_name = random.choice(PRODUCTS)["name"]
            
        prod = next(p for p in PRODUCTS if p["name"] == prod_name)
        qty = random.choices([1, 2, 3, 4, 5], weights=[0.6, 0.25, 0.08, 0.05, 0.02])[0]
        total_amt = prod["price"] * qty
        
        # Customer behavioral stats (consistent with age & segment)
        is_high_spender = cust["age"] > 25 and random.random() > 0.4
        prev_purchases = random.randint(12, 45) if is_high_spender else random.randint(1, 15)
        spending = prev_purchases * random.randint(400, 3500)
        freq = round(prev_purchases / 12, 2)
        recency = random.randint(2, 25) if is_high_spender else random.randint(15, 120)
        
        # Propensity to purchase again based on recency, freq, and spending
        propensity_score = (0.4 * (1 / (recency + 1))) + (0.35 * (freq / 4.0)) + (0.25 * (spending / 50000))
        likely_to_purchase_again = 1 if (propensity_score > 0.08 or recency < 30) else 0
        if random.random() < 0.1:  # slight noise for realism
            likely_to_purchase_again = 1 - likely_to_purchase_again

        tx_id = f"TX{((i - 1) // 3) + 1:04d}"  # Groups products into transactions of 2-3 items
        
        row = {
            "sales_id": f"S{i:05d}",
            "transaction_id": tx_id,
            "customer_id": cust["id"],
            "customer_name": cust["name"],
            "age": cust["age"],
            "gender": cust["gender"],
            "location": cust["location"],
            "product_id": prod["id"],
            "product_name": prod["name"],
            "category": prod["category"],
            "price": prod["price"],
            "quantity": qty,
            "total_amount": total_amt,
            "store_id": store["id"],
            "store_name": store["name"],
            "region": store["region"],
            "order_date": curr_date.strftime("%Y-%m-%d"),
            "day": curr_date.day,
            "month": curr_date.month,
            "quarter": (curr_date.month - 1) // 3 + 1,
            "year": curr_date.year,
            "previous_purchases": prev_purchases,
            "total_spending": spending,
            "purchase_frequency": freq,
            "days_since_last_purchase": recency,
            "likely_to_purchase_again": likely_to_purchase_again
        }
        records.append(row)

    # Add 25 intentional duplicate records for preprocessing detection
    duplicates = [dict(records[random.randint(0, 200)]) for _ in range(25)]
    records.extend(duplicates)

    # Add intentional missing values (empty strings / None) in 30 rows for preprocessing handling
    for _ in range(30):
        target = random.choice(records)
        field_to_blank = random.choice(["age", "gender", "category", "days_since_last_purchase", "total_spending"])
        target[field_to_blank] = ""

    # Write out to CSV
    fieldnames = list(records[0].keys())
    with open("ecommerce-data-mining/dataset/sample_sales.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)

    print(f"Generated {len(records)} records in ecommerce-data-mining/dataset/sample_sales.csv successfully!")

if __name__ == "__main__":
    generate_dataset()
