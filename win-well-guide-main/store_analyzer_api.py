"""
Store Analysis API - Analyzes e-commerce stores for conversion optimization
Flask API wrapper around the analyze_store function
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from datetime import datetime
import os
from dotenv import load_dotenv

# Import the analyze_store function from our module
from analyze_store import analyze_store, validate_store_url, fetch_store_data

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# API Endpoints


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "api_version": "1.0",
    })


@app.route("/api/analyze-store", methods=["POST"])
def analyze_store_endpoint():
    """
    Main endpoint to analyze a store
    This endpoint is called when the analyze button is clicked in the frontend.
    
    Request body:
    {
        "store_url": "https://example.myshopify.com",
        "store_name": "Optional store name"
    }
    """
    try:
        data = request.get_json()
        store_url = data.get("store_url") or data.get("storeUrl")
        store_name = data.get("store_name")

        if not store_url:
            return jsonify({"error": "store_url is required"}), 400

        logger.info(f"Analyzing store: {store_url}")

        # Call the analyze_store function
        report = analyze_store(store_url, store_name)

        if report.get("success"):
            return jsonify(report), 200
        else:
            status_code = report.get("status", 400)
            return jsonify(report), status_code

    except Exception as e:
        logger.error(f"Error in analyze_store_endpoint: {str(e)}")
        return jsonify({
            "error": f"Internal server error: {str(e)}",
            "success": False,
        }), 500


@app.route("/api/validate-store", methods=["POST"])
def validate_store():
    """
    Validate a store URL before analyzing
    
    Request body:
    {
        "store_url": "https://example.myshopify.com"
    }
    """
    try:
        data = request.get_json()
        store_url = data.get("store_url") or data.get("storeUrl")

        if not store_url:
            return jsonify({"error": "store_url is required"}), 400

        is_valid, message = validate_store_url(store_url)

        return jsonify({
            "valid": is_valid,
            "message": message,
            "url": store_url,
        }), 200

    except Exception as e:
        logger.error(f"Error in validate_store: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/store-info", methods=["POST"])
def get_store_info():
    """
    Get basic store information without full AI analysis
    
    Request body:
    {
        "store_url": "https://example.myshopify.com"
    }
    """
    try:
        data = request.get_json()
        store_url = data.get("store_url") or data.get("storeUrl")

        if not store_url:
            return jsonify({"error": "store_url is required"}), 400

        is_valid, _ = validate_store_url(store_url)
        if not is_valid:
            return jsonify({"error": "Invalid store URL"}), 400

        store_data = fetch_store_data(store_url)

        if "error" in store_data:
            return jsonify(store_data), 400

        return jsonify({
            "success": True,
            "data": store_data,
        }), 200

    except Exception as e:
        logger.error(f"Error in get_store_info: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # Run the Flask app
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV") == "development"
    app.run(host="0.0.0.0", port=port, debug=debug)
