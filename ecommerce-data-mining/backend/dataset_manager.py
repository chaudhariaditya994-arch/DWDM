import os
import pandas as pd
from database.connection import DATASET_PATH, seed_star_schema_from_csv

_current_df = None
_preprocessed_cache = None
_clustering_cache = None
_classification_cache = None
_association_cache = None

def get_current_dataset():
    global _current_df
    if _current_df is None:
        if os.path.exists(DATASET_PATH):
            _current_df = pd.read_csv(DATASET_PATH)
        else:
            raise FileNotFoundError(f"Dataset file not found at {DATASET_PATH}")
    return _current_df

def set_current_dataset(new_df, save_to_file=True):
    global _current_df, _preprocessed_cache, _clustering_cache, _classification_cache, _association_cache
    _current_df = new_df.copy()
    _preprocessed_cache = None
    _clustering_cache = None
    _classification_cache = None
    _association_cache = None
    if save_to_file:
        _current_df.to_csv(DATASET_PATH, index=False)
        seed_star_schema_from_csv()

def reset_to_sample_dataset():
    global _current_df
    from dataset.generate_dataset import generate_dataset
    generate_dataset()
    _current_df = pd.read_csv(DATASET_PATH)
    seed_star_schema_from_csv()
    return _current_df
