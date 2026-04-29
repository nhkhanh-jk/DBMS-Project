from flask import jsonify


class ApiError(Exception):
    def __init__(self, message: str, code: int = 400):
        self.message = message
        self.code = code
        super().__init__(message)


def error_response(message: str, code: int):
    return jsonify({"error": message, "code": code}), code

