"""
Example and Testing Script for Store Analyzer API
Tests the API endpoints and demonstrates usage
"""

import requests
import json
from typing import Dict, Any
import time

# Configuration
API_BASE_URL = "http://localhost:5000"
TIMEOUT = 60  # seconds

# Test stores
TEST_STORES = [
    "https://www.shopify.com",  # Well-known store
    "https://example.myshopify.com",  # Example
]


class StoreAnalyzerClient:
    """Client for Store Analyzer API"""

    def __init__(self, base_url: str = API_BASE_URL, timeout: int = TIMEOUT):
        self.base_url = base_url
        self.timeout = timeout

    def health_check(self) -> Dict[str, Any]:
        """Check API health"""
        print("\n📋 Health Check")
        print("-" * 50)
        try:
            response = requests.get(f"{self.base_url}/health", timeout=self.timeout)
            response.raise_for_status()
            data = response.json()
            print(f"✅ API Status: {data.get('status')}")
            print(f"   Version: {data.get('api_version')}")
            print(f"   Timestamp: {data.get('timestamp')}")
            return data
        except Exception as e:
            print(f"❌ Error: {e}")
            return {"error": str(e)}

    def validate_url(self, store_url: str) -> Dict[str, Any]:
        """Validate store URL"""
        print(f"\n🔍 Validating URL: {store_url}")
        print("-" * 50)
        try:
            response = requests.post(
                f"{self.base_url}/api/validate-store",
                json={"store_url": store_url},
                timeout=self.timeout,
            )
            response.raise_for_status()
            data = response.json()
            valid = data.get("valid")
            print(f"{'✅' if valid else '❌'} Valid: {valid}")
            print(f"   Message: {data.get('message')}")
            return data
        except Exception as e:
            print(f"❌ Error: {e}")
            return {"error": str(e)}

    def get_store_info(self, store_url: str) -> Dict[str, Any]:
        """Get basic store information"""
        print(f"\n📊 Getting Store Info: {store_url}")
        print("-" * 50)
        try:
            response = requests.post(
                f"{self.base_url}/api/store-info",
                json={"store_url": store_url},
                timeout=self.timeout,
            )
            response.raise_for_status()
            data = response.json()
            if data.get("success"):
                info = data.get("data", {})
                print(f"✅ Title: {info.get('title')}")
                print(f"   Response Time: {info.get('response_time', 0):.2f}s")
                print(f"   HTTPS: {'✓' if info.get('has_https') else '✗'}")
                print(f"   Status Code: {info.get('status_code')}")
                if info.get("meta_description"):
                    desc = info.get("meta_description")[:60] + "..."
                    print(f"   Description: {desc}")
            else:
                print(f"❌ Error: {data.get('error')}")
            return data
        except Exception as e:
            print(f"❌ Error: {e}")
            return {"error": str(e)}

    def analyze_store(self, store_url: str, store_name: str = None) -> Dict[str, Any]:
        """Analyze store (full analysis)"""
        print(f"\n🔬 Analyzing Store: {store_url}")
        print("-" * 50)
        print("⏳ This may take 30-60 seconds...\n")

        try:
            payload = {"store_url": store_url}
            if store_name:
                payload["store_name"] = store_name

            start_time = time.time()
            response = requests.post(
                f"{self.base_url}/api/analyze-store",
                json=payload,
                timeout=self.timeout,
            )
            elapsed = time.time() - start_time

            response.raise_for_status()
            data = response.json()

            if data.get("success"):
                analysis = data.get("analysis", {})
                store_info = data.get("store_info", {})

                print(f"✅ Analysis Complete (took {elapsed:.1f}s)")
                print(f"\n📈 Store Info:")
                print(f"   Title: {store_info.get('title')}")
                print(f"   HTTPS: {'✓' if store_info.get('https_enabled') else '✗'}")
                print(f"   Response Time: {store_info.get('response_time_seconds', 0):.2f}s")

                score = analysis.get("overall_score")
                print(f"\n🎯 Overall Score: {score}")

                if score:
                    if score >= 85:
                        rating = "EXCELLENT"
                    elif score >= 70:
                        rating = "GOOD"
                    elif score >= 50:
                        rating = "FAIR"
                    else:
                        rating = "NEEDS IMPROVEMENT"
                    print(f"   Rating: {rating}")

                report = analysis.get("audit_report")
                if report:
                    print(f"\n📄 Audit Report Preview:")
                    print("-" * 50)
                    # Print first 500 characters of report
                    preview = report[:500] + "..." if len(report) > 500 else report
                    print(preview)
                    print("\n[Full report in response object]")

            else:
                print(f"❌ Analysis Failed: {data.get('error')}")
                if data.get("status") == 429:
                    print("   💡 Tip: Rate limit exceeded, wait a moment and try again")
                elif data.get("status") == 402:
                    print("   💡 Tip: API credits exhausted, add funds to your account")

            return data

        except requests.exceptions.Timeout:
            print(f"❌ Request Timeout: Analysis took too long (> {self.timeout}s)")
            return {"error": "Request timeout"}
        except Exception as e:
            print(f"❌ Error: {e}")
            return {"error": str(e)}


def print_summary(results: Dict[str, Any]):
    """Print summary of test results"""
    print("\n\n" + "=" * 70)
    print("SUMMARY OF API TESTS".center(70))
    print("=" * 70)
    for test_name, result in results.items():
        status = "✅ PASS" if result.get("success") or not result.get("error") else "❌ FAIL"
        print(f"{test_name:30} {status}")
    print("=" * 70)


def main():
    """Run test suite"""
    print("\n" + "=" * 70)
    print("Store Analyzer API - Testing Suite".center(70))
    print("=" * 70)

    client = StoreAnalyzerClient()
    results = {}

    # 1. Health Check
    health = client.health_check()
    results["Health Check"] = health
    if "error" in health:
        print("\n⚠️  API is not running. Start it with: python store_analyzer_api.py")
        print_summary(results)
        return

    # 2. Validate URL
    validation = client.validate_url("https://example.myshopify.com")
    results["URL Validation"] = validation

    # 3. Get Store Info
    store_info = client.get_store_info("https://www.shopify.com")
    results["Get Store Info"] = store_info

    # 4. Full Store Analysis
    print("\n" + "=" * 70)
    print("Starting Full Store Analysis".center(70))
    print("This is the main feature and may take a minute...".center(70))
    print("=" * 70)

    analysis = client.analyze_store("https://example.myshopify.com")
    results["Full Store Analysis"] = analysis

    # Print summary
    print_summary(results)

    # Save results to file
    with open("test_results.json", "w") as f:
        # Convert non-serializable objects
        save_results = {}
        for key, value in results.items():
            save_results[key] = value if not isinstance(value, dict) else value
        json.dump(save_results, f, indent=2, default=str)

    print("\n✅ Test results saved to test_results.json")
    print("\n💡 Tips:")
    print("   • Full analysis takes 30-60 seconds")
    print("   • Check API console for detailed logging")
    print("   • Ensure LOVABLE_API_KEY is set in .env")


def interactive_mode():
    """Interactive mode for manual testing"""
    print("\n" + "=" * 70)
    print("Store Analyzer API - Interactive Mode".center(70))
    print("=" * 70)

    client = StoreAnalyzerClient()

    # Check health first
    health = client.health_check()
    if "error" in health:
        print("\n⚠️  API is not running!")
        return

    while True:
        print("\n" + "-" * 70)
        print("Options:")
        print("  1. Validate URL")
        print("  2. Get Store Info (fast)")
        print("  3. Analyze Store (slow, requires AI)")
        print("  4. Exit")
        print("-" * 70)

        choice = input("Select option (1-4): ").strip()

        if choice == "1":
            url = input("Enter store URL: ").strip()
            if url:
                client.validate_url(url)

        elif choice == "2":
            url = input("Enter store URL: ").strip()
            if url:
                client.get_store_info(url)

        elif choice == "3":
            url = input("Enter store URL: ").strip()
            if url:
                client.analyze_store(url)

        elif choice == "4":
            print("\nGoodbye!")
            break

        else:
            print("❌ Invalid option")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "--interactive":
        interactive_mode()
    else:
        main()
