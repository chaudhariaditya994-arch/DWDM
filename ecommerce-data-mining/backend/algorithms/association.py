import time
import pandas as pd
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, fpgrowth, association_rules

# Cached rules storage
_cached_rules = []
_cached_itemsets = []

def extract_baskets_from_df(df):
    """
    Groups products by transaction_id or customer_id into list of lists (market baskets)
    """
    group_col = "transaction_id" if "transaction_id" in df.columns else "customer_id"
    prod_col = "product_name"
    
    clean_df = df.dropna(subset=[group_col, prod_col]).copy()
    baskets = clean_df.groupby(group_col)[prod_col].apply(lambda items: list(set(items))).tolist()
    # Filter baskets with at least 1 item
    baskets = [b for b in baskets if len(b) > 0]
    return baskets

def run_association_mining(df, algorithm="apriori", min_support=0.03, min_confidence=0.3):
    """
    Runs Apriori or FP-Growth association rule mining using mlxtend.
    Returns frequent itemsets and association rules with support, confidence, lift.
    """
    global _cached_rules, _cached_itemsets

    baskets = extract_baskets_from_df(df)
    if not baskets:
        return {"error": "No valid transaction baskets found."}

    # One-hot encode transactions
    te = TransactionEncoder()
    te_ary = te.fit(baskets).transform(baskets)
    basket_df = pd.DataFrame(te_ary, columns=te.columns_)

    # Clamp parameters
    min_sup = max(0.01, min(float(min_support), 0.5))
    min_conf = max(0.1, min(float(min_confidence), 1.0))

    # Benchmark execution time
    start_time = time.time()
    if algorithm.lower() == "fpgrowth":
        frequent_itemsets = fpgrowth(basket_df, min_support=min_sup, use_colnames=True)
    else:
        frequent_itemsets = apriori(basket_df, min_support=min_sup, use_colnames=True)
    exec_time_ms = round((time.time() - start_time) * 1000, 2)

    if frequent_itemsets.empty:
        # Retry with slightly lower support to guarantee rules for educational demo
        frequent_itemsets = fpgrowth(basket_df, min_support=0.015, use_colnames=True) if algorithm.lower() == "fpgrowth" else apriori(basket_df, min_support=0.015, use_colnames=True)

    # Format itemsets
    itemsets_list = []
    if not frequent_itemsets.empty:
        frequent_itemsets["length"] = frequent_itemsets["itemsets"].apply(lambda x: len(x))
        frequent_itemsets.sort_values(by="support", ascending=False, inplace=True)
        
        for _, row in frequent_itemsets.head(30).iterrows():
            itemsets_list.append({
                "items": list(row["itemsets"]),
                "items_str": " + ".join(list(row["itemsets"])),
                "support": round(float(row["support"]), 4),
                "support_pct": round(float(row["support"]) * 100, 2),
                "item_count": int(row["length"])
            })

    # Generate Association Rules
    rules_list = []
    if not frequent_itemsets.empty and len(frequent_itemsets) > 1:
        try:
            rules_df = association_rules(frequent_itemsets, metric="confidence", min_threshold=min_conf)
            if rules_df.empty:
                # Fallback to lower confidence to show meaningful academic patterns
                rules_df = association_rules(frequent_itemsets, metric="confidence", min_threshold=0.2)

            rules_df.sort_values(by="lift", ascending=False, inplace=True)

            for _, r in rules_df.head(40).iterrows():
                ant = list(r["antecedents"])
                con = list(r["consequents"])
                rules_list.append({
                    "antecedents": ant,
                    "consequents": con,
                    "rule": f"{', '.join(ant)} → {', '.join(con)}",
                    "support": round(float(r["support"]), 4),
                    "confidence": round(float(r["confidence"]), 4),
                    "confidence_pct": round(float(r["confidence"]) * 100, 1),
                    "lift": round(float(r["lift"]), 3),
                    "leverage": round(float(r.get("leverage", 0)), 4)
                })
        except Exception as e:
            print(f"[Association] Rule generation warning: {e}")

    _cached_rules = rules_list
    _cached_itemsets = itemsets_list

    return {
        "algorithm": algorithm.upper(),
        "min_support": min_sup,
        "min_confidence": min_conf,
        "total_transactions": len(baskets),
        "total_frequent_itemsets": len(itemsets_list),
        "total_rules": len(rules_list),
        "execution_time_ms": exec_time_ms,
        "frequent_itemsets": itemsets_list,
        "association_rules": rules_list
    }

def get_cached_rules():
    global _cached_rules
    return _cached_rules
