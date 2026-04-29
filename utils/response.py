from flask import jsonify


def success_response(data, code: int = 200):
    return jsonify(data), code

