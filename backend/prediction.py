#!/usr/bin/env python3

# Import Dependencies
import os
import sys

import mysql.connector
import pandas as pd

from sklearn.compose import ColumnTransformer, make_column_selector
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_validate, train_test_split
from sklearn.pipeline import make_pipeline, Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# Define global variables
orig_data = pd.DataFrame()
model = Pipeline([])


# Get data from SQL database
def get_sql_data():
    connection = mysql.connector.connect(
        host=os.environ['GFB_SQL_HOST'],
        user=os.environ['GFB_SQL_USER'],
        password=os.environ['GFB_SQL_PASSWORD'],
        database="tractor_pulling"
    )

    cursor = connection.cursor()
    cursor.execute("""
        SELECT
            (CASE
              WHEN h.position = 1 THEN 1 ELSE 0
            END) AS won,
            s.id AS season,
            l.id AS location,
            g.id AS puller,
            t.id AS tractor,
            c.category,
            c.weight,
            c.hook_count
        FROM seasons AS s
            INNER JOIN pulls as p ON p.season = s.id
            INNER JOIN classes as c ON c.pull = p.id
            INNER JOIN hooks as h ON h.class = c.id
            INNER JOIN locations as l ON l.id = p.location
            INNER JOIN pullers as g ON g.id = h.puller
            INNER JOIN tractors as t ON t.id = h.tractor
            """)

    rows = cursor.fetchall()
    df = pd.DataFrame(rows)
    df.columns = [i[0] for i in cursor.description]
    return df


# Get statistical model from data
def get_statistical_model():
    target_name = "won"
    target = orig_data[target_name]
    data = orig_data.drop(columns=[target_name])

    numerical_columns_selector = make_column_selector(dtype_exclude=object)
    categorical_columns_selector = make_column_selector(dtype_include=object)

    numerical_columns = numerical_columns_selector(data)
    categorical_columns = categorical_columns_selector(data)

    categorical_preprocessor = OneHotEncoder(handle_unknown="ignore")
    numerical_preprocessor = StandardScaler()

    preprocessor = ColumnTransformer([
        ('one-hot-encoder', categorical_preprocessor, categorical_columns),
        ('standard_scaler', numerical_preprocessor, numerical_columns)
    ])

    pipeline = make_pipeline(preprocessor, LogisticRegression(max_iter=50000))
    data_train, data_test, target_train, target_test = train_test_split(
        data, target, test_size=0.2)
    pipeline.fit(data_train, target_train)

    print(pipeline.score(data_test, target_test))

    # print(f"Model Score: {pipeline.score(data_test, target_test):.3f}")

    # cv_results = cross_validate(pipeline, data, target, cv=5)
    # scores = cv_results["test_score"]
    # print(f"Cross-validation Accuracy: {scores.mean():.3f} ± {scores.std():.3f}")

    return pipeline


# Returns percentage change of winning with given criteria
def chance_of_winning(season, location, puller, tractor, category, weight, hook_count):
    row = pd.DataFrame({
        "season": [season],
        "location": [location],
        "puller": [puller],
        "tractor": [tractor],
        "category": [category],
        "weight": [weight],
        "hook_count": [hook_count]
    })

    return model.predict_proba(row)[0][1]


# Runs test cases on model
def test():
    people = {
        "Frank": "93545bca-6455-43de-b0a4-64e4a2fdb17f",
        "Brandon": "239e2f33-94cf-47d1-90d7-f0eb948392d5"
    }
    tractors = {
        "Farmall 450": "d1eabdfd-cb8b-4601-b115-70c8c102b3c3",
        "Farmall Super H": "0f4644cf-e143-4bf4-93d4-1e728e11b4e8"
    }
    class_types = ["Farm Stock", "Farm Plus"]
    weights = [5000, 6000]
    for person in people:
        for tractor in tractors:
            for class_type in class_types:
                for weight in weights:
                    print(chance_of_winning('4effa23e-ead3-4c35-b093-2a46a8de2556',
                                            'd221d855-4779-4079-b9e1-feda95cc17a6', people[person],
                                            tractors[tractor], class_type, weight, 5))


def main():
    global orig_data
    orig_data = get_sql_data()

    global model
    model = get_statistical_model()

    # test()

    season = sys.argv[1]
    location = sys.argv[2]
    puller = sys.argv[3]
    tractor = sys.argv[4]
    category = sys.argv[5]
    weight = sys.argv[6]
    hook_count = sys.argv[7]

    print(chance_of_winning(season, location, puller,
          tractor, category, weight, hook_count))


if __name__ == "__main__":
    main()
