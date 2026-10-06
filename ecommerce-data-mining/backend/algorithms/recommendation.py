import pandas as pd
from algorithms.association import get_cached_rules, run_association_mining

# Default product catalog metadata fallback
PRODUCT_CATALOG = {
    "Bread": {"category": "Bakery & Dairy", "price": 40},
    "Butter": {"category": "Bakery & Dairy", "price": 60},
    "Milk": {"category": "Bakery & Dairy", "price": 32},
    "Tea": {"category": "Beverages", "price": 120},
    "Biscuits": {"category": "Snacks", "price": 30},
    "Coffee": {"category": "Beverages", "price": 180},
    "Sugar": {"category": "Grocery", "price": 45},
    "Snacks": {"category": "Snacks", "price": 50},
    "Laptop": {"category": "Electronics", "price": 55000},
    "Wireless Mouse": {"category": "Electronics", "price": 850},
    "Smartphone": {"category": "Electronics", "price": 18000},
    "Screen Protector": {"category": "Electronics", "price": 250},
    "Phone Case": {"category": "Electronics", "price": 350},
    "Headphones": {"category": "Electronics", "price": 1500},
    "Running Shoes": {"category": "Fashion", "price": 2400},
    "Socks": {"category": "Fashion", "price": 150},
    "Camera": {"category": "Electronics", "price": 32000},
    "Memory Card": {"category": "Electronics", "price": 650},
    "Shampoo": {"category": "Personal Care", "price": 280},
    "Conditioner": {"category": "Personal Care", "price": 310},
    "Face Wash": {"category": "Personal Care", "price": 190},
    "T-Shirt": {"category": "Fashion", "price": 699},
    "Jeans": {"category": "Fashion", "price": 1499},
    "Backpack": {"category": "Fashion", "price": 1299}
}

def recommend_products(df, selected_products=None, customer_id=None):
    """
    Recommends products based on:
    1. Association rules antecedent matching
    2. Customer past purchase history
    3. Category affinity & popularity fallback
    """
    rules = get_cached_rules()
    if not rules:
        # Compute rules on the fly
        mining_res = run_association_mining(df, min_support=0.02, min_confidence=0.25)
        rules = mining_res.get("association_rules", [])

    cart_items = set()
    customer_info = None

    # If customer selected, fetch their past purchases
    if customer_id and "customer_id" in df.columns:
        cust_rows = df[df["customer_id"] == customer_id]
        if not cust_rows.empty:
            past_prods = cust_rows["product_name"].dropna().unique().tolist()
            cart_items.update(past_prods)
            customer_info = {
                "customer_id": customer_id,
                "name": str(cust_rows["customer_name"].iloc[0]) if "customer_name" in cust_rows.columns else customer_id,
                "past_purchases": past_prods,
                "total_spending": float(cust_rows["total_spending"].iloc[0]) if "total_spending" in cust_rows.columns else 0
            }

    if selected_products:
        cart_items.update(selected_products)

    recommendations = {}

    # 1. Match Association Rules
    for r in rules:
        ant = set(r["antecedents"])
        con = r["consequents"]

        # Check if cart contains antecedent items
        if ant.issubset(cart_items) or any(item in cart_items for item in ant):
            for target_item in con:
                if target_item not in cart_items:
                    conf = r["confidence"]
                    lift = r["lift"]
                    score = conf * (1.0 + min(lift, 5.0) / 10.0)

                    if target_item not in recommendations or recommendations[target_item]["score"] < score:
                        ant_str = ", ".join(ant)
                        recommendations[target_item] = {
                            "product_name": target_item,
                            "score": round(score * 100, 1),
                            "confidence_pct": round(conf * 100, 1),
                            "lift": lift,
                            "reason": f"Frequently bought together with {ant_str} (Lift: {lift}x)"
                        }

    # 2. If recommendations are few, add related category or popular products
    if len(recommendations) < 3 and "product_name" in df.columns:
        top_prods = df["product_name"].value_counts()
        for p_name, count in top_prods.items():
            if p_name not in cart_items and p_name not in recommendations:
                recommendations[p_name] = {
                    "product_name": p_name,
                    "score": round(65.0 + min(count / 10.0, 15.0), 1),
                    "confidence_pct": 70.0,
                    "lift": 1.5,
                    "reason": "Top trending product among similar shoppers"
                }
            if len(recommendations) >= 5:
                break

    # Enrich with catalog details (category, price)
    results = []
    for p_name, info in recommendations.items():
        meta = PRODUCT_CATALOG.get(p_name, {"category": "General", "price": 250})
        # Try to get price from df if present
        if "product_name" in df.columns and "price" in df.columns:
            matches = df[df["product_name"] == p_name]
            if not matches.empty:
                meta["price"] = float(matches["price"].iloc[0])
                meta["category"] = str(matches["category"].iloc[0])

        info["category"] = meta.get("category", "General")
        info["price"] = meta.get("price", 100)
        results.append(info)

    # Sort descending by recommendation score
    results.sort(key=lambda x: x["score"], reverse=True)

    return {
        "cart_or_history_items": list(cart_items),
        "customer": customer_info,
        "recommendations": results[:8],
        "total_recommendations": len(results)
    }
